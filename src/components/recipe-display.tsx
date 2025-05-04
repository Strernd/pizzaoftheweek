import RecipeCard from "@/components/recipe-card";
import { getRecipes } from "@/lib/recipes";

export default async function RecipeDisplay() {
  // Simulate a small delay to show loading state
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const recipes = await getRecipes();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 justify-items-center">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
