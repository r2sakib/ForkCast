// utils/open-food-facts.ts
// Pure helpers that turn Open Food Facts data into values for our form.
import { Unit } from "@/types/food";

// Units written on packages -> our units. Anything else ("oz", "Quart") is counted as 1 pack.
const UNIT_MAP: Record<string, Unit> = {
  g: "g",
  gr: "g",
  kg: "kg",
  ml: "ml",
  l: "L",
  lt: "L",
  pc: "pcs",
  pcs: "pcs",
};

// "400.0 g" -> 400 g   |   "1l" -> 1 L   |   "6" -> 6 pcs   |   "1 Quart" -> 1 pack
export function parseOffQuantity(text: string): {
  quantity: string;
  unit: Unit;
} {
  const match = /^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]*)/.exec(text.trim());
  if (!match) return { quantity: "1", unit: "pcs" };

  const amount = Math.round(Number(match[1].replace(",", ".")) * 100) / 100;
  const unitText = match[2].toLowerCase();

  if (unitText === "") return { quantity: String(amount), unit: "pcs" };
  const unit = UNIT_MAP[unitText];
  if (!unit) return { quantity: "1", unit: "pack" };
  return { quantity: String(amount), unit };
}

// Open Food Facts category tags -> one of our 9 default category names.
// The order matters: "Eggs" is checked before "Dairy", "Bakery" before "Rice and Grains".
const CATEGORY_RULES: { name: string; tags: string[] }[] = [
  { name: "Eggs", tags: ["en:eggs"] },
  {
    name: "Dairy",
    tags: ["en:dairies", "en:milks", "en:cheeses", "en:yogurts", "en:butters"],
  },
  { name: "Fish", tags: ["en:fishes", "en:seafood"] },
  { name: "Meat", tags: ["en:meats", "en:poultries", "en:sausages"] },
  {
    name: "Bakery",
    tags: [
      "en:breads",
      "en:biscuits-and-cakes",
      "en:pastries",
      "en:viennoiseries",
    ],
  },
  {
    name: "Rice and Grains",
    tags: [
      "en:rices",
      "en:cereal-grains",
      "en:pastas",
      "en:cereals-and-their-products",
    ],
  },
  { name: "Fruits", tags: ["en:fruits", "en:fruits-based-foods"] },
  { name: "Vegetables", tags: ["en:vegetables", "en:vegetables-based-foods"] },
];

export function guessCategoryName(tags: string[]): string {
  const rule = CATEGORY_RULES.find((r) =>
    r.tags.some((tag) => tags.includes(tag)),
  );
  return rule?.name ?? "Other";
}
