/**
 * Layer Manager
 * Gère les calques d'annotations
 */

const LayerManager = (function() {
    let layers = [];
    let currentLayer = null;
    let layerIdCounter = 1;

    /**
     * Initialiser
     */
    function init() {
        // Créer un calque par défaut
        createLayer('Défaut', '#FF0000');

        setupEventListeners();
        render();
    }

    /**
     * Configurer les écouteurs d'événements
     */
    function setupEventListeners() {
        const btnAddLayer = document.getElementById('btn-add-layer');
        if (btnAddLayer) {
            btnAddLayer.addEventListener('click', showAddLayerDialog);
        }
    }

    /**
     * Créer un calque
     */
    function createLayer(name, color) {
        const layer = {
            id: layerIdCounter++,
            name: name,
            color: color || '#FF0000',
            visible: true,
            locked: false,
            measurements: []
        };

        layers.push(layer);

        if (!currentLayer) {
            currentLayer = layer;
        }

        PubSub.publish(EVENTS.LAYER_CREATED, { layer });

        render();

        return layer;
    }

    /**
     * Afficher dialogue ajout calque
     */
    function showAddLayerDialog() {
        const name = prompt('Nom du calque:', `Calque ${layers.length + 1}`);
        if (name) {
            const color = prompt('Couleur (hex):', '#0066FF');
            createLayer(name, color);
        }
    }

    /**
     * Changer de calque actif
     */
    function setCurrentLayer(layerId) {
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
            currentLayer = layer;
            PubSub.publish(EVENTS.LAYER_CHANGED, { layer });
            render();
        }
    }

    /**
     * Basculer visibilité
     */
    function toggleVisibility(layerId) {
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
            PubSub.publish(EVENTS.LAYER_VISIBILITY_CHANGED, {
                layerId: layerId,
                visible: layer.visible
            });
            render();
        }
    }

    /**
     * Basculer verrouillage
     */
    function toggleLocked(layerId) {
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
            layer.locked = !layer.locked;
            render();
        }
    }

    /**
     * Supprimer calque
     */
    function deleteLayer(layerId) {
        if (layers.length === 1) {
            alert('Impossible de supprimer le dernier calque');
            return;
        }

        const index = layers.findIndex(l => l.id === layerId);
        if (index !== -1) {
            if (confirm(`Supprimer le calque "${layers[index].name}" ?`)) {
                layers.splice(index, 1);

                if (currentLayer && currentLayer.id === layerId) {
                    currentLayer = layers[0];
                }

                PubSub.publish(EVENTS.LAYER_DELETED, { layerId });
                render();
            }
        }
    }

    /**
     * Afficher les calques
     */
    function render() {
        const container = document.getElementById('layers-list');
        if (!container) return;

        container.innerHTML = '';

        layers.forEach(layer => {
            const item = document.createElement('div');
            item.className = 'layer-item' + (layer.id === currentLayer?.id ? ' active' : '');
            item.dataset.layerId = layer.id;

            item.innerHTML = `
                <input type="checkbox"
                       ${layer.visible ? 'checked' : ''}
                       onchange="LayerManager.toggleVisibility(${layer.id})"
                       title="Visible">
                <div style="width: 16px; height: 16px; background: ${layer.color}; border: 1px solid #ccc; border-radius: 3px;"></div>
                <span style="flex: 1;">${layer.name}</span>
                ${layer.locked ? '🔒' : ''}
                <button class="btn-small" onclick="LayerManager.deleteLayer(${layer.id})" title="Supprimer">×</button>
            `;

            item.addEventListener('click', function(e) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                    setCurrentLayer(layer.id);
                }
            });

            container.appendChild(item);
        });
    }

    /**
     * Obtenir calque actuel
     */
    function getCurrentLayer() {
        return currentLayer;
    }

    /**
     * Obtenir tous les calques
     */
    function getLayers() {
        return layers;
    }

    /**
     * Exporter les calques en JSON
     */
    function exportToJSON() {
        return JSON.stringify(layers, null, 2);
    }

    /**
     * Importer depuis JSON
     */
    function importFromJSON(json) {
        try {
            const imported = JSON.parse(json);
            layers = imported;
            currentLayer = layers[0];
            render();
            return true;
        } catch (error) {
            console.error('Error importing layers:', error);
            return false;
        }
    }

    // Initialiser
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API publique
    return {
        createLayer,
        setCurrentLayer,
        toggleVisibility,
        toggleLocked,
        deleteLayer,
        getCurrentLayer,
        getLayers,
        exportToJSON,
        importFromJSON
    };
})();
