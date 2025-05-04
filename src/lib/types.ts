export interface Recipe {
  id: string
  name: string
  description: string
  type: "classic" | "modern" | "non-tomato"
  ingredients: string[] // Changed from toppings to ingredients
  imageUrl: string
  createdAt: string
}

export interface RecipeHistory {
  recipes: Recipe[]
  lastGenerated: string
}
