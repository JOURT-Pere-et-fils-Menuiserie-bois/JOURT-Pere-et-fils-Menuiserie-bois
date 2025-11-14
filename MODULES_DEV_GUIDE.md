# 🔧 GUIDE DÉVELOPPEUR - CRÉATION DE MODULES

Guide complet pour créer vos propres modules dans Pip-Boy Survival AI.

---

## 📐 Architecture des Modules

Un module Pip-Boy est un objet JavaScript qui suit une structure précise et s'intègre au système de l'application.

### Structure Minimale

```javascript
const MonModule = {
    // REQUIS
    id: 'mon-module',        // ID unique (kebab-case)
    name: 'MON MODULE',      // Nom affiché (MAJUSCULES style Pip-Boy)
    icon: '🔥',             // Emoji ou symbole

    // Méthodes du cycle de vie
    async init() {
        // Appelé au chargement du module
        console.log('Module initialisé');
    },

    render() {
        // Retourne le HTML du module
        return `<div class="module">Contenu</div>`;
    },

    async onActivate() {
        // Appelé quand l'utilisateur ouvre ce module
    },

    async onDeactivate() {
        // Appelé quand l'utilisateur quitte ce module
    },

    // OPTIONNEL
    async onData(data) {
        // Reçoit des données d'autres modules
    },

    async cleanup() {
        // Nettoyage avant destruction
    }
};

// Enregistrer le module
window.PipBoyModules = window.PipBoyModules || [];
window.PipBoyModules.push(MonModule);
```

---

## 🎯 Exemple Complet : Module Météo

