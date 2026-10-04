import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Révisions CM2",
  description: "Réviser le CM2 : dictées, conjugaison, grammaire, maths, géométrie.",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#6366f1", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-extrabold text-indigo-600">📚 Révisions CM2</Link>
            <Link href="/progression" className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">⭐ Ma progression</Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10">{children}</main>
        <footer className="py-4 text-center text-xs text-slate-400">Contenus alignés sur le programme du cycle 3 (BO n°16 du 17 avril 2025)</footer>
      </body>
    </html>
  );
}
