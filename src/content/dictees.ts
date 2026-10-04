import raw from "./dictees.json";
import audio from "./dictees.audio.json";

export type Dictee = { id: string; title: string; source: string; theme: string; text: string };
export type Segment = { text: string; audio: string; spaced: string };
export type Sentence = { text: string; segments: Segment[] };
export type DicteeAudio = { voice: string; full: string; sentences: Sentence[] };

// Extraits d'œuvres du domaine public, reproduits à l'identique (source citée).
export const dictees: Dictee[] = raw;
export const dicteeAudio = audio as Record<string, DicteeAudio>;
