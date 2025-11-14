/**
 * Offline Manager - Gestion du statut offline/online
 */

const OfflineManager = {
    isOnline: navigator.onLine,
    listeners: [],

    /**
     * Initialiser
     */
    init() {
        window.addEventListener('online', () => this.onOnline());
        window.addEventListener('offline', () => this.onOffline());

        this.updateStatus();
        console.log('✓ Offline Manager initialized');
    },

    /**
     * Handler online
     */
    onOnline() {
        this.isOnline = true;
        this.updateStatus();
        this.notifyListeners();
        console.log('📡 Online');
    },

    /**
     * Handler offline
     */
    onOffline() {
        this.isOnline = false;
        this.updateStatus();
        this.notifyListeners();
        console.log('📡 Offline');
    },

    /**
     * Update status display
     */
    updateStatus() {
        const statusElement = document.getElementById('status-offline');
        if (statusElement) {
            if (this.isOnline) {
                statusElement.innerHTML = '<span class="offline-indicator" style="background: #ffaa00;"></span> ONLINE';
            } else {
                statusElement.innerHTML = '<span class="offline-indicator"></span> OFFLINE';
            }
        }
    },

    /**
     * Subscribe to status changes
     */
    subscribe(callback) {
        this.listeners.push(callback);
    },

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.isOnline));
    }
};

window.OfflineManager = OfflineManager;
