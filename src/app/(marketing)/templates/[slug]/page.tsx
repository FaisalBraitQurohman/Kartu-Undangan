import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth/guards";
import { isTemplateKey } from "@/templates/registry";
import { TemplateRenderer } from "@/templates/renderer";
import { demoContent } from "@/validators/invitation";
import { money } from "@/lib/utils";
import { TemplateAction } from "@/components/invitations/template-action";
export default async function TemplateDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!process.env.DATABASE_URL) notFound();
  const template = await db.template.findUnique({ where: { slug } });
  if (!template?.isActive || !isTemplateKey(template.key)) notFound();
  const user = await currentUser();
  const owned = user
    ? !!(await db.userTemplate.findUnique({
        where: {
          userId_templateId: { userId: user.id, templateId: template.id },
        },
      }))
    : false;
  return (
    <main id="main" className="container-page section-space">
      <div
        id="gunakan"
        className="mb-10 flex flex-wrap items-end justify-between gap-8"
      >
        <div>
          <span className="pill">{template.isFree ? "Gratis" : "Premium"}</span>
          <h1 className="display mt-5 text-4xl">{template.name}</h1>
          <p className="my-4 max-w-xl text-sm leading-7 text-muted-foreground">
            {template.description}
          </p>
          <p className="font-semibold">
            {template.isFree
              ? "Gratis"
              : `${money(template.price)} — sekali beli`}
          </p>
        </div>
        <TemplateAction
          templateId={template.id}
          authenticated={!!user}
          usable={template.isFree || owned}
        />
      </div>
      <p className="mb-4 text-center text-xs text-muted-foreground">
        Pratinjau dengan nama dan acara contoh. Isi undangan dapat Anda ubah.
      </p>
      <div className="overflow-hidden rounded-2xl border border-border">
        <TemplateRenderer templateKey={template.key} content={demoContent} />
      </div>
    </main>
  );
}
