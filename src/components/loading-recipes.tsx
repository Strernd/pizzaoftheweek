import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingRecipes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border dark:border-gray-800 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-900 h-full flex flex-col"
        >
          <Skeleton className="h-64 w-full" />
          <div className="p-6 flex-1 flex flex-col">
            {/* Fixed height title skeleton */}
            <div className="h-16 mb-2">
              <Skeleton className="h-8 w-3/4" />
            </div>

            {/* Fixed height description skeleton */}
            <div className="h-24 mb-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Ingredients section skeleton */}
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
