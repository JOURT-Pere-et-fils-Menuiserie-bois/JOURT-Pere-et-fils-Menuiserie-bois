/**
 * PIP-SURVIVAL - Application principale
 */

class PipBoyApp {
    constructor() {
        this.currentModule = null;
        this.modules = new Map();
        this.config = window.PIP_CONFIG;
        this.audioEnabled = true;
    }

    /**
     * Initialisation de l'app
     */
    async init() {
        console.log('🎮 PIP-SURVIVAL v' + this.config.version + ' initializing...');

        // Boot sequence
        await this.bootSequence();

        // Initialiser les modules
        this.registerModules();

        // Event listeners
        this.setupEventListeners();

        // Charger le premier module (STAT)
        this.loadModule('stat');

        // Initialiser le battery monitor
        if (window.BatteryMonitor) {
            window.BatteryMonitor.init();
        }

        // Initialiser offline detection
        if (window.OfflineManager) {
            window.OfflineManager.init();
        }

        // Update time
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);

        console.log('✓ PIP-SURVIVAL ready');
    }

    /**
     * Séquence de boot
     */
    async bootSequence() {
        const bootScreen = document.getElementById('boot-screen');
        const appContainer = document.getElementById('app');
        const progressBar = document.getElementById('boot-progress');

        // Simuler le chargement
        await this.sleep(500);

        // Animer la progress bar
        progressBar.style.width = '100%';

        // Jouer le son de démarrage (optionnel)
        this.playSound('startup');

        // Attendre la fin de l'animation
        await this.sleep(3000);

        // Masquer le boot screen
        bootScreen.style.opacity = '0';
        await this.sleep(500);
        bootScreen.style.display = 'none';

        // Afficher l'app avec effet flicker
        appContainer.style.display = 'flex';
        appContainer.classList.add('screen-flicker');
        await this.sleep(500);
        appContainer.classList.remove('screen-flicker');
    }

    /**
     * Enregistrer tous les modules
     */
    registerModules() {
        // Module STAT (statistiques)
        this.modules.set('stat', {
            name: 'STAT',
            icon: '📊',
            render: () => this.renderStatModule()
        });

        // Module DATA (recherche IA)
        this.modules.set('data', {
            name: 'DATA',
            icon: '💾',
            render: () => this.renderDataModule()
        });

        // Module MAP (carte)
        this.modules.set('map', {
            name: 'MAP',
            icon: '🗺',
            render: () => this.renderMapModule()
        });

        // Module INV (inventaire/documents)
        this.modules.set('inv', {
            name: 'INV',
            icon: '📦',
            render: () => this.renderInvModule()
        });

        // Module RADIO (communication/notes)
        this.modules.set('radio', {
            name: 'RADIO',
            icon: '📻',
            render: () => this.renderRadioModule()
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const moduleId = tab.dataset.module;
                this.loadModule(moduleId);
                this.playSound('click');

                // Update active tab
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+1-5 pour switcher entre modules
            if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                const modules = ['stat', 'data', 'map', 'inv', 'radio'];
                this.loadModule(modules[parseInt(e.key) - 1]);
            }
        });
    }

    /**
     * Charger un module
     */
    loadModule(moduleId) {
        const module = this.modules.get(moduleId);
        if (!module) {
            console.error('Module not found:', moduleId);
            return;
        }

        this.currentModule = moduleId;
        const container = document.getElementById('module-container');

        // Animation de sortie
        container.style.opacity = '0';

        setTimeout(() => {
            // Render le module
            container.innerHTML = module.render();

            // Animation d'entrée
            container.style.opacity = '1';
            container.classList.add('module');

            // Initialiser le module si nécessaire
            this.initModule(moduleId);

            // Update footer
            this.updateFooter();
        }, 200);
    }

    /**
     * Initialiser un module après render
     */
    initModule(moduleId) {
        switch (moduleId) {
            case 'stat':
                this.loadStats();
                break;
            case 'data':
                if (window.SearchModule) {
                    window.SearchModule.init();
                }
                break;
            case 'inv':
                this.loadDocuments();
                break;
        }
    }

    /**
     * Render module STAT
     */
    renderStatModule() {
        return `
            <div class="module">
                <div class="module-header">
                    <h2 class="module-title">SYSTEM STATUS</h2>
                </div>

                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-label">DOCUMENTS</div>
                        <div class="stat-value" id="stat-docs">0</div>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: 0%" id="stat-docs-bar"></div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">STORAGE USED</div>
                        <div class="stat-value" id="stat-storage">0 MB</div>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: 0%" id="stat-storage-bar"></div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">BATTERY LEVEL</div>
                        <div class="stat-value" id="stat-battery">100%</div>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: 100%" id="stat-battery-bar"></div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">OFFLINE STATUS</div>
                        <div class="stat-value">READY</div>
                        <div style="margin-top: 10px;">
                            <span class="offline-indicator"></span> FULLY OPERATIONAL
                        </div>
                    </div>
                </div>

                <div class="stat-card" style="margin-top: 20px;">
                    <div class="stat-label">CATEGORIES</div>
                    <ul class="stat-list" id="stat-categories">
                        <li><span>Water</span><span>0</span></li>
                        <li><span>Food</span><span>0</span></li>
                        <li><span>Shelter</span><span>0</span></li>
                        <li><span>Medical</span><span>0</span></li>
                        <li><span>Tools</span><span>0</span></li>
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * Render module DATA (recherche)
     */
    renderDataModule() {
        return `
            <div class="module">
                <div class="module-header">
                    <h2 class="module-title">AI SEARCH</h2>
                </div>

                <div class="search-container">
                    <div class="search-box">
                        <input type="text"
                               class="search-input"
                               id="search-input"
                               placeholder="Ask anything about survival...">
                        <button class="search-btn" id="search-btn">SEARCH</button>
                    </div>

                    <div id="search-results"></div>
                </div>
            </div>
        `;
    }

    /**
     * Render module MAP
     */
    renderMapModule() {
        return `
            <div class="module">
                <div class="module-header">
                    <h2 class="module-title">MAP</h2>
                </div>

                <div class="map-container">
                    <div class="map-placeholder">
                        📍 MAP MODULE<br>
                        <small>Offline maps coming soon</small>
                    </div>
                </div>

                <div class="location-info">
                    <div><strong>COORDINATES:</strong> <span id="map-coords">Unknown</span></div>
                    <div><strong>ALTITUDE:</strong> <span id="map-alt">Unknown</span></div>
                </div>
            </div>
        `;
    }

    /**
     * Render module INV (documents)
     */
    renderInvModule() {
        return `
            <div class="module">
                <div class="module-header">
                    <h2 class="module-title">DOCUMENTS</h2>
                    <div class="module-actions">
                        <button class="pip-btn" onclick="app.uploadDocument()">UPLOAD PDF</button>
                    </div>
                </div>

                <div class="doc-list" id="doc-list">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">LOADING...</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render module RADIO
     */
    renderRadioModule() {
        return `
            <div class="module">
                <div class="module-header">
                    <h2 class="module-title">RADIO / NOTES</h2>
                </div>

                <div class="radio-container">
                    <div class="radio-display">
                        <div class="radio-frequency">📻 PERSONAL LOG</div>
                        <p style="opacity: 0.7; text-align: center;">
                            Keep track of your survival notes, ideas, and observations.
                        </p>
                    </div>

                    <textarea class="notes-area"
                              id="notes-area"
                              placeholder="Write your survival notes here...">${this.loadNotes()}</textarea>

                    <button class="pip-btn" onclick="app.saveNotes()">SAVE NOTES</button>
                </div>
            </div>
        `;
    }

    /**
     * Charger les stats
     */
    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();

            if (data.success) {
                const stats = data.data;

                document.getElementById('stat-docs').textContent = stats.documents;
                document.getElementById('stat-docs-bar').style.width = Math.min(stats.documents * 10, 100) + '%';

                const storageMB = (stats.storage.database / 1024 / 1024).toFixed(2);
                document.getElementById('stat-storage').textContent = storageMB + ' MB';
                document.getElementById('stat-storage-bar').style.width = Math.min(storageMB / 100 * 100, 100) + '%';
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    /**
     * Charger les documents
     */
    async loadDocuments() {
        try {
            const response = await fetch('/api/documents');
            const data = await response.json();

            const container = document.getElementById('doc-list');
            if (!data.success || data.data.length === 0) {
                container.innerHTML = '<div class="stat-card">No documents yet. Upload PDFs to get started!</div>';
                return;
            }

            container.innerHTML = data.data.map(doc => `
                <div class="doc-card" onclick="app.viewDocument(${doc.id})">
                    <div class="doc-icon">📄</div>
                    <div class="doc-title">${doc.title}</div>
                    <div class="doc-meta">${doc.category}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load documents:', error);
        }
    }

    /**
     * Upload document
     */
    uploadDocument() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processUpload(file);
            }
        };
        input.click();
    }

    /**
     * Process PDF upload
     */
    async processUpload(file) {
        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                alert('PDF uploaded successfully!');
                this.loadDocuments();
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        }
    }

    /**
     * Update time
     */
    updateTime() {
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                       now.getMinutes().toString().padStart(2, '0');
        document.getElementById('status-time').textContent = timeStr;
    }

    /**
     * Update footer
     */
    updateFooter() {
        document.getElementById('footer-status').textContent = `MODULE: ${this.currentModule.toUpperCase()}`;
    }

    /**
     * Load notes from localStorage
     */
    loadNotes() {
        return localStorage.getItem('pip_survival_notes') || '';
    }

    /**
     * Save notes to localStorage
     */
    saveNotes() {
        const notes = document.getElementById('notes-area').value;
        localStorage.setItem('pip_survival_notes', notes);
        alert('Notes saved!');
        this.playSound('click');
    }

    /**
     * Play sound
     */
    playSound(soundId) {
        if (!this.audioEnabled) return;
        const audio = document.getElementById('audio-' + soundId);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialiser l'app quand le DOM est prêt
const app = new PipBoyApp();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
