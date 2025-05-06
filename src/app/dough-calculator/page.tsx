import DoughCalculator from "@/components/dough-calculator";
import Navigation from "@/components/navigation";
import Link from "next/link";

export default function DoughCalculatorPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <Navigation />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 sm:text-5xl sm:tracking-tight">
            Pizza Dough Calculator
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Calculate the perfect Neapolitan pizza dough recipe based on your
            parameters.
          </p>
        </div>

        <DoughCalculator />

        <footer className="mt-20 text-center text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} PizzaOfTheWeek.com | New inspiration
            every week |{" "}
            <Link href="https://strehl.dev/legal-notice" target="_blank">
              Legal Notice
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
