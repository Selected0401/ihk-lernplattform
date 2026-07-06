/**
 * Service Worker - Safari Compatible Version
 * Caching, Offline Support, Network Optimization
 * 
 * Safari Compatibility:
 * - No Background Sync support (uses polling fallback)
 * - No Push Notification support (uses in-app notifications)
 * - Fixed quota handling
 * - Safe asset caching with error handling
 */

const CACHE_NAME = 'emilia-lernplattform-v2.0.4-word8020';
const STATIC_CACHE = 'emilia-static-v2.0.4-word8020';
const DYNAMIC_CACHE = 'emilia-dynamic-v2.0.4-word8020';
const API_CACHE = 'emilia-api-v2.0.4-word8020';

// Safari detection
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// Feature detection
const supportsBackgroundSync = Boolean(self.registration && 'sync' in self.registration);
const supportsPush = 'PushManager' in self;

// Critical assets to cache immediately - ONLY EXISTING FILES
const CRITICAL_ASSETS = [
  './',
  'index.html',
  'style.css',
  'js/learning-environment.js',
  'app.js',
  'js/safari-optimizer.js',
  'manifest.json',
  'data/aufgaben-optimiert.json'
];

// Assets to cache on demand
const ON_DEMAND_ASSETS = [
  'images/*.webp',
  'images/icons/*.webp',
  'fonts/*.woff2'
];

// Network strategies
const STRATEGIES = {
  CACHE_FIRST: 'cacheFirst',
  NETWORK_FIRST: 'networkFirst',
  STALE_WHILE_REVALIDATE: 'staleWhileRevalidate',
  NETWORK_ONLY: 'networkOnly',
  CACHE_ONLY: 'cacheOnly'
};

/**
 * Install Event - Cache critical assets with error handling
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    cacheCriticalAssets()
      .then(() => {
        console.log('✅ Critical assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache critical assets:', error);
        // Continue anyway - non-critical
        return self.skipWaiting();
      })
  );
});

/**
 * Cache critical assets with individual error handling
 */
