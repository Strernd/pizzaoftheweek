import { kv } from "@vercel/kv";
import { generateRecipes } from "./ai-generator";
import type { Recipe, RecipeHistory } from "./types";

const RECIPE_KEY = "pizza-recipes";
export const REVALIDATE_KEY = "pizza-revalidate";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CONTEXT_LIMIT = 21; // Limit for context to AI (last 21 recipes)

export async function getRecipes(): Promise<Recipe[]> {
  console.log("Fetching recipes. Thish should only be called once a week.");
  // Try to get recipes from KV store
  const storedData = await kv.get<RecipeHistory>(RECIPE_KEY);
  const shouldRevalidate = (await kv.get(REVALIDATE_KEY)) || false;

  console.log("Stored data:", storedData);

  // Check if we need to generate new recipes
  const needsNewRecipes =
    !storedData ||
    new Date().getTime() - new Date(storedData.lastGenerated).getTime() >
      ONE_WEEK_MS;

  if (needsNewRecipes || shouldRevalidate) {
    await kv.set(REVALIDATE_KEY, false); // Reset revalidate flag
    // Get previous recipes to avoid duplicates (use all stored recipes)
    const previousRecipes = storedData?.recipes || [];

    // Generate new recipes (passing the last CONTEXT_LIMIT recipes for context)
    if (process.env.NODE_ENV !== "production") {
      console.log("Should generate here - but skipping on dev");
      return previousRecipes.slice(0, 3);
    }
    const newRecipes = await generateRecipes(
      previousRecipes.slice(0, CONTEXT_LIMIT)
    );

    // Store ALL recipes (new ones first, then all previous ones)
    const allRecipes = [...newRecipes, ...previousRecipes];

    // Store the new recipes and timestamp
    const recipeHistory: RecipeHistory = {
      recipes: allRecipes,
      lastGenerated: new Date().toISOString(),
    };

    await kv.set(RECIPE_KEY, recipeHistory);
    return newRecipes;
  }

  // Return existing recipes (just the newest 3)
  return storedData.recipes.slice(0, 3);
}
