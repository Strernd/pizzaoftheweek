import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import {
  experimental_generateImage as generateImage,
  generateObject,
} from "ai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Recipe } from "./types";

// Schema for recipe generation - removed instructions field
const recipeSchema = z.object({
  name: z
    .string()
    .describe(
      "The name of the pizza recipe - should be authentic and professional sounding"
    ),
  description: z.string().describe("A brief description of the pizza"),
  ingredients: z
    .array(z.string())
    .describe("List of all ingredients needed for the pizza"),
});

// Function to generate pizza recipes
export async function generateRecipes(
  previousRecipes: Recipe[]
): Promise<Recipe[]> {
  // Generate the three types of recipes

  const classicRecipeGen = generateRecipeByType("classic", previousRecipes);
  const modernRecipeGen = generateRecipeByType("modern", previousRecipes);
  const nonTomatoRecipeGen = generateRecipeByType(
    "non-tomato",
    previousRecipes
  );

  const [classicRecipe, modernRecipe, nonTomatoRecipe] = await Promise.all([
    classicRecipeGen,
    modernRecipeGen,
    nonTomatoRecipeGen,
  ]);

  console.log("generated recipes");
  console.log(classicRecipe);
  console.log(modernRecipe);
  console.log(nonTomatoRecipe);

  return [classicRecipe, modernRecipe, nonTomatoRecipe];
}

async function generateRecipeByType(
  type: "classic" | "modern" | "non-tomato",
  previousRecipes: Recipe[]
): Promise<Recipe> {
  let prompt = "";

  switch (type) {
    case "classic":
      prompt =
        "Generate a classic italian/neapolitan pizza recipe with traditional ingredients. The name should be authentic and professional, not quirky or punny.";
      break;
    case "modern":
      prompt =
        "Generate a modern pizza recipe with creative ingredients. Think outside the box for ingredients and use ingredients thare are not commonly used on traditional pizza - but make sure the different ingredients harmonize. The name should be sophisticated and appealing, not quirky or punny. Do not use luxury or hard to get ingredients.";
      break;
    case "non-tomato":
      prompt =
        "Generate a pizza recipe that uses a non-tomato base (like white sauce, pesto, etc.). The othe ingredients can other be classic italian/neapolitan or more modern,creative ingredients. The name should be elegant and descriptive, not quirky or punny.";
      break;
  }

  prompt +=
    "Do not include dough in the ingredients list, only toppings. State the sauce/base explicitly every time. If the ingredients or sauce has to be made first explicitly state the ingredients of that topping in parenthesis, e.g. the ingredients of that specifico pesto. Do not list sub-ingredients that are obvious (e.g. ingredients of Fior di Latte). The recipe should be compatible with Neapolitan style pizza.";

  // Add context about previous recipes to avoid duplicates
  if (previousRecipes.length > 0) {
    // Filter to only include recipes of the same type
    const sameTypeRecipes = previousRecipes.filter(
      (recipe) => recipe.type === type
    );

    if (sameTypeRecipes.length > 0) {
      prompt +=
        "\n\nHere are previous pizza recipes of this type. Try to avoid generating similar names or ingredients:\n";

      sameTypeRecipes.forEach((recipe, index) => {
        prompt += `\n\n${index + 1}. ${recipe.name}\nDescription: ${
          recipe.description
        }\nIngredients: ${recipe.ingredients.join(", ")}`;
      });
    }
  }

  // Generate the recipe using AI SDK
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: recipeSchema,
    prompt,
  });

  // Generate an image for the recipe
  const imageUrl = await generatePizzaImage(
    object.name,
    object.ingredients,
    type
  );

  // Create the recipe object - note: no instructions field
  return {
    id: uuidv4(),
    name: object.name,
    description: object.description,
    type,
    ingredients: object.ingredients,
    imageUrl,
    createdAt: new Date().toISOString(),
  };
}

async function generatePizzaImage(
  pizzaName: string,
  ingredients: string[],
  type: string
): Promise<string> {
  try {
    // Create a detailed prompt for the image generation
    let basePrompt =
      "Photorealistic, high-quality image of a Neapolitan style pizza with exactly and only the ingredients specified within this prompt. Make sure the color of the base is matching the base that is used in the ingredients. ";

    basePrompt += `The ingredients/toppings are: ${ingredients.join(", ")}. `;

    // Add styling details
    basePrompt +=
      "Close-up shot focusing on the toppings, showing the characteristic puffy, charred Neapolitan crust. ";
    basePrompt +=
      "Professional food photography, soft natural lighting, shallow depth of field. No text overlay. Background should be a simple wooden table.";

    // Generate the image using DALL-E
    const { image } = await generateImage({
      model: openai.image("dall-e-3"),
      prompt: basePrompt,
      size: "1024x1024",
    });
    if (!image?.base64) {
      throw new Error("No image generated");
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image.base64, "base64");

    // Create a unique filename
    const filename = `pizza-${type}-${Date.now()}.png`;

    // Upload to Vercel Blob
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: true, // Adds a random suffix to prevent name collisions
    });

    // Return the URL to the uploaded blob
    return blob.url;
  } catch (error) {
    console.error("Error generating pizza image:", error);
    // Fallback to placeholder if image generation fails
    return `/placeholder.svg?height=600&width=800&query=delicious ${type} pizza called ${pizzaName}`;
  }
}
