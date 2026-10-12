import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/utils";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const templates = process.env.DATABASE_URL
    ? await db.template
        .findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        })
        .catch(() => [])
    : [];
  return [
    ...[
      "",
      "/templates",
      "/cara-kerja",
      "/faq",
      "/contact",
      "/privacy",
      "/terms",
    ].map((p) => ({ url: `${appUrl()}${p}` })),
    ...templates.map((t) => ({
      url: `${appUrl()}/templates/${t.slug}`,
      lastModified: t.updatedAt,
    })),
  ];
}
