#!/usr/bin/env python3
"""Génère l'audio des dictées avec Piper TTS (voix neuronale libre, hors ligne).

Usage : uv run --with piper-tts==1.8.0 scripts/generate_audio.py   (ffmpeg requis)

Voix : fr_FR-siwis-medium — dataset SIWIS, licence CC-BY 4.0
(https://huggingface.co/rhasspy/piper-voices/blob/main/fr/fr_FR/siwis/medium/MODEL_CARD)

Sortie : public/audio/<id>/*.mp3 et src/content/dictees.audio.json
"""
import json, re, shutil, subprocess, tempfile, urllib.request, wave
from pathlib import Path

from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
VOICE = "fr_FR-siwis-medium"
VOICE_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/" + VOICE
CACHE = ROOT / ".cache" / "piper"
ABBR = {"M.": "Monsieur", "Mme": "Madame", "MM.": "Messieurs"}
PUNCT = {",": "virgule", ";": "point-virgule", ":": "deux-points", ".": "point",
         "!": "point d'exclamation", "?": "point d'interrogation"}
MAX_WORDS = 7


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


def segments(sentence: str) -> list[str]:
    """Groupes de souffle : coupe après , ; : puis découpe les groupes trop longs."""
    chunks, cur = [], []
    for w in sentence.split(" "):
        cur.append(w)
        if w[-1] in ",;:" and w not in ABBR:
            chunks.append(cur); cur = []
    if cur:
        chunks.append(cur)
    out = []
    for c in chunks:
        n = nwords(" ".join(c))
        parts = max(1, -(-n // MAX_WORDS))
        size = -(-len(c) // parts)
        out += [" ".join(c[i:i + size]) for i in range(0, len(c), size)]
    return out


def spoken(seg: str, punct: bool = True) -> str:
    for k, v in ABBR.items():
        seg = seg.replace(k + " ", v + " ")
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
                segs.append({"text": seg, "audio": f"/audio/{d['id']}/{name}"})
            sents.append({"text": s, "segments": segs})
        index[d["id"]] = {"voice": VOICE, "full": f"/audio/{d['id']}/full.mp3", "sentences": sents}
        print(d["id"], n, "segments")
    (ROOT / "src/content/dictees.audio.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
