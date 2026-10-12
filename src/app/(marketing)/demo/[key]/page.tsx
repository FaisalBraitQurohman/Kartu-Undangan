import { notFound } from "next/navigation";
import Link from "next/link";
import { isTemplateKey } from "@/templates/registry";
import { TemplateRenderer } from "@/templates/renderer";
import { demoContent } from "@/validators/invitation";
export default async function Demo({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ accent?: string }>;
}) {
  const { key } = await params;
  const { accent } = await searchParams;
  if (!isTemplateKey(key)) notFound();
  return (
    <main id="main">
      <div className="p-5 text-center text-xs">
        Demo undangan dengan data contoh.{" "}
        <Link className="underline" href="/templates">
          Pilih template
        </Link>
      </div>
      <TemplateRenderer
        templateKey={key}
        content={
          accent && /^#[0-9a-fA-F]{6}$/.test(accent)
            ? { ...demoContent, accent }
            : demoContent
        }
      />
    </main>
  );
}
