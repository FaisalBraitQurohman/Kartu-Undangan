import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

const directory = resolve(process.env.LOCAL_MAIL_DIR || ".local/mail");
try {
  const files = (await readdir(directory))
    .filter((name) => name.endsWith(".txt"))
    .sort()
    .reverse();
  console.log("Inbox email development lokal (tidak dikirim ke internet):");
  console.log(directory);
  for (const file of files.slice(0, 20)) console.log(resolve(directory, file));
  if (!files.length)
    console.log(
      "Belum ada email. Daftar akun melalui aplikasi terlebih dahulu.",
    );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  console.log(
    "Belum ada inbox. Daftar akun melalui aplikasi setelah local:setup.",
  );
}
