export type AccentOption = { name: string; value: string };
export const templatePresentation: Record<
  string,
  { styles: string[]; palette: AccentOption[]; surface: string }
> = {
  "minimalist-ivory": {
    styles: ["Minimalist", "Modern"],
    palette: [
      { name: "Champagne", value: "#b59a75" },
      { name: "Sage", value: "#82917b" },
      { name: "Espresso", value: "#3b302b" },
    ],
    surface: "ivory",
  },
  "romantic-bloom": {
    styles: ["Floral", "Romantic"],
    palette: [
      { name: "Rose", value: "#a67775" },
      { name: "Champagne", value: "#b59a75" },
      { name: "Espresso", value: "#3b302b" },
    ],
    surface: "bloom",
  },
  "royal-elegant": {
    styles: ["Luxury", "Classic"],
    palette: [
      { name: "Gold", value: "#c5a56b" },
      { name: "Champagne", value: "#dbc29b" },
      { name: "Ivory", value: "#f2eadc" },
    ],
    surface: "royal",
  },
  "emerald-garden": {
    styles: ["Botanical", "Floral"],
    palette: [
      { name: "Sage", value: "#a6b298" },
      { name: "Gold", value: "#c5a56b" },
      { name: "Ivory", value: "#f2eadc" },
    ],
    surface: "emerald",
  },
};
export const categoryLabels: Record<string, string> = {
  WEDDING: "Pernikahan",
  ENGAGEMENT: "Pertunangan",
  CELEBRATION: "Perayaan",
};
export type CatalogTemplate = {
  id: string;
  key: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isFree: boolean;
  thumbnailUrl: string;
};
