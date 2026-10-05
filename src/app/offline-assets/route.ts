import audio from "@/content/dictees.audio.json";
import { dictees } from "@/content/dictees";
import { COURS } from "@/lib/cours";

export const dynamic = "force-static";
const BUILD = new Date().toISOString(); // figé au build → nouveau cache à chaque version

type A = Record<string, { full: string; sentences: { segments: { audio: string; spaced?: string }[] }[] }>;

/** Liste des ressources à mettre en cache par le service worker (pages + audio). */
export function GET() {
  const pages = ["/", "/dictees", "/conjugaison", "/grammaire", "/progression", ...dictees.map((d) => `/dictees/${d.id}`), "/cours", ...COURS.map((c) => `/cours/${c.id}`)];
  const files = new Set<string>(["/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png"]);
  for (const a of Object.values(audio as A)) {
    files.add(a.full);
    for (const s of a.sentences) for (const g of s.segments) { files.add(g.audio); if (g.spaced) files.add(g.spaced); }
  }
  return Response.json({ version: BUILD, pages, files: [...files] });
}
