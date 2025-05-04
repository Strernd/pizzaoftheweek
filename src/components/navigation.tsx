import Link from "next/link"
import Logo from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navigation() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
      <Logo />
      <div className="flex items-center space-x-6">
        <Link
          href="/"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
        >
          Home
        </Link>
        <Link
          href="/dough-calculator"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
        >
          Dough Calculator
        </Link>
        <ThemeToggle />
      </div>
    </div>
  )
}
