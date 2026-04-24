const CACHE_NAME = 'tarot-app-v10';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/data/tarot_standard.js',
  './js/data/tarot_daily.js',
  './js/data/tarot_premium.js',
  './js/data/tarot_thinking.js',
  './manifest.json',
  './about.html',
  './privacy-policy.html',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/card-back.png',
  './images/card-back-premium.png',
  './images/tarot-cloth.png',
  './images/lotto-bg.png',
  './images/conclusion.png',
  './images/0.png','./images/1.png','./images/2.png','./images/3.png',
  './images/4.png','./images/5.png','./images/6.png','./images/7.png',
  './images/8.png','./images/9.png','./images/10.png','./images/11.png',
  './images/12.png','./images/13.png','./images/14.png','./images/15.png',
  './images/16.png','./images/17.png','./images/18.png','./images/19.png',
  './images/20.png','./images/21.png'
];

// 1. Install: 즉시 활성화
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 2. Activate: 구버전 캐시 삭제 후 즉시 제어권 획득
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch: HTML/JS/CSS는 네트워크 우선, 이미지는 캐시 우선
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);
  const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url.pathname);

  if (isImage) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  } else {
    // HTML/JS/CSS: 항상 네트워크에서 최신 파일을 받아옴
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

