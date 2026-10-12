import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { uploadMedia, deleteMedia } from "@/lib/storage/cloudinary";
import {
  createInvitation,
  updateInvitation,
} from "@/features/invitations/service";
import { defaultContent, defaultSettings } from "@/validators/invitation";
const cloud = vi.hoisted(() => ({
  bytes: 4,
  destroy: vi.fn().mockResolvedValue({ result: "ok" }),
  sequence: 0,
}));
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      destroy: cloud.destroy,
      upload_stream: vi.fn((_options, callback) => ({
        end: () =>
          callback(null, {
            public_id: `test/${++cloud.sequence}`,
            secure_url: `https://res.cloudinary.com/test/image/upload/test-${cloud.sequence}.jpg`,
            bytes: cloud.bytes,
          }),
      })),
    },
  },
}));
describe.skipIf(!process.env.TEST_DATABASE_URL)(
  "Media ownership and quotas (mocked Cloudinary)",
  () => {
    const prefix = `media-${randomBytes(6).toString("hex")}`;
    let ownerId = "",
      otherId = "",
      invitationId = "",
      slug = "";
    let mediaId = "",
      mediaUrl = "";
    const photo = () =>
      new File([new Uint8Array([255, 216, 255, 0])], "photo.jpg", {
        type: "image/jpeg",
      });
    beforeAll(async () => {
      vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test-boundary");
      vi.stubEnv("CLOUDINARY_API_KEY", "test-boundary");
      vi.stubEnv("CLOUDINARY_API_SECRET", "test-boundary");
      vi.stubEnv("MAX_USER_STORAGE_BYTES", "100");
      ownerId = (
        await db.user.create({
          data: {
            name: "Media QA",
            email: `${prefix}-a@example.test`,
            emailVerified: new Date(),
          },
        })
      ).id;
      otherId = (
        await db.user.create({
          data: {
            name: "Other QA",
            email: `${prefix}-b@example.test`,
            emailVerified: new Date(),
          },
        })
      ).id;
      const template = await db.template.findUniqueOrThrow({
        where: { key: "minimalist-ivory" },
      });
      slug = `${prefix}-invitation`;
      invitationId = (
        await createInvitation(ownerId, {
          templateId: template.id,
          title: "Media QA",
          slug,
        })
      ).id;
    });
    afterAll(async () => {
      vi.unstubAllEnvs();
      await db.auditLog.deleteMany({
        where: { actorId: { in: [ownerId, otherId] } },
      });
      await db.invitation.deleteMany({
        where: { userId: { in: [ownerId, otherId] } },
      });
      await db.userTemplate.deleteMany({
        where: { userId: { in: [ownerId, otherId] } },
      });
      await db.user.deleteMany({ where: { id: { in: [ownerId, otherId] } } });
      await db.$disconnect();
    });
    it("rejects another user's upload before contacting storage", async () => {
      await expect(
        uploadMedia(otherId, invitationId, photo()),
      ).rejects.toMatchObject({ status: 404 });
      expect(cloud.sequence).toBe(0);
    });
    it("persists a validated upload with authoritative bytes", async () => {
      const media = await uploadMedia(ownerId, invitationId, photo());
      mediaId = media.id;
      mediaUrl = media.url;
      expect(media.bytes).toBe(4);
      expect(media.publicId).toMatch(/^test\//);
    });
    it("enforces account quota transactionally and cleans up a rejected external upload", async () => {
      vi.stubEnv("MAX_USER_STORAGE_BYTES", "10");
      cloud.bytes = 8;
      await expect(
        uploadMedia(ownerId, invitationId, photo()),
      ).rejects.toMatchObject({ status: 422 });
      expect(cloud.destroy).toHaveBeenCalled();
      expect(await db.media.count({ where: { invitationId } })).toBe(1);
      cloud.bytes = 4;
      vi.stubEnv("MAX_USER_STORAGE_BYTES", "100");
    });
    it("protects attached assets and rejects unauthorized deletion", async () => {
      let invitation = await db.invitation.findUniqueOrThrow({
        where: { id: invitationId },
      });
      await updateInvitation(ownerId, invitationId, {
        title: invitation.title,
        slug,
        revision: invitation.revision,
        status: "DRAFT",
        settings: defaultSettings,
        content: {
          ...defaultContent,
          gallery: [{ url: mediaUrl, caption: "Photo" }],
        },
      });
      await expect(
        deleteMedia(otherId, invitationId, mediaId),
      ).rejects.toMatchObject({ status: 404 });
      await expect(
        deleteMedia(ownerId, invitationId, mediaId),
      ).rejects.toMatchObject({ status: 409 });
      invitation = await db.invitation.findUniqueOrThrow({
        where: { id: invitationId },
      });
      await updateInvitation(ownerId, invitationId, {
        title: invitation.title,
        slug,
        revision: invitation.revision,
        status: "DRAFT",
        settings: defaultSettings,
        content: defaultContent,
      });
      await deleteMedia(ownerId, invitationId, mediaId);
      expect(await db.media.count({ where: { invitationId } })).toBe(0);
    });
  },
);
