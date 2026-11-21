// utils/recipe-match.ts
// Pure functions: which ingredients does the user already have?
import { Recipe } from "@/data/recipes";

export interface RecipeMatch {
  recipe: Recipe;
  have: string[]; // ingredients the user has
  missing: string[]; // ingredients the user still needs
  score: number; // 0 to 1: the share of ingredients the user has
}

const normalise = (text: string) => text.trim().toLowerCase();

// "Eggs" matches "egg", "Green Chilies" matches "green chili", "Cow Milk" matches "milk"
function sameFood(foodName: string, ingredient: string): boolean {
  const a = normalise(foodName);
  const b = normalise(ingredient);
  if (a.length === 0 || b.length === 0) return false;
  return a.includes(b) || b.includes(a);
}

export function matchRecipe(recipe: Recipe, foodNames: string[]): RecipeMatch {
  const have: string[] = [];
  const missing: string[] = [];
  for (const ingredient of recipe.ingredients) {
    const owned = foodNames.some((name) => sameFood(name, ingredient.name));
    (owned ? have : missing).push(ingredient.name);
  }
  return { recipe, have, missing, score: have.length / recipe.ingredients.length };
}

// Best match first. Equal scores keep the list order.
export function rankRecipes(recipes: Recipe[], foodNames: string[]): RecipeMatch[] {
  return recipes
    .map((recipe) => matchRecipe(recipe, foodNames))
    .sort((a, b) => b.score - a.score);
}