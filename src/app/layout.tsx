import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pizza Of The Week | Weekly Pizza Inspiration",
  description:
    "Discover three new pizza topping ideas every week to inspire your homemade creations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍕</text></svg>"
        ></link>
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="pizza-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
