/**
 * Service Worker - Maximale Performance-Optimierung
 * Caching, Offline Support, Network Optimization
 * 
 * @author Emilia
 * @version 1.0.0
 */

const CACHE_NAME = 'emilia-lernplattform-v1.0.0';
const STATIC_CACHE = 'emilia-static-v1.0.0';
const DYNAMIC_CACHE = 'emilia-dynamic-v1.0.0';
const API_CACHE = 'emilia-api-v1.0.0';

// Critical assets to cache immediately
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/aufgaben.html',
    '/pruefung.html',
    '/css/performance-critical.css',
    '/css/aufgaben-engine.css',
    '/css/fortschritt.css',
    '/css/pruefung.css',
    '/js/performance-suite.js',
    '/js/main.js',
    '/js/fortschritt.js',
    '/js/pruefung.js',
    '/data/lernfeld-1-3.json',
    '/data/lernfeld-4-6.json',
    '/data/aufgaben.json'
];

// Assets to cache on demand
const ON_DEMAND_ASSETS = [
    '/images/logo.webp',
    '/images/icons/*.webp',
    '/fonts/*.woff2',
    '/api/*'
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
 * Install Event - Cache critical assets
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Caching critical assets...');
                return cache.addAll(CRITICAL_ASSETS);
            })
            .then(() => {
                console.log('✅ Critical assets cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Failed to cache critical assets:', error);
            })
    );
});

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
    
    // Critical CSS/JS - Cache First
    if (pathname.includes('/css/') || pathname.includes('/js/')) {
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
    const cached = await cache.match(request);
    
    if (cached) {
        console.log('📋 Cache hit:', request.url);
        return cached;
    }
    
    console.log('🌐 Cache miss, fetching:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
        cache.put(request, response.clone());
    }
    
    return response;
}

/**
 * Network First Strategy
 */
async function networkFirst(request) {
    const cache = await caches.open(getCacheName(request.url));
    const cached = await cache.match(request);
    
    try {
        console.log('🌐 Network first:', request.url);
        const response = await fetch(request);
        
        if (response.ok) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('📋 Network failed, using cache:', request.url);
        if (cached) {
            return cached;
        }
        
        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
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
    const cached = await cache.match(request);
    
    // Fetch in background
    const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
            cache.put(request, response.clone());
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
    const cached = await cache.match(request);
    
    if (cached) {
        console.log('📋 Cache only:', request.url);
        return cached;
    }
    
    throw new Error('No cache entry found');
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
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f4e4c1; color: #2c1810; }
                .offline-container { max-width: 500px; margin: 0 auto; text-align: center; }
                .offline-icon { font-size: 64px; margin-bottom: 20px; }
                h1 { color: #d4af37; margin-bottom: 20px; }
                p { line-height: 1.6; margin-bottom: 20px; }
                .retry-btn { background: #d4af37; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; }
                .retry-btn:hover { background: #b8941f; }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📴</div>
                <h1>Offline</h1>
                <p>Sie sind offline. Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.</p>
                <p>Einige Inhalte sind möglicherweise weiterhin verfügbar, wenn Sie die Seite neu laden.</p>
                <button class="retry-btn" onclick="window.location.reload()">Erneut versuchen</button>
            </div>
        </body>
        </html>
    `;
    
    return new Response(offlineResponse, {
        headers: { 'Content-Type': 'text/html' }
    });
}

/**
 * Background Sync for offline actions
 */
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);
    
    if (event.tag === 'sync-offline-data') {
        event.waitUntil(syncOfflineData());
    }
});

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
 */
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received');
    
    const options = {
        body: 'Neue Lernaufgabe verfügbar!',
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Lernfeld ansehen',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Schließen',
                icon: '/images/xmark.png'
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
            clients.openWindow('/aufgaben.html')
        );
    }
});

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
        await fetch('/api/analytics/performance', {
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
 */
self.addEventListener('quotaexceeded', (event) => {
    console.log('⚠️ Storage quota exceeded, cleaning up cache');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Keep only the most recent cache
                    if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

console.log('🚀 Service Worker loaded');