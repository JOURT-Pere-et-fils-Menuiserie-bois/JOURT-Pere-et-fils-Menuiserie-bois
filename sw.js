/**
 * Service Worker - Gestion du cache offline
 * Strategy: Cache-First avec fallback réseau
 */

const CACHE_VERSION = 'pip-survival-v1';
const CACHE_STATIC = 'pip-survival-static-v1';
const CACHE_DYNAMIC = 'pip-survival-dynamic-v1';

// Fichiers à mettre en cache lors de l'installation
const STATIC_FILES = [
    '/',
    '/index.php',
    '/manifest.json',
    '/assets/css/pipboy.css',
    '/assets/css/modules.css',
    '/assets/css/animations.css',
    '/assets/js/app.js',
    '/assets/js/ai-engine.js',
    '/assets/js/vector-search.js',
    '/assets/js/pdf-processor.js',
    '/assets/js/utils/storage.js',
    '/assets/js/utils/battery.js',
    '/assets/js/utils/offline.js',
    '/assets/js/modules/search.js',
    '/assets/js/modules/codegen.js',
    '/assets/js/modules/docs.js',
    '/assets/js/modules/radio.js',
    '/assets/js/modules/map.js'
];

/**
 * Installation du Service Worker
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');

    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then(cache => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Installation complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('pip-survival-') && name !== CACHE_STATIC && name !== CACHE_DYNAMIC)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim();
            })
    );
});

/**
 * Interception des requêtes
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ne pas cacher les requêtes POST/PUT/DELETE
    if (request.method !== 'GET') {
        return;
    }

    // Strategy selon le type de ressource
    if (isStaticAsset(url)) {
        // Cache-First pour les assets statiques
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(url)) {
        // Network-First pour les API avec fallback cache
        event.respondWith(networkFirst(request));
    } else {
        // Cache-First avec fallback réseau pour le reste
        event.respondWith(cacheFirst(request));
    }
});

/**
 * Vérifier si c'est un asset statique
 */
function isStaticAsset(url) {
    return url.pathname.match(/\.(css|js|woff2?|png|jpg|jpeg|svg|gif|ico)$/);
}

/**
 * Vérifier si c'est une requête API
 */
function isAPIRequest(url) {
    return url.pathname.startsWith('/api/');
}

/**
 * Stratégie Cache-First
 */
async function cacheFirst(request) {
    try {
        // Essayer de récupérer depuis le cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Si pas en cache, fetch depuis le réseau
        const networkResponse = await fetch(request);

        // Mettre en cache pour la prochaine fois
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_STATIC);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        console.error('[SW] Cache-First failed:', error);

        // Fallback pour les pages HTML
        if (request.destination === 'document') {
            const cache = await caches.open(CACHE_STATIC);
            return cache.match('/');
        }

        // Retourner une erreur
        return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Stratégie Network-First
 */
async function networkFirst(request) {
    try {
        // Essayer le réseau d'abord
        const networkResponse = await fetch(request);

        // Mettre en cache si succès
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_DYNAMIC);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        console.log('[SW] Network failed, trying cache');

        // Fallback sur le cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Retourner une erreur JSON pour les API
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Offline - API not available',
                offline: true
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Background Sync (optionnel)
 */
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-documents') {
        event.waitUntil(syncDocuments());
    }
});

async function syncDocuments() {
    console.log('[SW] Syncing documents...');
    // TODO: Implémenter la sync
}

/**
 * Push Notifications (optionnel)
 */
self.addEventListener('push', (event) => {
    console.log('[SW] Push received');

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Pip-Boy Survival';
    const options = {
        body: data.body || 'New notification',
        icon: '/assets/images/icons/icon-192.png',
        badge: '/assets/images/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: data,
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

/**
 * Notification click
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});

/**
 * Message handler
 */
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls || [];
        event.waitUntil(
            caches.open(CACHE_DYNAMIC)
                .then(cache => cache.addAll(urls))
        );
    }
});

console.log('[SW] Service Worker loaded');