```javascript
/**
 * Module Météo - Affiche prévisions météo offline
 * Fichier : assets/js/modules/weather.js
 */

const WeatherModule = {
    id: 'weather',
    name: 'WEATHER',
    icon: '🌤️',

    // État interne du module
    state: {
        location: null,
        forecast: null
    },

    /**
     * Initialisation
     */
    async init() {
        console.log('[Weather] Module initialized');

        // Charger données sauvegardées
        this.loadState();

        // Écouter événements globaux
        window.addEventListener('location-update', (e) => {
            this.updateLocation(e.detail);
        });
    },

    /**
     * Render du HTML
     */
    render() {
        const { location, forecast } = this.state;

        return `
            <div class="module weather-module">
                <div class="module-header">
                    <h2 class="module-title">${this.icon} ${this.name}</h2>
                    <div class="module-actions">
                        <button class="pip-btn" onclick="WeatherModule.refresh()">
                            REFRESH
                        </button>
                    </div>
                </div>

                <div class="weather-content">
                    ${location ? `
                        <div class="location-display">
                            <div class="label">LOCATION:</div>
                            <div class="value">${location.name}</div>
                        </div>
                    ` : `
                        <div class="stat-card">
                            <p>No location data available.</p>
                            <button class="pip-btn" onclick="WeatherModule.getLocation()">
                                GET LOCATION
                            </button>
                        </div>
                    `}

                    ${forecast ? this.renderForecast(forecast) : ''}
                </div>
            </div>
        `;
    },

    /**
     * Render des prévisions
     */
    renderForecast(forecast) {
        return `
            <div class="forecast-grid">
                ${forecast.map(day => `
                    <div class="forecast-day">
                        <div class="day-name">${day.date}</div>
                        <div class="day-icon">${day.icon}</div>
                        <div class="day-temp">${day.temp}°C</div>
                        <div class="day-desc">${day.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Activation du module
     */
    async onActivate() {
        console.log('[Weather] Module activated');

        // Mettre à jour les données si anciennes
        if (this.isDataStale()) {
            await this.refresh();
        }
    },

    /**
     * Désactivation
     */
    async onDeactivate() {
        console.log('[Weather] Module deactivated');
        this.saveState();
    },

    /**
     * Obtenir la localisation
     */
    async getLocation() {
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            this.state.location = {
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                name: 'Current Location'
            };

            await this.fetchWeather();
            app.loadModule('weather'); // Recharger le module

        } catch (error) {
            console.error('[Weather] Failed to get location:', error);
            alert('Failed to get location. Check permissions.');
        }
    },

    /**
     * Récupérer météo (utilise prédictions basiques si offline)
     */
    async fetchWeather() {
        const { location } = this.state;
        if (!location) return;

        // En mode offline : utiliser prédictions basiques
        // En mode online : appeler API météo

        if (!navigator.onLine) {
            this.state.forecast = this.generateBasicForecast();
        } else {
            try {
                // Appel API météo (ex: OpenWeatherMap)
                // const data = await fetch(...);
                // this.state.forecast = this.parseForecast(data);

                // Pour cet exemple, on simule
                this.state.forecast = this.generateBasicForecast();
            } catch (error) {
                console.error('[Weather] API call failed:', error);
                this.state.forecast = this.generateBasicForecast();
            }
        }

        this.saveState();
    },

    /**
     * Générer prévisions basiques (algorithme simple)
     */
    generateBasicForecast() {
        const days = ['TODAY', 'TOMORROW', 'DAY +2', 'DAY +3', 'DAY +4'];
        const conditions = [
            { icon: '☀️', desc: 'SUNNY', temp: 22 },
            { icon: '⛅', desc: 'PARTLY CLOUDY', temp: 20 },
            { icon: '☁️', desc: 'CLOUDY', temp: 18 },
            { icon: '🌧️', desc: 'RAINY', temp: 15 }
        ];

        return days.map((day, i) => {
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            return {
                date: day,
                icon: condition.icon,
                temp: condition.temp + Math.floor(Math.random() * 5) - 2,
                description: condition.desc
            };
        });
    },

    /**
     * Refresh
     */
    async refresh() {
        console.log('[Weather] Refreshing data...');
        await this.fetchWeather();
        app.loadModule('weather');
    },

    /**
     * Vérifier si données périmées
     */
    isDataStale() {
        const lastUpdate = localStorage.getItem('weather_last_update');
        if (!lastUpdate) return true;

        const age = Date.now() - parseInt(lastUpdate);
        return age > 3600000; // 1 heure
    },

    /**
     * Sauvegarder état
     */
    saveState() {
        localStorage.setItem('weather_state', JSON.stringify(this.state));
        localStorage.setItem('weather_last_update', Date.now().toString());
    },

    /**
     * Charger état
     */
    loadState() {
        const saved = localStorage.getItem('weather_state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                console.error('[Weather] Failed to load state:', e);
            }
        }
    },

    /**
     * Nettoyage
     */
    async cleanup() {
        console.log('[Weather] Cleanup');
        window.removeEventListener('location-update', this.updateLocation);
    }
};

// Enregistrer le module
window.PipBoyModules = window.PipBoyModules || [];
window.PipBoyModules.push(WeatherModule);
```

---

## 🔌 API du Système de Modules

### Enregistrement

```javascript
// Auto-enregistrement dans le fichier du module
window.PipBoyModules.push(MonModule);

// Ou via l'API
app.registerModule(MonModule);
```

### Communication Entre Modules

```javascript
// Émettre un événement global
window.dispatchEvent(new CustomEvent('mon-event', {
    detail: { data: 'valeur' }
}));

// Écouter dans un autre module
window.addEventListener('mon-event', (e) => {
    console.log('Reçu:', e.detail.data);
});
```

### Accès aux Services

```javascript
// Storage
await StorageManager.getAllDocuments();
await StorageManager.addDocument(doc);

// AI
const embedding = await AIEngine.embed(text);
const response = await AIEngine.generate(prompt);

// Search
const results = await VectorSearch.search(query, 5);

// Battery
const info = BatteryMonitor.getInfo();
```

---

## 🎨 Styling des Modules

### Classes CSS Disponibles

```css
/* Containers */
.module                 /* Container principal */
.module-header          /* En-tête */
.module-title           /* Titre */
.module-actions         /* Zone boutons */
.module-content         /* Contenu principal */

/* Composants */
.pip-btn                /* Bouton standard */
.pip-input              /* Input standard */
.stat-card              /* Carte de statistique */
.stat-grid              /* Grille de stats */

/* Utilitaires */
.glow                   /* Text glow */
.box-glow               /* Box shadow glow */
.loading                /* Loading indicator */
.error-message          /* Message d'erreur */
.success-message        /* Message succès */
```

### CSS Custom pour Votre Module

```css
/* assets/css/custom-modules.css */

.weather-module {
    /* Styles spécifiques */
}

.forecast-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 16px;
    margin-top: 20px;
}

.forecast-day {
    padding: 16px;
    border: 2px solid var(--color-primary);
    background: var(--color-darker);
    text-align: center;
}

.day-icon {
    font-size: 32px;
    margin: 8px 0;
}
```

---

## 🔧 Outils & Utilitaires

### Storage Helper

```javascript
// Sauvegarder donnée
await StorageManager.setCache('ma-cle', { data: 'valeur' }, 3600000);

// Récupérer donnée
const data = await StorageManager.getCache('ma-cle');

// Calculer espace
const { usage, quota } = await StorageManager.getStorageEstimate();
```

### Offline Detection

```javascript
// Vérifier statut
if (OfflineManager.isOnline) {
    // Online logic
} else {
    // Offline logic
}

// Écouter changements
OfflineManager.subscribe((isOnline) => {
    console.log('Status changed:', isOnline);
});
```

### Battery Optimization

```javascript
// Vérifier mode économie
if (BatteryMonitor.powerSaveMode) {
    // Désactiver animations lourdes
    disableHeavyAnimations();
}

// Écouter changements batterie
BatteryMonitor.subscribe((info) => {
    if (info.level < 0.1) {
        enableUltraLowPowerMode();
    }
});
```

---

## 📦 Structure Fichiers d'un Module

```
assets/js/modules/mon-module/
├── mon-module.js          # Code principal
├── mon-module.css         # Styles (optionnel)
├── mon-module-worker.js   # Web Worker (optionnel)
└── README.md              # Documentation
```

---

## 🧪 Testing d'un Module

```javascript
// Test basique dans la console

// 1. Vérifier enregistrement
console.log(window.PipBoyModules);

// 2. Tester init
await MonModule.init();

// 3. Tester render
console.log(MonModule.render());

// 4. Tester avec l'app
app.registerModule(MonModule);
app.loadModule('mon-module');
```

---

## ⚙️ Configuration Module

```javascript
const ConfigurableModule = {
    id: 'configurable',
    name: 'CONFIGURABLE',
    icon: '⚙️',

    // Config par défaut
    config: {
        refreshInterval: 60000,
        showAdvanced: false,
        theme: 'green'
    },

    async init() {
        // Charger config personnalisée
        const saved = localStorage.getItem('module_config_' + this.id);
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
        }
    },

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        localStorage.setItem('module_config_' + this.id, JSON.stringify(this.config));

        // Recharger le module avec nouvelle config
        app.loadModule(this.id);
    },

    render() {
        return `
            <div class="module">
                <!-- Settings UI -->
                <div class="settings-panel">
                    <label>
                        Refresh Interval (ms):
                        <input type="number" value="${this.config.refreshInterval}"
                               onchange="ConfigurableModule.updateConfig({ refreshInterval: this.value })">
                    </label>
                </div>
            </div>
        `;
    }
};
```

---

## 🚀 Hot Reload (Développement)

Pour recharger un module sans refresh complet :

```javascript
// Dans la console du navigateur
app.reloadModule('mon-module');
```

Ou automatiquement avec un watcher :

```javascript
// dev-tools.js
if (window.location.hostname === 'localhost') {
    setInterval(async () => {
        // Vérifier modifications
        const response = await fetch(`/api/module-checksum/mon-module`);
        const { checksum } = await response.json();

        if (checksum !== lastChecksum) {
            console.log('Module changed, reloading...');
            app.reloadModule('mon-module');
            lastChecksum = checksum;
        }
    }, 1000);
}
```

---

## 📝 Bonnes Pratiques

### ✅ DO

- Préfixer IDs de manière unique (`weather`, `my-custom-module`)
- Gérer les erreurs gracieusement
- Nettoyer les event listeners dans `cleanup()`
- Utiliser `localStorage` pour état persistant
- Documenter votre module
- Tester offline ET online
- Optimiser pour batterie (pas d'animations lourdes en power save)

### ❌ DON'T

- Ne pas polluer le namespace global
- Ne pas bloquer le thread principal (utiliser Web Workers si calculs lourds)
- Ne pas faire d'appels réseau sans gérer le mode offline
- Ne pas oublier de nettoyer les timers/intervals
- Ne pas utiliser d'emoji compliqués (compatibilité)
- Ne pas ignorer l'accessibilité

---

## 🎓 Exemples Additionnels

Voir dossier `assets/js/modules/examples/` pour :
- Module de chat (communication peer-to-peer)
- Module de traduction (offline)
- Module de calculatrice scientifique
- Module de timer/alarme
- Module de notes vocales

---

## 🤝 Contribution

Pour soumettre un module à la communauté :

1. Fork le repo
2. Créer branch `feature/mon-module`
3. Ajouter module dans `assets/js/modules/`
4. Documenter dans README
5. Tester sur mobile + desktop
6. Pull Request avec description détaillée

---

## 📞 Support

- Issues GitHub : [lien]
- Discord : [lien]
- Documentation : [lien]

---

**Bon développement, Vault Dweller! 🎮☢️**
