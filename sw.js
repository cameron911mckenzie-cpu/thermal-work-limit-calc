'use strict';
const scope = new URL(self.registration.scope);
const prefix = `heatline:${scope.pathname}:`;
const version = `${prefix}40717868527be5`;
const assets = ['./', './index.html', './Heatline.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png']
  .map(path => new URL(path, scope).href);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(version)
    .then(cache => cache.addAll(assets.map(url => new Request(url, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith(prefix) && key !== version).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== scope.origin) return;
  url.search = '';
  url.hash = '';
  if (!assets.includes(url.href)) return;
  event.respondWith(caches.open(version).then(async cache => {
    const installed = await cache.match(url.href);
    return installed || fetch(event.request);
  }));
});
