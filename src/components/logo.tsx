import Link from "next/link"

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <div className="relative flex items-center">
        <div className="w-10 h-10 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <div className="ml-2 font-bold text-gray-900 dark:text-gray-50">
          <span>PizzaOfTheWeek</span>
          <span className="text-red-500 dark:text-red-400">.com</span>
        </div>
      </div>
    </Link>
  )
}