async function cacheCriticalAssets() {
  const cache = await caches.open(STATIC_CACHE);
  const results = await Promise.allSettled(
    CRITICAL_ASSETS.map(url => 
      cache.add(url).catch(err => {
        console.warn(`Failed to cache ${url}:`, err.message);
        return null;
      })
    )
  );
  
  const failed = results.filter(r => r.status === 'rejected');
  const cached = results.filter(r => r.status === 'fulfilled' && r.value !== null);
  
  console.log(`📦 Cached ${cached.length}/${CRITICAL_ASSETS.length} critical assets`);
  if (failed.length > 0) {
    console.warn(`⚠️ ${failed.length} assets failed to cache`);
  }
}

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remove old caches
            if (cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE &&
                cacheName !== CACHE_NAME) {
              console.log('🗑️ Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event - Handle all network requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests (except for CDNs)
  if (url.origin !== self.location.origin && !isCDN(url.origin)) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

/**
 * Handle request with appropriate strategy
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const strategy = getStrategy(url);
  
  switch (strategy) {
    case STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    case STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    case STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    case STRATEGIES.NETWORK_ONLY:
      return networkOnly(request);
    case STRATEGIES.CACHE_ONLY:
      return cacheOnly(request);
    default:
      return networkFirst(request);
  }
}

/**
 * Determine caching strategy based on request type
 */
function getStrategy(url) {
  const pathname = url.pathname;
  
  // HTML pages - Cache First for offline support
  if (pathname.endsWith('.html') || pathname === '/') {
    return STRATEGIES.CACHE_FIRST;
  }
  
  // Critical CSS/JS - Cache First (root files + subfolders)
  if (pathname.match(/\.(css|js)$/) || pathname.includes('/css/') || pathname.includes('/js/')) {
    return STRATEGIES.CACHE_FIRST;
  }
  
  // Static assets (images, fonts) - Cache First
  if (pathname.match(/\.(webp|jpg|jpeg|png|gif|svg|woff2|woff|ttf|eot)$/)) {
    return STRATEGIES.CACHE_FIRST;
  }
  
  // API calls - Network First with fallback
  if (pathname.startsWith('/api/') || pathname.includes('/data/')) {
    return STRATEGIES.NETWORK_FIRST;
  }
  
  // External CDNs - Stale While Revalidate
  if (isCDN(url.origin)) {
    return STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // Default - Network First
  return STRATEGIES.NETWORK_FIRST;
}

/**
 * Check if origin is a CDN
 */
function isCDN(origin) {
  const cdnHosts = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
    'cdnjs.cloudflare.com',
    'unpkg.com'
  ];
  
  return cdnHosts.some(host => origin.includes(host));
}

/**
 * Cache First Strategy
 */
async function cacheFirst(request) {
  const cache = await caches.open(getCacheName(request.url));
  const cached = await cache.match(request, { ignoreSearch: true });
  
  if (cached) {
    console.log('📋 Cache hit:', request.url);
    return cached;
  }

  console.log('🌐 Cache miss, fetching:', request.url);
  try {
    const response = await fetch(request);

    if (response.ok) {
      await safeCachePut(cache, request, response.clone());
    }

    return response;
  } catch (error) {
    const acceptHeader = request.headers.get('accept');
    if (acceptHeader && acceptHeader.includes('text/html')) {
      return getOfflinePage();
    }
    throw error;
  }
}

/**
 * Network First Strategy
 */
async function networkFirst(request) {
  const cache = await caches.open(getCacheName(request.url));
  const cached = await cache.match(request, { ignoreSearch: true });
  
  try {
    console.log('🌐 Network first:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      await safeCachePut(cache, request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('📋 Network failed, using cache:', request.url);
    if (cached) {
      return cached;
    }
    
    // Return offline page for HTML requests
    const acceptHeader = request.headers.get('accept');
    if (acceptHeader && acceptHeader.includes('text/html')) {
      return getOfflinePage();
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(getCacheName(request.url));
  const cached = await cache.match(request, { ignoreSearch: true });
  
  // Fetch in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      safeCachePut(cache, request, response.clone());
    }
    return response;
  });
  
  // Return cached version immediately if available
  if (cached) {
    console.log('📋 Stale while revalidate:', request.url);
    return cached;
  }
  
  // Otherwise wait for network
  console.log('🌐 No cache, fetching:', request.url);
  return fetchPromise;
}

/**
 * Network Only Strategy
 */
async function networkOnly(request) {
  console.log('🌐 Network only:', request.url);
  return fetch(request);
}

/**
 * Cache Only Strategy
 */
async function cacheOnly(request) {
  const cache = await caches.open(getCacheName(request.url));
  const cached = await cache.match(request, { ignoreSearch: true });
  
  if (cached) {
    console.log('📋 Cache only:', request.url);
    return cached;
  }
  
  throw new Error('No cache entry found');
}

/**
 * Safe cache put with quota handling
 */
async function safeCachePut(cache, request, response) {
  try {
    await cache.put(request, response);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('⚠️ Storage quota exceeded, cleaning up cache');
      await cleanupOldCache();
      try {
        await cache.put(request, response);
      } catch (retryError) {
        console.error('❌ Still cannot cache after cleanup:', retryError);
      }
    } else {
      throw error;
    }
  }
}

/**
 * Cleanup old cache when quota exceeded
 */
async function cleanupOldCache() {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name !== STATIC_CACHE && name !== API_CACHE
    );
    
    console.log(`🗑️ Cleaning up ${oldCaches.length} old caches`);
    await Promise.all(oldCaches.map(name => caches.delete(name)));
    
    // Also clean dynamic cache
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    const keys = await dynamicCache.keys();
    if (keys.length > 50) {
      // Remove oldest entries
      const toRemove = keys.slice(0, keys.length - 50);
      await Promise.all(toRemove.map(key => dynamicCache.delete(key)));
      console.log(`🗑️ Removed ${toRemove.length} old dynamic cache entries`);
    }
  } catch (error) {
    console.error('Failed to cleanup cache:', error);
  }
}

