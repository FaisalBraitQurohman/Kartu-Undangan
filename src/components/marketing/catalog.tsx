import { activeTemplates } from "@/features/templates/service";
import { rendererSupported } from "@/templates/registry";
import { CatalogBrowser } from "./catalog-browser";
export async function Catalog() {
  const templates = process.env.DATABASE_URL
    ? await activeTemplates().catch(() => null)
    : null;
  if (templates === null)
    return (
      <div className="catalog-unavailable" role="status">
        Katalog sementara belum tersedia. Silakan kembali lagi nanti.
      </div>
    );
  return (
    <CatalogBrowser
      templates={templates
        .filter((t) => rendererSupported(t.key, t.version))
        .map(
          ({
            id,
            key,
            slug,
            name,
            description,
            category,
            price,
            isFree,
            thumbnailUrl,
          }) => ({
            id,
            key,
            slug,
            name,
            description,
            category,
            price,
            isFree,
            thumbnailUrl,
          }),
        )}
    />
  );
}
