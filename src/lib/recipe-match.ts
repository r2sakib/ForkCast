import { Recipe } from "@/data/recipes";

export interface RecipeMatch {
  recipe: Recipe;
  have: string[];
  missing: string[];
  score: number; // 0 to 1
}

const normalise = (s: string) => s.trim().toLowerCase();

// "Eggs" matches "egg", "Green Chilies" matches "green chili"...
function sameFood(a: string, b: string): boolean {
  const x = normalise(a);
  const y = normalise(b);
  if (!x || !y) return false;
  return x.includes(y) || y.includes(x);
}

export function matchRecipe(recipe: Recipe, foodNames: string[]): RecipeMatch {
  const have: string[] = [];
  const missing: string[] = [];

  recipe.ingredients.forEach((ing) => {
    const owned = foodNames.some((f) => sameFood(f, ing.name));
    (owned ? have : missing).push(ing.name);
  });

  return { recipe, have, missing, score: have.length / recipe.ingredients.length };
}

// Best matches first
export function rankRecipes(recipes: Recipe[], foodNames: string[]): RecipeMatch[] {
  return recipes
    .map((r) => matchRecipe(r, foodNames))
    .sort((a, b) => b.score - a.score);
}