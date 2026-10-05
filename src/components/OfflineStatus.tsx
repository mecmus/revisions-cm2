"use client";
import { useEffect, useState } from "react";

/** Enregistre le service worker et affiche l'état hors ligne. */
export default function OfflineStatus() {
  const [state, setState] = useState<"none" | "loading" | "ready">("none");
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    up();
    addEventListener("online", up); addEventListener("offline", up);
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      navigator.serviceWorker.register("/sw.js").then((r) => {
        setState(r.active ? "ready" : "loading");
        navigator.serviceWorker.ready.then(() => setState("ready"));
      }).catch(() => setState("none"));
    }
    return () => { removeEventListener("online", up); removeEventListener("offline", up); };
  }, []);
  if (state === "none" && online) return null;
  return (
    <p className="text-center text-xs text-slate-500">
      {!online ? "📴 Hors connexion — tes exercices restent disponibles." : state === "ready" ? "✅ Disponible hors connexion" : "⏳ Préparation du mode hors connexion…"}
    </p>
  );
}
