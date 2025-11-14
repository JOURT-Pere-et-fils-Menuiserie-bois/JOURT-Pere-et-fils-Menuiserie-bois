/**
 * Battery Monitor - Gestion de la batterie et économie d'énergie
 */

const BatteryMonitor = {
    battery: null,
    powerSaveMode: false,
    listeners: [],

    /**
     * Initialiser le battery monitor
     */
    async init() {
        if (!('getBattery' in navigator)) {
            console.warn('Battery API not supported');
            return;
        }

        try {
            this.battery = await navigator.getBattery();
            this.updateBatteryDisplay();

            // Event listeners
            this.battery.addEventListener('levelchange', () => this.onBatteryChange());
            this.battery.addEventListener('chargingchange', () => this.onBatteryChange());

            console.log('✓ Battery Monitor initialized');
        } catch (error) {
            console.warn('Battery API error:', error);
        }
    },

    /**
     * Update battery display
     */
    updateBatteryDisplay() {
        if (!this.battery) return;

        const level = Math.round(this.battery.level * 100);
        const levelElement = document.getElementById('battery-level');
        const statBattery = document.getElementById('stat-battery');
        const statBatteryBar = document.getElementById('stat-battery-bar');

        if (levelElement) {
            levelElement.textContent = level + '%';
        }

        if (statBattery) {
            statBattery.textContent = level + '%';
        }

        if (statBatteryBar) {
            statBatteryBar.style.width = level + '%';

            // Change color if low
            if (level < 20) {
                statBatteryBar.style.background = '#ff0000';
                statBatteryBar.style.boxShadow = '0 0 10px #ff0000';
            } else {
                statBatteryBar.style.background = 'var(--color-primary)';
                statBatteryBar.style.boxShadow = 'var(--glow-sm)';
            }
        }

        // Auto power save mode
        if (level < 20 && !this.battery.charging) {
            this.enablePowerSave();
        }
    },

    /**
     * Battery change handler
     */
    onBatteryChange() {
        this.updateBatteryDisplay();
        this.notifyListeners();
    },

    /**
     * Activer le mode économie d'énergie
     */
    enablePowerSave() {
        if (this.powerSaveMode) return;

        console.log('⚡ Enabling power save mode');
        this.powerSaveMode = true;

        document.body.classList.add('power-save');

        // Disable animations
        document.querySelectorAll('*').forEach(el => {
            el.style.animation = 'none';
        });

        this.notifyListeners();
    },

    /**
     * Désactiver le mode économie d'énergie
     */
    disablePowerSave() {
        if (!this.powerSaveMode) return;

        console.log('⚡ Disabling power save mode');
        this.powerSaveMode = false;

        document.body.classList.remove('power-save');

        this.notifyListeners();
    },

    /**
     * Subscribe to battery changes
     */
    subscribe(callback) {
        this.listeners.push(callback);
    },

    notifyListeners() {
        this.listeners.forEach(callback => callback({
            level: this.battery ? this.battery.level : 1,
            charging: this.battery ? this.battery.charging : false,
            powerSaveMode: this.powerSaveMode
        }));
    },

    /**
     * Get battery info
     */
    getInfo() {
        if (!this.battery) {
            return {
                level: 1,
                charging: false,
                supported: false
            };
        }

        return {
            level: this.battery.level,
            charging: this.battery.charging,
            chargingTime: this.battery.chargingTime,
            dischargingTime: this.battery.dischargingTime,
            supported: true,
            powerSaveMode: this.powerSaveMode
        };
    }
};

window.BatteryMonitor = BatteryMonitor;
