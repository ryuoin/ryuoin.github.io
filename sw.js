const CACHE_NAME = 'tarot-app-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/tarotData.js',
  './manifest.json',
  './images/icon-192.png',
  './images/icon-512.png'
  // 기타 22장의 타로 카드 이미지는 용량이 크므로 앱 설치 후 첫 실행 시점이나 뽑힐 때 동적으로 캐시됩니다.
];

// 1. Install Event (캐시 초기화)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching App Shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event (구버전 캐시 정리)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event (네트워크 요청 가로채기 -> 오프라인 지원)
self.addEventListener('fetch', (event) => {
  // http / https 요청만 캐싱 (크롬 익스텐션 등은 무시)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 1) 캐시에 있으면 반환
        if (response) {
          return response;
        }
        
        // 2) 캐시에 없으면 네트워크에서 가져온 후 저장
        return fetch(event.request).then(
          (networkResponse) => {
            // 유효한 응답인지 확인
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // 응답 스트림 복제 (브라우저와 캐시에 둘 다 사용하기 위함)
            var responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(() => {
          // 네트워크도 없고 캐시도 없을 경우 (오프라인 상태에서 첫 진입 시)
          // index.html 등 대체 페이지를 보낼 수도 있으나 SPA 형태에서는 index.html이 이미 캐싱됨
        });
      })
  );
});
