/**
 * Storage Manager - IndexedDB pour stockage local
 */

const StorageManager = {
    dbName: 'PipSurvivalDB',
    dbVersion: 1,
    db: null,

    /**
     * Initialiser la base de données IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✓ IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store documents
                if (!db.objectStoreNames.contains('documents')) {
                    const docStore = db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
                    docStore.createIndex('title', 'title', { unique: false });
                    docStore.createIndex('category', 'category', { unique: false });
                }

                // Store chunks
                if (!db.objectStoreNames.contains('chunks')) {
                    const chunkStore = db.createObjectStore('chunks', { keyPath: 'id', autoIncrement: true });
                    chunkStore.createIndex('doc_id', 'doc_id', { unique: false });
                }

                // Store vectors (embeddings)
                if (!db.objectStoreNames.contains('vectors')) {
                    const vectorStore = db.createObjectStore('vectors', { keyPath: 'id', autoIncrement: true });
                    vectorStore.createIndex('chunk_id', 'chunk_id', { unique: false });
                }

                // Store cache
                if (!db.objectStoreNames.contains('cache')) {
                    db.createObjectStore('cache', { keyPath: 'key' });
                }
            };
        });
    },

    /**
     * Ajouter un document
     */
    async addDocument(doc) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readwrite');
            const store = transaction.objectStore('documents');
            const request = store.add(doc);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Récupérer tous les documents
     */
    async getAllDocuments() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readonly');
            const store = transaction.objectStore('documents');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Ajouter un vecteur (embedding)
     */
    async addVector(chunkId, embedding) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['vectors'], 'readwrite');
            const store = transaction.objectStore('vectors');
            const request = store.add({ chunk_id: chunkId, embedding: embedding });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Récupérer tous les vecteurs
     */
    async getAllVectors() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['vectors'], 'readonly');
            const store = transaction.objectStore('vectors');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Cache helper
     */
    async setCache(key, value, ttl = 3600000) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.put({
                key: key,
                value: value,
                timestamp: Date.now(),
                ttl: ttl
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getCache(key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(key);

            request.onsuccess = () => {
                const cached = request.result;
                if (!cached) {
                    resolve(null);
                    return;
                }

                // Check TTL
                if (Date.now() - cached.timestamp > cached.ttl) {
                    resolve(null);
                } else {
                    resolve(cached.value);
                }
            };
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Calculer l'espace utilisé
     */
    async getStorageEstimate() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            return await navigator.storage.estimate();
        }
        return { usage: 0, quota: 0 };
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => StorageManager.init());
} else {
    StorageManager.init();
}

window.StorageManager = StorageManager;
