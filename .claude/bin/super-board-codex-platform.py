"""Native Windows permissions and environment for headless Codex workers."""
import json
import hashlib
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile


def _inline(value):
    if isinstance(value, dict):
        return '{' + ', '.join(json.dumps(str(k)) + '=' + _inline(v) for k, v in value.items()) + '}'
    return json.dumps(value)


def environment(root):
    env = os.environ.copy()
    env['SB_REPO_PATH'] = str(root)
    env['PYTHONUTF8'] = '1'
    if os.name == 'nt':
        # WinGet's per-user package directory can deny sandbox execution even
        # when its path is readable. Keep a verified local tool copy in the
        # repository runtime directory instead of changing machine-wide ACLs.
        executable = shutil.which('jq')
        if not executable:
            raise RuntimeError('jq is missing from PATH')
        tools = Path(root) / '.claude/super-board/tools'
        tools.mkdir(parents=True, exist_ok=True)
        source, destination = Path(executable), tools / 'jq.exe'
        if source.resolve() != destination.resolve():
            expected = hashlib.sha256(source.read_bytes()).digest()
            if not destination.exists() or hashlib.sha256(destination.read_bytes()).digest() != expected:
                with tempfile.NamedTemporaryFile(dir=tools, suffix='.exe', delete=False) as temporary:
                    temp_path = Path(temporary.name)
                try:
                    shutil.copyfile(source, temp_path)
                    if hashlib.sha256(temp_path.read_bytes()).digest() != expected:
                        raise RuntimeError('Local jq copy did not match installed executable')
                    try:
                        os.replace(temp_path, destination)
                    except PermissionError:
                        if not destination.exists() or hashlib.sha256(destination.read_bytes()).digest() != expected:
                            raise
                finally:
                    temp_path.unlink(missing_ok=True)
            if hashlib.sha256(destination.read_bytes()).digest() != expected:
                raise RuntimeError('Local jq copy did not match installed executable')
        env['PATH'] = str(tools) + os.pathsep + env.get('PATH', '')
        env['NPM_CONFIG_CACHE'] = str(Path(root) / '.claude/super-board/cache/npm')
        env.setdefault('PLAYWRIGHT_BROWSERS_PATH', str(Path(root) / '.claude/super-board/cache/browsers'))
        temp_dir = Path(root) / '.claude/super-board/cache/tmp'
        temp_dir.mkdir(parents=True, exist_ok=True)
        env['TEMP'] = env['TMP'] = str(temp_dir)
    if os.name == 'nt' and not env.get('GH_TOKEN') and not env.get('GITHUB_TOKEN'):
        # Sandbox users cannot access the owner's Windows credential manager.
        # Capture the authenticated CLI token in memory only. Never log it or
        # put it in command arguments, files, prompts or model output.
        result = subprocess.run(['gh', 'auth', 'token'], capture_output=True,
                                text=True, timeout=15)
        if result.returncode or not result.stdout.strip():
            raise RuntimeError('GitHub CLI authentication unavailable; run gh auth login')
        env['GH_TOKEN'] = result.stdout.strip()
    return env


def permission_arguments(name, writable_root, repository, env, git_dirs=()):
    """Keep writes scoped to the scratch router folder or lane workspace."""
    writable_root, repository = Path(writable_root).resolve(), Path(repository).resolve()
    filesystem = {':root': 'read', ':minimal': 'read',
                  ':workspace_roots': {'.': 'write'},
                  str(writable_root): 'write'}
    if repository != writable_root:
        filesystem[str(repository)] = 'read'
    for path in git_dirs:
        filesystem[str(Path(path).resolve())] = 'write'
    for tool in ('gh', 'jq', 'bash', 'python', 'python3', 'node', 'codex'):
        executable = shutil.which(tool, path=env.get('PATH'))
        if executable:
            directory = str(Path(executable).resolve().parent)
            if directory not in filesystem:
                filesystem[directory] = 'read'
    # Explicit Windows workspace roots give the native sandbox a capability
    # SID. A temp-only custom profile previously had no writable root SID.
    filters = {'*': 'include'}
    for key in env:
        if re.search('KEY|SECRET|PASSWORD|TOKEN', key, re.I) and key not in ('GH_TOKEN', 'GITHUB_TOKEN'):
            filters[key] = 'exclude'
    return ['-c', f'default_permissions={json.dumps(name)}',
            '-c', f'permissions.{name}.filesystem={_inline(filesystem)}',
            '-c', f'permissions.{name}.network.enabled=true',
            '-c', f'permissions.{name}.network.allow_local_binding=true',
            '-c', 'shell_environment_policy.inherit="all"',
            '-c', 'shell_environment_policy.ignore_default_excludes=true',
            '-c', 'shell_environment_policy.filters=' + _inline(filters)]


def terminate_tree(process, force=False):
    if os.name == 'nt':
        if process.poll() is not None:
            return
        subprocess.run(['taskkill', '/PID', str(process.pid), '/T', '/F'],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        import signal
        try:
            os.killpg(process.pid, signal.SIGKILL if force else signal.SIGTERM)
        except ProcessLookupError:
            pass
