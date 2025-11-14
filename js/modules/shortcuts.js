/**
 * Keyboard Shortcuts Manager
 * Gestion des raccourcis clavier
 */

const ShortcutsManager = (function() {
    const shortcuts = new Map();

    /**
     * Initialiser
     */
    function init() {
        registerDefaultShortcuts();
        document.addEventListener('keydown', handleKeyDown);
        console.log('ShortcutsManager initialized');
    }

    /**
     * Enregistrer les raccourcis par défaut
     */
    function registerDefaultShortcuts() {
        // Navigation
        register('ctrl+o', () => {
            document.getElementById('btn-open-project')?.click();
        }, 'Ouvrir un projet');

        register('ctrl+n', () => {
            document.getElementById('btn-new-project')?.click();
        }, 'Nouveau projet');

        register('ctrl+s', (e) => {
            e.preventDefault();
            if (typeof AutoSave !== 'undefined') {
                AutoSave.saveNow();
                if (typeof InfoPanel !== 'undefined') {
                    InfoPanel.updateSaveIndicator('saved');
                }
            }
        }, 'Sauvegarder');

        register('ctrl+p', (e) => {
            e.preventDefault();
            document.getElementById('btn-upload-plan')?.click();
        }, 'Charger un plan');

        register('ctrl+e', (e) => {
            e.preventDefault();
            document.getElementById('btn-export')?.click();
        }, 'Exporter');

        // Outils
        register('v', () => selectTool('select'), 'Outil Sélection');
        register('h', () => selectTool('pan'), 'Outil Déplacement');
        register('l', () => selectTool('line'), 'Outil Ligne');
        register('p', () => selectTool('polyline'), 'Outil Polyligne');
        register('r', () => selectTool('rectangle'), 'Outil Rectangle');
        register('g', () => selectTool('polygon'), 'Outil Polygone');
        register('c', () => selectTool('circle'), 'Outil Cercle');
        register('n', () => selectTool('count'), 'Outil Comptage');

        // Calibration
        register('alt+c', () => {
            document.getElementById('btn-calibrate')?.click();
        }, 'Calibrer l\'échelle');

        // Zoom
        register('+', () => {
            document.getElementById('btn-zoom-in')?.click();
        }, 'Zoom avant');

        register('-', () => {
            document.getElementById('btn-zoom-out')?.click();
        }, 'Zoom arrière');

        register('0', () => {
            document.getElementById('btn-zoom-fit')?.click();
        }, 'Ajuster le zoom');

        // Navigation PDF
        register('pageup', () => {
            document.getElementById('btn-prev-page')?.click();
        }, 'Page précédente');

        register('pagedown', () => {
            document.getElementById('btn-next-page')?.click();
        }, 'Page suivante');

        // Annulation
        register('escape', () => {
            // Désélectionner tout
            PubSub.publish('selection:clear');
            // Fermer les modales
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }, 'Annuler / Désélectionner');

        // Suppression
        register('delete', () => {
            PubSub.publish('selection:delete');
        }, 'Supprimer la sélection');

        // Aide
        register('f1', (e) => {
            e.preventDefault();
            showShortcutsHelp();
        }, 'Afficher l\'aide des raccourcis');
    }

    /**
     * Enregistrer un raccourci
     */
    function register(keys, callback, description = '') {
        const normalizedKey = normalizeKey(keys);
        shortcuts.set(normalizedKey, { callback, description });
    }

    /**
     * Normaliser la touche
     */
    function normalizeKey(key) {
        return key.toLowerCase().trim();
    }

    /**
     * Gérer l'appui de touche
     */
    function handleKeyDown(e) {
        // Ignorer si on est dans un input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            // Sauf pour Escape et Ctrl+S
            if (e.key !== 'Escape' && !(e.ctrlKey && e.key === 's')) {
                return;
            }
        }

        const key = buildKeyString(e);
        const shortcut = shortcuts.get(key);

        if (shortcut) {
            shortcut.callback(e);
        }
    }

    /**
     * Construire la chaîne de touche
     */
    function buildKeyString(e) {
        const parts = [];

        if (e.ctrlKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');

        const key = e.key.toLowerCase();

        // Touches spéciales
        const specialKeys = {
            ' ': 'space',
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right'
        };

        parts.push(specialKeys[key] || key);

        return parts.join('+');
    }

    /**
     * Sélectionner un outil
     */
    function selectTool(toolName) {
        const toolButton = document.querySelector(`[data-tool="${toolName}"]`);
        if (toolButton) {
            toolButton.click();
        }
    }

    /**
     * Afficher l'aide des raccourcis
     */
    function showShortcutsHelp() {
        let helpText = '⌨️ RACCOURCIS CLAVIER\n\n';

        // Grouper par catégorie
        const categories = {
            'Navigation': ['ctrl+o', 'ctrl+n', 'ctrl+s', 'ctrl+p', 'ctrl+e'],
            'Outils': ['v', 'h', 'l', 'p', 'r', 'g', 'c', 'n'],
            'Zoom': ['+', '-', '0'],
            'PDF': ['pageup', 'pagedown'],
            'Autres': ['alt+c', 'escape', 'delete', 'f1']
        };

        Object.entries(categories).forEach(([category, keys]) => {
            helpText += `${category}:\n`;
            keys.forEach(key => {
                const shortcut = shortcuts.get(key);
                if (shortcut) {
                    helpText += `  ${key.toUpperCase().padEnd(15)} - ${shortcut.description}\n`;
                }
            });
            helpText += '\n';
        });

        alert(helpText);
    }

    /**
     * Désactiver
     */
    function destroy() {
        document.removeEventListener('keydown', handleKeyDown);
        shortcuts.clear();
    }

    // API publique
    return {
        init,
        register,
        showShortcutsHelp,
        destroy
    };
})();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ShortcutsManager.init);
} else {
    ShortcutsManager.init();
}
