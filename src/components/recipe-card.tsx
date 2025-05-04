import type { Recipe } from "@/lib/types";
import Image from "next/image";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const type = {
    classic: "Classic",
    modern: "Modern",
    "non-tomato": "Non-Tomato base",
  }[recipe.type];
  return (
    <div className="border dark:border-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-gray-900 h-full flex flex-col max-w-lg">
      <div className="h-16 flex items-center justify-center">
        <p className="font-bold text-xl">{type}</p>
      </div>
      <div className="relative h-72 w-full">
        <Image
          src={recipe.imageUrl || "/placeholder.svg?height=600&width=800"}
          alt={`${recipe.name} - Neapolitan style pizza`}
          fill
          className="object-cover"
          sizes="(max-width: 512px) 100vw, 33vw"
          priority={true}
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        {/* Fixed height title container */}
        <div className="h-16 mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 line-clamp-2">
            {recipe.name}
          </h2>
        </div>

        {/* Fixed height description container */}
        <div className="h-36 mb-4">
          <p className="text-gray-600 dark:text-gray-400 line-clamp-5">
            {recipe.description}
          </p>
        </div>

        {/* Ingredients section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">
            Toppings
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
