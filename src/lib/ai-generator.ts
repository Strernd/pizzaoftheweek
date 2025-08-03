import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import {
  experimental_generateImage as generateImage,
  generateObject,
  generateText,
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
  const level1SubPrompts = {
    classic:
      "A classic italian/neapolitan pizza, that is simple, traditional and authentic.",
    modern:
      "A modern pizza, that is creative, innovative and exciting. It is using ingredients that are not commonly used on traditional pizza - but you will find the perfect balance between the ingredients. It can use tomato sauce as base, but it can also use a different sauce or base.",
    "non-tomato":
      "A pizza that is not using tomato sauce as base, but a different sauce or base. The other ingredients can be classic italian/neapolitan or more modern,creative ingredients.",
  };

  const previousIngredients = previousRecipes
    .filter((recipe) => recipe.type === type)
    .map((recipe) => recipe.ingredients)
    .map((ingredients, idx) => `Recipe ${idx + 1}: ${ingredients.join(", ")}`)
    .join("\n");

  const level1Prompt = `You are a world-class neapolitan pizza chef. You are famous for your classic and creative pizza inventions. Your restaurant has a weekly changing menu with 3 pizzas. For this weeks menu you need to invent a recipe for: ${level1SubPrompts[type]} Describe your recipe in as much detail as possible. Be specific about the ingredients, how they are prepared, how they are being used, e.g. cut size, preparation, and when to add them to the pizza - before baking or after baking. If a topping or base is made out of multiple ingredients, explicitly state how to make it. Here are ingredients from recipes you've used recently: ${previousIngredients} - Create recipes that are different from the ones you've used recently.`;

  const level1Result = await generateText({
    model: openai("gpt-4o"),
    prompt: level1Prompt,
  });
  console.log("Level 1 result", level1Result.text);

  const level2Prompt = `You are a world-class pizza food blogger. You are an expert in breaking down recipes you learnt from the best chefs into concise formats for your readers. You will be given a recipe. Come up with a one-sentence description of the essence of the recipe. Then create a list of all the toppings being used in the recipe in short format. If a topping is made out of multiple ingredients state the sub-ingredients and if needed a preparation adjective (e.g. sauted, chopped, pickled, ...) in parenthesis. Leave out the dough as an ingredient. Make sure to include the ingredients of the base if they are not obvious. Explictly state if a topping should be added after baking by adding (add after baking) otherwise the reader will assume it is added before baking. If no name was specified for the recipe, come up with a name that is descriptive and unique but make it sound classy and professional not quirky or punny. The recipe is: ${level1Result.text}`;

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: recipeSchema,
    prompt: level2Prompt,
  });

  console.log("Level 2 result", object);

  // Generate an image for the recipe
  const imageUrl = await generatePizzaImage(level1Result.text, type);

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
  recipeText: string,
  type: string
): Promise<string> {
  try {
    const imageDescriptionPrompt = `You are a world-class food photo prompting expert. You can describe any recipe perfectly to create a perfect prompt for an AI image generator. You will be given a pizza recipe, describe the visual composition as detailed as possible. List every ingredient and how it is being used on the pizza. Make sure to include the base if it is not obvious. Your description will be used as a prompt to generate an AI image. The image should be photorealistic, high-quality and professional. A close-up shot focusing on the toppings, showing the characteristic puffy, charred Neapolitan crust. Professional food photography, soft natural lighting, shallow depth of field. No text overlay. Background should be a simple wooden table. Here is the recipe: ${recipeText}`;

    const imageDescriptionResult = await generateText({
      model: openai("gpt-4o"),
      prompt: imageDescriptionPrompt,
    });

    console.log("Image description result", imageDescriptionResult.text);

    // Generate the image using DALL-E
    const { image } = await generateImage({
      model: openai.image("dall-e-3"),
      prompt: imageDescriptionResult.text,
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
    return `/placeholder.svg`;
  }
}
