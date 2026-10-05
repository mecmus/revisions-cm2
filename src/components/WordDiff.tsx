import type { Token } from "@/lib/correction";
import { classify, ERROR_LABEL } from "@/lib/errorType";

export default function WordDiff({ tokens, hideTypes = false }: { tokens: Token[]; hideTypes?: boolean }) {
  return (
    <p className="text-lg leading-loose">
      {tokens.map((t, i) => {
        if (t.ok) return <span key={i}>{t.expected} </span>;
        const k = classify(t);
        return (
          <span key={i} className="mr-1 inline-flex flex-col rounded-lg bg-rose-50 px-1 align-top leading-tight">
            <span className="font-bold text-emerald-700">{t.expected || "∅"}</span>
            <span className="text-sm text-rose-600 line-through">{t.given ?? "(oublié)"}</span>
            {!hideTypes && k && <span className="text-[10px] font-semibold uppercase text-slate-500">{ERROR_LABEL[k].label}</span>}
          </span>
        );
      })}
    </p>
  );
}
