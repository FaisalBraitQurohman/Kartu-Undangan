import { z } from "./locale";
const text = (max = 200) => z.string().trim().max(max);
export const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Tautan hanya boleh huruf kecil, angka, dan tanda hubung.",
  );
export const eventSchema = z
  .object({
    title: text(100),
    description: text(500),
    startAt: z.union([z.iso.datetime(), z.literal("")]),
    endAt: z.union([z.iso.datetime(), z.literal("")]),
    venue: text(),
    address: text(500),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
  })
  .refine(
    (e) => !e.endAt || !e.startAt || new Date(e.endAt) > new Date(e.startAt),
    "Waktu selesai harus setelah waktu mulai.",
  );
export const contentSchema = z.object({
  greeting: text(500),
  partner1: text(100),
  partner2: text(100),
  partner1Full: text(),
  partner2Full: text(),
  family1: text(500),
  family2: text(500),
  quote: text(1000),
  events: z.array(eventSchema).max(10),
  story: z
    .array(
      z.object({ title: text(100), date: text(50), description: text(2000) }),
    )
    .max(20),
  gallery: z
    .array(z.object({ url: z.url().max(2000), caption: text() }))
    .max(30),
  musicUrl: z.union([z.url().max(2000), z.literal("")]),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  closing: text(1000),
});
export const settingsSchema = z.object({
  rsvpEnabled: z.boolean(),
  wishesEnabled: z.boolean(),
  moderateWishes: z.boolean(),
  allowRsvpUpdate: z.boolean(),
  maxAttendees: z.number().int().min(1).max(20),
});
export const invitationCreateSchema = z.object({
  templateId: z.string().min(1),
  title: text(150).min(2),
  slug: slugSchema,
});
export const invitationUpdateSchema = z.object({
  title: text(150).min(2),
  slug: slugSchema,
  revision: z.number().int().min(0),
  content: contentSchema,
  settings: settingsSchema,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});
export type InvitationContent = z.infer<typeof contentSchema>;
export type InvitationSettings = z.infer<typeof settingsSchema>;
export const defaultSettings: InvitationSettings = {
  rsvpEnabled: true,
  wishesEnabled: true,
  moderateWishes: true,
  allowRsvpUpdate: true,
  maxAttendees: 4,
};
export const defaultContent: InvitationContent = {
  greeting:
    "Dengan penuh kebahagiaan, kami mengundang Anda untuk merayakan hari istimewa kami.",
  partner1: "",
  partner2: "",
  partner1Full: "",
  partner2Full: "",
  family1: "",
  family2: "",
  quote: "Dua cerita bertemu, satu perjalanan dimulai.",
  events: [],
  story: [],
  gallery: [],
  musicUrl: "",
  accent: "#B59A75",
  closing: "Kehadiran dan doa Anda adalah hadiah terindah untuk kami.",
};
export const demoContent: InvitationContent = {
  ...defaultContent,
  partner1: "Alya",
  partner2: "Rizky",
  partner1Full: "Alya Putri",
  partner2Full: "Rizky Pratama",
  family1: "Putri dari Bapak Adi & Ibu Ratna",
  family2: "Putra dari Bapak Budi & Ibu Sari",
  events: [
    {
      title: "Akad & resepsi",
      description: "",
      startAt: "2027-06-12T03:00:00.000Z",
      endAt: "2027-06-12T07:00:00.000Z",
      venue: "Taman Senja",
      address: "Bandung, Jawa Barat",
      latitude: null,
      longitude: null,
    },
  ],
  story: [
    {
      title: "Pertemuan pertama",
      date: "2022",
      description:
        "Sebuah percakapan sederhana menjadi awal perjalanan panjang kami.",
    },
    {
      title: "Langkah bersama",
      date: "2026",
      description: "Kami memilih untuk menulis cerita berikutnya bersama.",
    },
  ],
};
