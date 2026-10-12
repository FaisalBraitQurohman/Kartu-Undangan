import { notFound } from "next/navigation";
import Link from "next/link";
import { isTemplateKey } from "@/templates/registry";
import { TemplateRenderer } from "@/templates/renderer";
import { demoContent } from "@/validators/invitation";
export default async function Demo({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!isTemplateKey(key)) notFound();
  return (
    <main id="main">
      <div className="p-5 text-center text-xs">
        Demo undangan dengan data contoh.{" "}
        <Link className="underline" href="/templates">
          Pilih template
        </Link>
      </div>
      <TemplateRenderer templateKey={key} content={demoContent} />
    </main>
  );
}
