#!/usr/bin/env python3
"""Génère l'audio des dictées avec Piper TTS (voix neuronale libre, hors ligne).

Usage : uv run --with piper-tts==1.8.0 scripts/generate_audio.py   (ffmpeg requis)

Voix : fr_FR-siwis-medium — dataset SIWIS, licence CC-BY 4.0
(https://huggingface.co/rhasspy/piper-voices/blob/main/fr/fr_FR/siwis/medium/MODEL_CARD)

Sortie : public/audio/<id>/*.mp3 et src/content/dictees.audio.json
"""
import json, re, shutil, subprocess, tempfile, urllib.request, wave

import numpy as np
from pathlib import Path

from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
VOICE = "fr_FR-siwis-medium"
VOICE_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/" + VOICE
CACHE = ROOT / ".cache" / "piper"
ABBR = {"M.": "Monsieur", "Mme": "Madame", "MM.": "Messieurs",
        "CM2": "C\u00a0M\u00a02", "CM1": "C\u00a0M\u00a01", "CE2": "C\u00a0E\u00a02", "CP": "C\u00a0P"}
PUNCT = {",": "virgule", ";": "point-virgule", ":": "deux-points", ".": "point",
         "!": "point d'exclamation", "?": "point d'interrogation"}
MAX_WORDS = 8
WORD_GAP = 0.35   # silence entre deux mots (s) — aide l'élève à séparer les mots
PUNCT_GAP = 0.6   # silence autour de la ponctuation dictée (s)
# Mots suivis d'une liaison obligatoire devant voyelle : prononcés avec le mot suivant
LIAISON = {"les", "des", "ces", "mes", "tes", "ses", "nos", "vos", "leurs", "aux", "un", "deux", "trois",
           "ils", "elles", "on", "nous", "vous", "en", "dans", "très", "plus", "sans", "chez", "petit", "grand", "tout"}
VOWEL = re.compile(r"^[aeiouyàâäéèêëîïôöùûüœæ]", re.I)


def sentences(text: str) -> list[str]:
    out, cur = [], []
    for w in text.split(" "):
        cur.append(w)
        if w[-1] in ".!?" and w not in ABBR:
            out.append(" ".join(cur)); cur = []
    if cur:
        out.append(" ".join(cur))
    return out


def nwords(s: str) -> int:
    return len(re.findall(r"[\w'-]+", s))


# Mots-outils : on ne coupe jamais juste APRÈS eux (ils annoncent la suite du groupe)
FUNCTION = {"le", "la", "les", "l'", "un", "une", "des", "du", "de", "d'", "au", "aux", "à", "ce", "cet", "cette", "ces",
            "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs",
            "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "ne", "n'", "se", "s'", "me", "te", "y", "en",
            "qui", "que", "qu'", "dont", "où", "et", "ou", "mais", "car", "donc", "or", "ni", "par", "pour", "sur", "sous",
            "dans", "avec", "sans", "chez", "vers", "entre", "très", "plus", "moins", "si", "tout", "toute", "tous", "toutes"}
# Mots lus attachés au suivant en mode « mots espacés »
CLITIC = {"le", "la", "les", "l'", "un", "une", "des", "du", "au", "aux", "ce", "cet", "cette", "ces", "mon", "ma", "mes",
          "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs", "je", "tu", "il", "elle",
          "on", "ils", "elles", "ne", "n'", "se", "s'", "me", "te", "y", "en", "d'", "qu'",
          "de", "à", "dans", "par", "pour", "sur", "sous", "avec", "sans", "chez", "vers", "même"}
# Mots qui ouvrent un nouveau groupe : bon endroit pour couper AVANT eux
STARTERS = {"et", "ou", "mais", "car", "donc", "qui", "que", "qu'", "dont", "où", "quand", "lorsque", "comme", "puis",
            "dans", "par", "pour", "sur", "sous", "avec", "sans", "chez", "vers", "depuis", "pendant", "avant", "après",
            "à", "au", "aux", "de", "du", "des", "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"}


def _key(w: str) -> str:
    w = w.lower().strip(",;:.!?«»\"")
    m = re.match(r"^(l'|d'|qu'|n'|s')", w)
    return m.group(1) if m else w


def _split(words: list[str]) -> list[list[str]]:
    """Coupe un groupe trop long à la frontière syntaxique la plus proche du milieu."""
    if nwords(" ".join(words)) <= MAX_WORDS:
        return [words]
    mid, best = len(words) / 2, None
    for i in range(2, len(words) - 1):
        if _key(words[i - 1]) in FUNCTION:
            continue  # « de / la même façon » interdit
        score = abs(i - mid) - (3 if _key(words[i]) in STARTERS else 0)
        if best is None or score < best[0]:
            best = (score, i)
    if best is None:
        return [words]
    i = best[1]
    return _split(words[:i]) + _split(words[i:])


