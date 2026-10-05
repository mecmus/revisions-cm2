import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CoursFiche from "@/components/CoursFiche";
import { COURS, getCours } from "@/lib/cours";

export const dynamicParams = false;
export function generateStaticParams() { return COURS.map((c) => ({ slug: c.id.split("/") })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const c = getCours((await params).slug.join("/"));
  return { title: `${c?.titre ?? "Cours"} · Révisions CM2` };
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const c = getCours((await params).slug.join("/"));
  if (!c) notFound();
  return (
    <div className="space-y-4">
      <Link href="/cours" className="text-sky-600">← Tous les cours</Link>
      <div className="rounded-3xl bg-white p-6 shadow"><CoursFiche c={c} /></div>
    </div>
  );
}
