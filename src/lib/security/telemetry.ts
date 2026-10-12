export function telemetryUrl(raw: string) {
  try {
    const url = new URL(raw, "https://undangkita.invalid");
    url.search = "";
    url.hash = "";
    return /^https?:\/\//.test(raw) ? url.toString() : url.pathname;
  } catch {
    return "[url]";
  }
}
