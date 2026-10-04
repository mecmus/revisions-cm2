import Link from "next/link";
import { notFound } from "next/navigation";
import { dictees, dicteeAudio } from "@/content/dictees";
import DicteePlayer from "@/components/DicteePlayer";

export function generateStaticParams() {
  return dictees.map((d) => ({ id: d.id }));
}

export default async function DicteePage({ params }: PageProps<"/dictees/[id]">) {
  const { id } = await params;
  const d = dictees.find((x) => x.id === id);
  if (!d) notFound();
  return (
    <div>
      <Link href="/dictees" className="text-indigo-600">← Dictées</Link>
      <h1 className="mt-2 text-3xl font-extrabold">{d.title}</h1>
      <p className="text-sm text-slate-500">{d.source}</p>
      <DicteePlayer dictee={d} audio={dicteeAudio[d.id]} />
    </div>
  );
}
