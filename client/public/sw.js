// GXCOIN PWA Service Worker
// Version 1.1.0

const CACHE_NAME = 'gxcoin-pwa-v1.1.0';
const OFFLINE_CACHE = 'gxcoin-offline-v1.1.0';

// Essential files to cache for offline functionality
const CORE_CACHE_FILES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/manifest.json',
  // GXCOIN logo assets
  '/icons/gxcoin-logo.png',
  '/images/gxcoin-hero-promo.jpg',
  // PWA icons - all sizes for robust caching
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png'
];

// Static assets to cache
const STATIC_CACHE_FILES = [
  // Fonts
  '/fonts/inter.json',
  
  // Hero artwork and key images
  '/Screenshot_20250924_133119_Chrome~2_1758993229689.jpg',
  '/heroes-group.jpg',
  '/gxcoin-ecosystem-overview.jpg',
  '/hero-collection-promo.jpg',
  
  // Badge images
  '/hemp-badge.jpg',
  '/wtr-badge.jpg',
  '/batt-badge.jpg',
  '/gcct-badge.jpg',
  '/gpwr-badge.jpg',
  
  // Card assets
  '/platinum-card-tier.jpg',
  '/credit-card-features.jpg',
  '/debit-card-features.jpg',
  
  // Sounds
  '/sounds/background.mp3',
  '/sounds/hit.mp3',
  '/sounds/success.mp3',
  
  // Textures for 3D elements
  '/textures/asphalt.png',
  '/textures/grass.png',
  '/textures/sand.jpg',
  '/textures/sky.png',
  '/textures/wood.jpg'
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  '/api/heroes',
  '/api/user/profile',
  '/api/ranks',
  '/api/contribution'
];

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing GXCOIN PWA Service Worker v1.1.0');
  
  event.waitUntil(
    Promise.all([
      // Cache core files
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching core files');
        return cache.addAll(CORE_CACHE_FILES);
      }),
      // Cache static assets
      caches.open(OFFLINE_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE_FILES.filter(file => file));
      })
    ]).then(() => {
      console.log('[SW] All files cached successfully');
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Cache installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating GXCOIN PWA Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated and ready');
      // Ensure the service worker takes control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content and implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle different types of requests
  if (request.method === 'GET') {
    event.respondWith(handleGetRequest(request));
  }
});

async function handleGetRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request);
    }
    
    // Strategy 2: Network First for API calls
    if (isApiCall(url.pathname)) {
      return await networkFirst(request);
    }
    
    // Strategy 3: Stale While Revalidate for HTML pages
    if (isHtmlPage(url.pathname)) {
      return await staleWhileRevalidate(request);
    }
    
    // Default: Network First
    return await networkFirst(request);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    return await getOfflineFallback(request);
  }
}

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(OFFLINE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for static asset:', request.url);
    throw error;
  }
}

// Network First Strategy - for API calls and dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && isApiCall(new URL(request.url).pathname)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate Strategy - for HTML pages
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    console.log('[SW] Network failed for HTML page:', request.url);
  });
  
  return cachedResponse || fetchPromise;
}

// Get offline fallback page
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  if (request.destination === 'document') {
    // Return cached index.html for page requests
    const cachedPage = await caches.match('/');
    if (cachedPage) {
      return cachedPage;
    }
  }
  
  // For other resources, return a generic offline response
  return new Response('Offline - GXCOIN PWA', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.includes('/icons/') || 
         pathname.includes('/sounds/') || 
         pathname.includes('/textures/') ||
         pathname.includes('/fonts/') ||
         pathname.includes('/geometries/') ||
         pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|mp3|wav|ogg|woff|woff2|ttf|eot|css|js)$/);
}

function isApiCall(pathname) {
  return pathname.startsWith('/api/') || 
         API_CACHE_PATTERNS.some(pattern => pathname.includes(pattern));
}

function isHtmlPage(pathname) {
  return pathname === '/' || 
         pathname.includes('.html') || 
         (!pathname.includes('.') && !pathname.startsWith('/api/'));
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'gxcoin-contribution-sync') {
    event.waitUntil(syncContributionData());
  }
});

// Sync contribution data when back online
async function syncContributionData() {
  try {
    // Sync any pending contribution data
    console.log('[SW] Syncing contribution data...');
    // Implementation would depend on your specific data sync needs
  } catch (error) {
    console.error('[SW] Contribution sync failed:', error);
  }
}

// Handle push notifications for engagement
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New update available in GXCOIN!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'GXCOIN - ReFi League',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/').then((client) => {
        if (client) {
          client.focus();
        }
      })
    );
  }
});

console.log('[SW] GXCOIN PWA Service Worker v1.1.0 loaded and ready');