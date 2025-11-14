/**
 * Map Module - Cartes offline et géolocalisation
 */

const MapModule = {
    position: null,

    /**
     * Initialiser le module
     */
    init() {
        this.getPosition();
        console.log('🗺 Map Module initialized');
    },

    /**
     * Obtenir la position GPS
     */
    async getPosition() {
        if (!('geolocation' in navigator)) {
            console.warn('Geolocation not supported');
            return;
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            this.position = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude,
                accuracy: position.coords.accuracy
            };

            this.updateDisplay();

        } catch (error) {
            console.warn('Geolocation error:', error);
        }
    },

    /**
     * Update display
     */
    updateDisplay() {
        if (!this.position) return;

        const coordsEl = document.getElementById('map-coords');
        const altEl = document.getElementById('map-alt');

        if (coordsEl) {
            coordsEl.textContent = `${this.position.latitude.toFixed(6)}, ${this.position.longitude.toFixed(6)}`;
        }

        if (altEl) {
            altEl.textContent = this.position.altitude
                ? `${Math.round(this.position.altitude)}m`
                : 'Unknown';
        }
    }
};

window.MapModule = MapModule;
