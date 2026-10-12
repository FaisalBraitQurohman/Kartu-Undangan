import { contentSchema, defaultContent } from "@/validators/invitation";
export const templateKeys = [
  "minimalist-ivory",
  "royal-elegant",
  "romantic-bloom",
  "emerald-garden",
] as const;
export type TemplateKey = (typeof templateKeys)[number];
export const registry = {
  "minimalist-ivory": {
    version: 1,
    name: "Minimalist Ivory",
    subtitle: "Sederhana, hangat, tak lekang waktu",
    schema: contentSchema,
    defaultContent,
  },
  "royal-elegant": {
    version: 1,
    name: "Royal Elegant",
    subtitle: "Keanggunan klasik dalam setiap detail",
    schema: contentSchema,
    defaultContent,
  },
  "romantic-bloom": {
    version: 1,
    name: "Romantic Bloom",
    subtitle: "Sebuah cerita yang mekar dengan indah",
    schema: contentSchema,
    defaultContent,
  },
  "emerald-garden": {
    version: 1,
    name: "Emerald Garden",
    subtitle: "Di antara dedaunan, cinta bertumbuh",
    schema: contentSchema,
    defaultContent,
  },
} as const;
export function isTemplateKey(key: string): key is TemplateKey {
  return Object.hasOwn(registry, key);
}
export function rendererSupported(key: string, version: number) {
  return isTemplateKey(key) && registry[key].version === version;
}
