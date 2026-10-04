import type { Token } from "@/lib/correction";

export default function WordDiff({ tokens }: { tokens: Token[] }) {
  return (
    <p className="text-lg leading-loose">
      {tokens.map((t, i) => t.ok ? <span key={i}>{t.expected} </span> : (
        <span key={i} className="mr-1 inline-flex flex-col rounded-lg bg-rose-50 px-1 align-top leading-tight">
          <span className="font-bold text-emerald-700">{t.expected || "∅"}</span>
          <span className="text-sm text-rose-600 line-through">{t.given ?? "(oublié)"}</span>
        </span>
      ))}
    </p>
  );
}