def segments(sentence: str) -> list[str]:
    """Groupes de souffle : coupe d'abord à la ponctuation, puis aux frontières de groupes syntaxiques."""
    chunks, cur = [], []
    for w in sentence.split(" "):
        cur.append(w)
        if w[-1] in ",;:" and w not in ABBR:
            chunks.append(cur); cur = []
    if cur:
        chunks.append(cur)
    out = []
    for c in chunks:
        out += [" ".join(p) for p in _split(c)]
    return out


def spoken(seg: str, punct: bool = True) -> str:
    for k, v in ABBR.items():
        seg = re.sub(r"(?<!\w)" + re.escape(k) + r"(?!\w)", v, seg)
    if punct:
        seg = re.sub(r"\s*([,;:.!?])", lambda m: f", {PUNCT[m.group(1)]},", seg).rstrip(",") + "."
    return seg


def main() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    for ext in (".onnx", ".onnx.json"):
        f = CACHE / (VOICE + ext)
        if not f.exists():
            urllib.request.urlretrieve(VOICE_URL + ext, f)
    voice = PiperVoice.load(str(CACHE / (VOICE + ".onnx")))
    slow = SynthesisConfig(length_scale=1.2)
    natural = SynthesisConfig(length_scale=1.05)

    def trimmed(text: str, cfg: SynthesisConfig) -> np.ndarray:
        audio = np.concatenate([c.audio_float_array for c in voice.synthesize(text, syn_config=cfg)])
        loud = np.flatnonzero(np.abs(audio) > 0.02)
        return audio[max(0, loud[0] - 300): loud[-1] + 600] if loud.size else audio

    def synth_spaced(seg: str, dest: Path, cfg: SynthesisConfig) -> None:
        """Lit le segment mot par mot, séparé par des silences (liaisons conservées)."""
        rate = voice.config.sample_rate
        words = re.sub(r"\s*([,;:.!?])", r" \1", spoken(seg, punct=False)).split(" ")
        units, i = [], 0
        while i < len(words):
            w = words[i]
            if w in PUNCT:
                units.append((PUNCT[w], True)); i += 1; continue
            # Regroupe déterminant/pronom + mot suivant (« le loup », « s'en allaient ») et les liaisons
            j = i
            while j + 1 < len(words) and words[j + 1] not in PUNCT and (
                    _key(words[j]) in CLITIC or (words[j].lower() in LIAISON and VOWEL.match(words[j + 1]))):
                j += 1
            units.append((" ".join(words[i:j + 1]), False)); i = j + 1
        parts = []
        for k, (u, is_punct) in enumerate(units):
            if k:
                parts.append(np.zeros(int(rate * (PUNCT_GAP if is_punct or units[k - 1][1] else WORD_GAP)), dtype=np.float32))
            parts.append(trimmed(u, cfg))
        pcm = (np.clip(np.concatenate(parts), -1, 1) * 32767).astype(np.int16)
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            with wave.open(tmp.name, "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(pcm.tobytes())
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-ac", "1", "-b:a", "48k", str(dest)], check=True)

    def synth(text: str, dest: Path, cfg: SynthesisConfig) -> None:
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            with wave.open(tmp.name, "wb") as w:
                voice.synthesize_wav(text, w, syn_config=cfg)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-ac", "1", "-b:a", "48k", str(dest)], check=True)

    dictees = json.loads((ROOT / "src/content/dictees.json").read_text())
    index = {}
    for d in dictees:
        out = ROOT / "public/audio" / d["id"]
        shutil.rmtree(out, ignore_errors=True); out.mkdir(parents=True)
        synth(spoken(d["text"], punct=False), out / "full.mp3", natural)
        sents, n = [], 0
        for s in sentences(d["text"]):
            segs = []
            for seg in segments(s):
                name = f"{n:02d}.mp3"; n += 1
                synth(spoken(seg), out / name, slow)
                synth_spaced(seg, out / name.replace(".mp3", "-lent.mp3"), slow)
                segs.append({"text": seg, "audio": f"/audio/{d['id']}/{name}",
                             "spaced": f"/audio/{d['id']}/{name.replace('.mp3', '-lent.mp3')}"})
            sents.append({"text": s, "segments": segs})
        index[d["id"]] = {"voice": VOICE, "full": f"/audio/{d['id']}/full.mp3", "sentences": sents}
        print(d["id"], n, "segments")
    (ROOT / "src/content/dictees.audio.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
