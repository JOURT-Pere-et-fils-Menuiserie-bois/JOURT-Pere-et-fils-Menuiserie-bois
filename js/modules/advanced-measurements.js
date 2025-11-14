/**
 * Advanced Measurements
 * Mesures avancées: volume, formules personnalisées, comptage groupé
 */

const AdvancedMeasurements = (function() {
    let volumeThickness = 0.10; // Épaisseur par défaut: 10cm
    let customFormulas = [];
    let countGroups = {};

    /**
     * Initialiser
     */
    function init() {
        setupEventListeners();
        loadFormulas();
    }

    /**
     * Configurer écouteurs d'événements
     */
    function setupEventListeners() {
        // Écouter changement d'épaisseur pour volume
        PubSub.subscribe('volume:thickness:changed', function(data) {
            volumeThickness = parseFloat(data.thickness) || 0.10;
        });

        // Écouter création mesure pour appliquer formules
        PubSub.subscribe(EVENTS.MEASUREMENT_CREATED, function(data) {
            applyFormulas(data.measurement);
        });
    }

    /**
     * Charger formules personnalisées depuis localStorage
     */
    function loadFormulas() {
        const stored = localStorage.getItem('customFormulas');
        if (stored) {
            try {
                customFormulas = JSON.parse(stored);
            } catch(e) {
                console.error('Erreur chargement formules', e);
                customFormulas = [];
            }
        }
    }

    /**
     * Sauvegarder formules personnalisées
     */
    function saveFormulas() {
        localStorage.setItem('customFormulas', JSON.stringify(customFormulas));
    }

    // ===== VOLUME (AIRE + ÉPAISSEUR) =====

    /**
     * Calculer volume à partir d'une mesure surfacique
     * @param {number} area - Surface en m²
     * @param {number} thickness - Épaisseur en m (optionnel)
     * @returns {number} Volume en m³
     */
    function calculateVolume(area, thickness = null) {
        const t = thickness !== null ? thickness : volumeThickness;
        return area * t;
    }

    /**
     * Convertir mesure surfacique en volumétrique
     * @param {object} measurement - Mesure surfacique (rectangle, polygon, circle)
     * @param {number} thickness - Épaisseur en m
     * @returns {object} Nouvelle mesure volumétrique
     */
    function convertToVolume(measurement, thickness = null) {
        if (!['rectangle', 'polygon', 'circle'].includes(measurement.type)) {
            throw new Error('Seules les mesures surfaciques peuvent être converties en volume');
        }

        const t = thickness !== null ? thickness : volumeThickness;
        const volume = measurement.value * t;

        return {
            ...measurement,
            originalType: measurement.type,
            type: 'volume',
            value: volume,
            unit: 'm³',
            surfaceArea: measurement.value,
            thickness: t,
            created_at: new Date().toISOString()
        };
    }

    /**
     * Définir épaisseur par défaut pour calculs volumétriques
     * @param {number} thickness - Épaisseur en mètres
     */
    function setVolumeThickness(thickness) {
        volumeThickness = parseFloat(thickness);
        if (volumeThickness <= 0) {
            volumeThickness = 0.10; // Défaut 10cm
        }
        PubSub.publish('volume:thickness:changed', { thickness: volumeThickness });
    }

    /**
     * Obtenir épaisseur actuelle
     */
    function getVolumeThickness() {
        return volumeThickness;
    }

    // ===== FORMULES PERSONNALISÉES =====

    /**
     * Créer formule personnalisée
     * @param {object} formula - Définition formule
     * @example
     * {
     *   id: 'fenetre_pvc',
     *   name: 'Fenêtre PVC avec pose',
     *   description: 'Surface fenêtre + 10% joints + 0.5m périmètre pose',
     *   baseType: 'rectangle',
     *   calculate: function(measurement) {
     *     const surface = measurement.value;
     *     const perimeter = calculatePerimeter(measurement);
     *     return {
     *       surface: surface * 1.10,
     *       pose: perimeter * 0.5,
     *       total: surface * 1.10 + perimeter * 0.5
     *     };
     *   }
     * }
     */
    function createFormula(formula) {
        if (!formula.id || !formula.name || !formula.calculate) {
            throw new Error('Formule invalide: id, name et calculate requis');
        }

        // Vérifier si existe déjà
        const index = customFormulas.findIndex(f => f.id === formula.id);
        if (index >= 0) {
            customFormulas[index] = formula;
        } else {
            customFormulas.push(formula);
        }

        saveFormulas();
        PubSub.publish('formula:created', { formula });
    }

    /**
     * Supprimer formule
     */
    function deleteFormula(formulaId) {
        customFormulas = customFormulas.filter(f => f.id !== formulaId);
        saveFormulas();
        PubSub.publish('formula:deleted', { formulaId });
    }

    /**
     * Obtenir toutes les formules
     */
    function getFormulas() {
        return customFormulas;
    }

    /**
     * Appliquer formules automatiquement à une mesure
     */
    function applyFormulas(measurement) {
        const applicable = customFormulas.filter(f =>
            !f.baseType || f.baseType === measurement.type
        );

        applicable.forEach(formula => {
            try {
                const result = formula.calculate(measurement);
                measurement.formulaResults = measurement.formulaResults || {};
                measurement.formulaResults[formula.id] = result;
            } catch(e) {
                console.error(`Erreur application formule ${formula.id}`, e);
            }
        });
    }

    /**
     * Appliquer formule spécifique à mesure
     */
    function applyFormula(measurement, formulaId) {
        const formula = customFormulas.find(f => f.id === formulaId);
        if (!formula) {
            throw new Error(`Formule ${formulaId} introuvable`);
        }

        try {
            const result = formula.calculate(measurement);
            measurement.formulaResults = measurement.formulaResults || {};
            measurement.formulaResults[formulaId] = result;
            return result;
        } catch(e) {
            console.error(`Erreur application formule ${formulaId}`, e);
            throw e;
        }
    }

    // ===== COMPTAGE GROUPÉ =====

    /**
     * Créer groupe de comptage
     * @param {string} groupName - Nom du groupe (ex: "Fenêtres RDC", "Portes R+1")
     * @param {string} category - Catégorie (ex: "Fenêtres", "Portes", "Prises électriques")
     * @param {object} properties - Propriétés personnalisées (couleur, symbole, etc.)
     */
    function createCountGroup(groupName, category, properties = {}) {
        const groupId = 'count_group_' + Date.now();

        countGroups[groupId] = {
            id: groupId,
            name: groupName,
            category: category,
            count: 0,
            items: [],
            color: properties.color || '#0066FF',
            symbol: properties.symbol || null,
            description: properties.description || '',
            created_at: new Date().toISOString()
        };

        PubSub.publish('count:group:created', { group: countGroups[groupId] });
        return groupId;
    }

    /**
     * Ajouter élément à groupe de comptage
     */
    function addToCountGroup(groupId, measurement) {
        if (!countGroups[groupId]) {
            throw new Error(`Groupe ${groupId} introuvable`);
        }

        countGroups[groupId].items.push(measurement.id);
        countGroups[groupId].count = countGroups[groupId].items.length;

        // Associer mesure au groupe
        measurement.countGroup = groupId;

        PubSub.publish('count:group:updated', { groupId, group: countGroups[groupId] });
    }

    /**
     * Retirer élément d'un groupe
     */
    function removeFromCountGroup(groupId, measurementId) {
        if (!countGroups[groupId]) return;

        countGroups[groupId].items = countGroups[groupId].items.filter(id => id !== measurementId);
        countGroups[groupId].count = countGroups[groupId].items.length;

        PubSub.publish('count:group:updated', { groupId, group: countGroups[groupId] });
    }

    /**
     * Obtenir tous les groupes de comptage
     */
    function getCountGroups() {
        return countGroups;
    }

    /**
     * Obtenir total d'un groupe
     */
    function getCountGroupTotal(groupId) {
        if (!countGroups[groupId]) return 0;
        return countGroups[groupId].count;
    }

    /**
     * Supprimer groupe de comptage
     */
    function deleteCountGroup(groupId) {
        delete countGroups[groupId];
        PubSub.publish('count:group:deleted', { groupId });
    }

    // ===== UTILITAIRES =====

    /**
     * Calculer périmètre d'une forme
     */
    function calculatePerimeter(measurement) {
        switch(measurement.type) {
            case 'rectangle':
                const width = Math.abs(measurement.coordinates.bottomRight.x - measurement.coordinates.topLeft.x);
                const height = Math.abs(measurement.coordinates.bottomRight.y - measurement.coordinates.topLeft.y);
                const perimeterPixels = 2 * (width + height);
                return CalibrationManager.pixelsToMeters(perimeterPixels);

            case 'circle':
                const circumferencePixels = 2 * Math.PI * measurement.coordinates.radius;
                return CalibrationManager.pixelsToMeters(circumferencePixels);

            case 'polygon':
            case 'polyline':
                let totalLength = 0;
                const points = measurement.coordinates.points;
                for (let i = 0; i < points.length; i++) {
                    const next = (i + 1) % points.length;
                    const dx = points[next].x - points[i].x;
                    const dy = points[next].y - points[i].y;
                    totalLength += Math.sqrt(dx * dx + dy * dy);
                }
                return CalibrationManager.pixelsToMeters(totalLength);

            default:
                return 0;
        }
    }

    /**
     * Calculer dimensions d'une forme (largeur, hauteur)
     */
    function calculateDimensions(measurement) {
        switch(measurement.type) {
            case 'rectangle':
                const widthPx = Math.abs(measurement.coordinates.bottomRight.x - measurement.coordinates.topLeft.x);
                const heightPx = Math.abs(measurement.coordinates.bottomRight.y - measurement.coordinates.topLeft.y);
                return {
                    width: CalibrationManager.pixelsToMeters(widthPx),
                    height: CalibrationManager.pixelsToMeters(heightPx)
                };

            case 'circle':
                const diameter = CalibrationManager.pixelsToMeters(measurement.coordinates.radius * 2);
                return {
                    diameter: diameter,
                    radius: diameter / 2
                };

            case 'line':
                const length = Math.sqrt(
                    Math.pow(measurement.coordinates.end.x - measurement.coordinates.start.x, 2) +
                    Math.pow(measurement.coordinates.end.y - measurement.coordinates.start.y, 2)
                );
                return {
                    length: CalibrationManager.pixelsToMeters(length)
                };

            default:
                return {};
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
        // Volume
        calculateVolume,
        convertToVolume,
        setVolumeThickness,
        getVolumeThickness,

        // Formules
        createFormula,
        deleteFormula,
        getFormulas,
        applyFormula,

        // Comptage groupé
        createCountGroup,
        addToCountGroup,
        removeFromCountGroup,
        getCountGroups,
        getCountGroupTotal,
        deleteCountGroup,

        // Utilitaires
        calculatePerimeter,
        calculateDimensions
    };
})();
