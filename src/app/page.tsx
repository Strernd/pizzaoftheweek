import { Suspense } from "react"
import RecipeDisplay from "@/components/recipe-display"
import LoadingRecipes from "@/components/loading-recipes"
import Navigation from "@/components/navigation"

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <Navigation />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Pizza Of The Week
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Three new topping ideas every week to inspire your homemade pizzas.
            <span className="block mt-2 text-lg">#PizzaOfTheWeek</span>
          </p>
        </div>

        <Suspense fallback={<LoadingRecipes />}>
          <RecipeDisplay />
        </Suspense>

        <footer className="mt-20 text-center text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} PizzaOfTheWeek.com | New inspiration every week</p>
        </footer>
      </div>
    </main>
  )
}

// Set revalidation to occur once per week (in seconds)
export const revalidate = 604800 // 7 days