/**
 * Get appropriate cache name based on content type
 */
function getCacheName(url) {
  const pathname = new URL(url).pathname;
  
  if (pathname.includes('/api/') || pathname.includes('/data/')) {
    return API_CACHE;
  }
  
  if (pathname.match(/\.(html|css|js)$/)) {
    return STATIC_CACHE;
  }
  
  return DYNAMIC_CACHE;
}

/**
 * Get offline page
 */
async function getOfflinePage() {
  const offlineResponse = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Emilia's Lernplattform</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 2rem;
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        button {
          background: white;
          color: #667eea;
          border: none;
          padding: 1rem 2rem;
          font-size: 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        button:hover {
          transform: scale(1.05);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📴</h1>
        <h2>Offline</h2>
        <p>Sie sind offline. Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.</p>
        <p>Einige Inhalte sind möglicherweise weiterhin verfügbar, wenn Sie die Seite neu laden.</p>
        <button onclick="location.reload()">Erneut versuchen</button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineResponse, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

/**
 * Background Sync for offline actions
 * Safari doesn't support this - fallback handled in main.js
 */
if (supportsBackgroundSync) {
  self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);
    
    if (event.tag === 'sync-offline-data') {
      event.waitUntil(syncOfflineData());
    }
  });
}

/**
 * Sync offline data when back online
 */
async function syncOfflineData() {
  try {
    const offlineData = await getOfflineData();
    
    for (const data of offlineData) {
      try {
        await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body
        });
        
        // Remove synced data
        await removeOfflineData(data.id);
      } catch (error) {
        console.error('Failed to sync data:', error);
      }
    }
    
    console.log('✅ Offline data synced');
  } catch (error) {
    console.error('❌ Failed to sync offline data:', error);
  }
}

/**
 * Get offline data from IndexedDB
 */
async function getOfflineData() {
  // Implementation would use IndexedDB to store offline actions
  return [];
}

/**
 * Remove offline data from IndexedDB
 */
async function removeOfflineData(id) {
  // Implementation would remove synced data from IndexedDB
}

/**
 * Push Notifications
 * Safari doesn't support this - fallback handled in main.js
 */
if (supportsPush) {
  self.addEventListener('push', (event) => {
    console.log('📬 Push notification received');
    
    const options = {
      body: 'Neue Lernaufgabe verfügbar!',
      icon: 'images/icon-192x192.png',
      badge: 'images/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Lernfeld ansehen',
          icon: 'images/checkmark.png'
        },
        {
          action: 'close',
          title: 'Schließen',
          icon: 'images/xmark.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('Emilia Lernplattform', options)
    );
  });
  
  /**
   * Notification Click Handler
   */
  self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event.notification.data);
    
    event.notification.close();
    
    if (event.action === 'explore') {
      event.waitUntil(
        clients.openWindow('aufgaben.html')
      );
    }
  });
}

/**
 * Performance Monitoring
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    console.log('📊 Performance metrics:', event.data.metrics);
    
    // Could send to analytics service
    sendToAnalytics(event.data.metrics);
  }
});

/**
 * Send metrics to analytics
 */
async function sendToAnalytics(metrics) {
  try {
    await fetch('api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metrics)
    });
  } catch (error) {
    console.error('Failed to send analytics:', error);
  }
}

/**
 * Cache cleanup on storage pressure
 * Safari doesn't support quotaexceeded event - handled in safeCachePut
 */
if ('quotaexceeded' in self) {
  self.addEventListener('quotaexceeded', (event) => {
    console.log('⚠️ Storage quota exceeded, cleaning up cache');
    
    event.waitUntil(
      cleanupOldCache()
    );
  });
}

console.log('🚀 Service Worker loaded');
console.log(`🍎 Safari: ${isSafari}`);
console.log(`🔄 Background Sync: ${supportsBackgroundSync ? '✅' : '❌'}`);
console.log(`📬 Push: ${supportsPush ? '✅' : '❌'}`);