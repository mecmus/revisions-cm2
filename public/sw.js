/* Service worker — Révisions CM2 : fonctionne hors connexion. */
let CACHE = "cm2";
const ready = fetch("/offline-assets", { cache: "no-store" }).then((r) => r.json()).then((l) => { CACHE = "cm2-" + l.version; return l; });

async function precache() {
  const list = await ready;
  const cache = await caches.open(CACHE);
  const statics = new Set();
  for (const p of list.pages) {
    const res = await fetch(p, { cache: "no-store" });
    if (!res.ok) continue;
    const html = await res.clone().text();
    for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) statics.add(m[0]);
    await cache.put(p, res);
  }
  // fichiers en petits lots pour ne pas saturer les mobiles
  const all = [...list.files, ...statics];
  for (let i = 0; i < all.length; i += 20) await Promise.all(all.slice(i, i + 20).map((u) => cache.add(u).catch(() => {})));
}

self.addEventListener("install", (e) => { e.waitUntil(precache().then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(ready.then(() => caches.keys()).then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("message", (e) => { if (e.data === "refresh") e.waitUntil(precache()); });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // Pages et données Next (RSC) : réseau d'abord, cache en secours
  if (req.mode === "navigate" || url.searchParams.has("_rsc") || req.headers.get("RSC")) {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok && req.mode === "navigate") { const c = res.clone(); caches.open(CACHE).then((k) => k.put(url.pathname, c)); }
      return res;
    }).catch(async () => (await caches.match(url.pathname)) ?? (await caches.match("/")) ?? Response.error()));
    return;
  }
  // Fichiers statiques et audio : cache d'abord
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit ?? fetch(req).then((res) => {
    if (res.ok && (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/audio/"))) { const c = res.clone(); caches.open(CACHE).then((k) => k.put(req, c)); }
    return res;
  })));
});
