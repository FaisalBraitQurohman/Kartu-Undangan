import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/db";
import { serializable } from "@/lib/db/transaction";
import { AppError } from "@/lib/security/errors";
import { ownedInvitation } from "@/features/invitations/service";
import { contentSchema } from "@/validators/invitation";
function configure() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  )
    throw new AppError(503, "Penyimpanan media belum dikonfigurasi.");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}
export function mediaKind(bytes: Buffer, mime: string) {
  if (
    mime === "image/jpeg" &&
    bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
  )
    return "IMAGE" as const;
  if (
    mime === "image/png" &&
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "IMAGE" as const;
  if (
    mime === "image/webp" &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  )
    return "IMAGE" as const;
  if (
    (mime === "audio/mpeg" &&
      (bytes.toString("ascii", 0, 3) === "ID3" ||
        (bytes[0] === 255 && (bytes[1] & 224) === 224))) ||
    (mime === "audio/ogg" && bytes.toString("ascii", 0, 4) === "OggS")
  )
    return "AUDIO" as const;
  throw new AppError(422, "Gunakan JPG, PNG, WebP, MP3, atau OGG yang valid.");
}
export async function uploadMedia(
  userId: string,
  invitationId: string,
  file: File,
) {
  await ownedInvitation(userId, invitationId);
  if (file.size > 4 * 1024 * 1024 || !file.size)
    throw new AppError(413, "Ukuran berkas harus 1 byte hingga 4 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const type = mediaKind(bytes, file.type);
  if (type === "IMAGE" && file.size > 3 * 1024 * 1024)
    throw new AppError(413, "Foto maksimal 3 MB.");
  const storageLimit = Number(process.env.MAX_USER_STORAGE_BYTES || 209715200);
  if (
    !Number.isSafeInteger(storageLimit) ||
    storageLimit < 1 ||
    storageLimit > 2147483647
  )
    throw new AppError(503, "Konfigurasi penyimpanan tidak valid.");
  const used = await db.media.aggregate({
    where: { invitation: { userId } },
    _sum: { bytes: true },
  });
  if ((used._sum.bytes || 0) + file.size > storageLimit)
    throw new AppError(
      422,
      "Kuota penyimpanan akun sudah penuh. Hapus berkas yang tidak digunakan.",
    );
  if (
    (await db.media.count({ where: { invitationId, type } })) >=
    (type === "IMAGE" ? 30 : 1)
  )
    throw new AppError(422, "Batas media undangan sudah tercapai.");
  configure();
  const resourceType = type === "IMAGE" ? "image" : "video";
  const result = await new Promise<{
    public_id: string;
    secure_url: string;
    bytes: number;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `undangkita/${userId}/${invitationId}`,
        resource_type: resourceType,
        allowed_formats:
          type === "IMAGE" ? ["jpg", "png", "webp"] : ["mp3", "ogg"],
        ...(type === "IMAGE"
          ? {
              transformation: [
                { width: 2000, height: 2000, crop: "limit", quality: "auto" },
              ],
            }
          : {}),
      },
      (error, uploaded) => {
        if (error || !uploaded) reject(error || new Error("Upload failed"));
        else resolve(uploaded);
      },
    );
    stream.end(bytes);
  });
  try {
    return await serializable(async (tx) => {
      await ownedInvitation(userId, invitationId, tx);
      const used = await tx.media.aggregate({
        where: { invitation: { userId } },
        _sum: { bytes: true },
      });
      if ((used._sum.bytes || 0) + result.bytes > storageLimit)
        throw new AppError(422, "Kuota penyimpanan akun sudah penuh.");
      const count = await tx.media.count({ where: { invitationId, type } });
      if (count >= (type === "IMAGE" ? 30 : 1))
        throw new AppError(
          422,
          "Batas media: 30 foto dan satu musik per undangan.",
        );
      return tx.media.create({
        data: {
          invitationId,
          publicId: result.public_id,
          url: result.secure_url,
          type,
          bytes: result.bytes,
        },
      });
    });
  } catch (error) {
    await cloudinary.uploader.destroy(result.public_id, {
      resource_type: resourceType,
    });
    throw error;
  }
}
export async function deleteMedia(
  userId: string,
  invitationId: string,
  id: string,
) {
  const media = await serializable(async (tx) => {
    const invitation = await ownedInvitation(userId, invitationId, tx);
    const asset = await tx.media.findFirst({ where: { id, invitationId } });
    if (!asset) throw new AppError(404, "Media tidak ditemukan.");
    const content = contentSchema.parse(invitation.content);
    if (
      content.gallery.some((g) => g.url === asset.url) ||
      content.musicUrl === asset.url
    )
      throw new AppError(
        409,
        "Hapus media dari galeri atau musik, lalu simpan undangan sebelum menghapus berkas.",
      );
    await tx.media.update({ where: { id }, data: { deletingAt: new Date() } });
    return asset;
  });
  configure();
  try {
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.type === "AUDIO" ? "video" : "image",
      invalidate: true,
    });
  } catch (error) {
    await db.media.update({ where: { id }, data: { deletingAt: null } });
    throw error;
  }
  await db.media.delete({ where: { id } });
}
