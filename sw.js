// bump CACHE to force clients to pick up a new shell
const CACHE = "packet-20260723101300";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-180.png", "landing.jpg"];
self.addEventListener("install", e => { self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); });
self.addEventListener("activate", e => { e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim())); });
// network-first for index.html (fresh packet daily), cache-first for the rest (offline shell)
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if(u.pathname.endsWith("/") || u.pathname.endsWith("index.html")){
    e.respondWith(fetch(e.request, {cache:"no-store"}).then(r => { const cp=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,cp)); return r; }).catch(()=>caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
