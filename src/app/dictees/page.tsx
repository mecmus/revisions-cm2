import Link from "next/link";
import { dictees } from "@/content/dictees";
import DicteeList from "@/components/DicteeList";

export default function DicteesPage() {
  return (
    <div>
      <Link href="/" className="text-indigo-600">← Accueil</Link>
      <h1 className="mt-2 text-3xl font-extrabold">✍️ Dictées</h1>
      <DicteeList dictees={dictees} />
    </div>
  );
}
