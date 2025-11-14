/**
 * Module System - Système de modules extensible RÉEL
 * Permet le chargement dynamique et hot-reload des modules
 */

class ModuleSystem {
    constructor() {
        this.modules = new Map();
        this.currentModule = null;
        this.moduleInstances = new Map();
    }

    /**
     * Enregistrer un module
     */
    register(moduleDefinition) {
        if (!moduleDefinition.id) {
            console.error('Module must have an id:', moduleDefinition);
            return false;
        }

        if (this.modules.has(moduleDefinition.id)) {
            console.warn(`Module ${moduleDefinition.id} already registered. Overwriting.`);
        }

        // Valider structure du module
        if (!this.validateModule(moduleDefinition)) {
            console.error('Invalid module structure:', moduleDefinition);
            return false;
        }

        this.modules.set(moduleDefinition.id, moduleDefinition);
        console.log(`✓ Module registered: ${moduleDefinition.id}`);

        // Créer instance
        this.createInstance(moduleDefinition.id);

        return true;
    }

    /**
     * Valider structure d'un module
     */
    validateModule(mod) {
        const required = ['id', 'name', 'render'];
        for (const prop of required) {
            if (!(prop in mod)) {
                console.error(`Module missing required property: ${prop}`);
                return false;
            }
        }

        if (typeof mod.render !== 'function') {
            console.error('Module.render must be a function');
            return false;
        }

        return true;
    }

    /**
     * Créer instance d'un module
     */
    async createInstance(moduleId) {
        const definition = this.modules.get(moduleId);
        if (!definition) {
            console.error(`Module not found: ${moduleId}`);
            return null;
        }

        // Si c'est une classe, instancier
        if (typeof definition === 'function') {
            const instance = new definition();
            this.moduleInstances.set(moduleId, instance);

            if (instance.init) {
                await instance.init();
            }

            return instance;
        }

        // Si c'est un objet, l'utiliser directement
        this.moduleInstances.set(moduleId, definition);

        if (definition.init) {
            await definition.init();
        }

        return definition;
    }

    /**
     * Charger et afficher un module
     */
    async load(moduleId) {
        const instance = this.moduleInstances.get(moduleId);
        if (!instance) {
            console.error(`Module instance not found: ${moduleId}`);
            return false;
        }

        // Désactiver module précédent
        if (this.currentModule && this.currentModule !== moduleId) {
            await this.deactivate(this.currentModule);
        }

        // Activer nouveau module
        this.currentModule = moduleId;

        try {
            // Appeler onActivate
            if (instance.onActivate) {
                await instance.onActivate();
            }

            // Render le module
            const html = instance.render();
            const container = document.getElementById('module-container');

            if (container) {
                // Animation de transition
                container.style.opacity = '0';

                setTimeout(() => {
                    container.innerHTML = html;
                    container.style.opacity = '1';

                    // Appeler onRender si existe
                    if (instance.onRender) {
                        instance.onRender();
                    }
                }, 200);
            }

            // Update nav active
            this.updateNavigation(moduleId);

            console.log(`✓ Module loaded: ${moduleId}`);
            return true;

        } catch (error) {
            console.error(`Failed to load module ${moduleId}:`, error);
            return false;
        }
    }

    /**
     * Désactiver un module
     */
    async deactivate(moduleId) {
        const instance = this.moduleInstances.get(moduleId);
        if (!instance) return;

        if (instance.onDeactivate) {
            await instance.onDeactivate();
        }
    }

    /**
     * Recharger un module (pour dev)
     */
    async reload(moduleId) {
        console.log(`🔄 Reloading module: ${moduleId}`);

        // Cleanup ancien
        await this.unload(moduleId);

        // Recharger
        await this.createInstance(moduleId);

        // Si c'est le module actif, le recharger
        if (this.currentModule === moduleId) {
            await this.load(moduleId);
        }
    }

    /**
     * Décharger un module
     */
    async unload(moduleId) {
        const instance = this.moduleInstances.get(moduleId);
        if (!instance) return;

        // Cleanup
        if (instance.cleanup) {
            await instance.cleanup();
        }

        this.moduleInstances.delete(moduleId);
    }

    /**
     * Update navigation active state
     */
    updateNavigation(moduleId) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            if (tab.dataset.module === moduleId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    /**
     * Obtenir tous les modules
     */
    getAll() {
        return Array.from(this.modules.values());
    }

    /**
     * Obtenir un module spécifique
     */
    get(moduleId) {
        return this.moduleInstances.get(moduleId);
    }

    /**
     * Charger modules depuis fichiers externes
     */
    async loadFromScript(scriptPath) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.onload = () => {
                console.log(`✓ Script loaded: ${scriptPath}`);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Auto-découverte de modules
     */
    async discoverModules(modulePath = '/assets/js/modules/') {
        try {
            // Obtenir la liste des modules depuis l'API
            const response = await fetch('/api/modules');
            const data = await response.json();

            if (data.success) {
                // Charger chaque module
                for (const moduleFile of data.data) {
                    await this.loadFromScript(modulePath + moduleFile);
                }
            }
        } catch (error) {
            console.warn('Auto-discovery failed, using default modules:', error);
        }
    }

    /**
     * Envoyer message à un module
     */
    async sendMessage(moduleId, message, data) {
        const instance = this.moduleInstances.get(moduleId);
        if (!instance) {
            console.warn(`Module not found: ${moduleId}`);
            return null;
        }

        if (instance.onMessage) {
            return await instance.onMessage(message, data);
        }

        return null;
    }

    /**
     * Broadcast message à tous les modules
     */
    async broadcast(message, data) {
        const promises = [];

        for (const [moduleId, instance] of this.moduleInstances) {
            if (instance.onMessage) {
                promises.push(instance.onMessage(message, data));
            }
        }

        return Promise.all(promises);
    }
}

// Créer instance globale
window.moduleSystem = new ModuleSystem();

// Auto-enregistrer modules depuis window.PipBoyModules
window.addEventListener('DOMContentLoaded', () => {
    if (window.PipBoyModules && Array.isArray(window.PipBoyModules)) {
        console.log(`📦 Auto-registering ${window.PipBoyModules.length} modules...`);

        for (const mod of window.PipBoyModules) {
            window.moduleSystem.register(mod);
        }
    }
});

// Expose pour console (dev)
window.ModuleSystem = ModuleSystem;
