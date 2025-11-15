/**
 * Drawing Manager
 * Gère le rendu des annotations et mesures sur le SVG
 */

const DrawingManager = (function() {
    let svg = null;
    let currentLayer = null;

    /**
     * Initialiser
     */
    function init() {
        svg = document.getElementById('annotations-layer');
        if (!svg) {
            console.error('CRITICAL: SVG annotations layer "annotations-layer" not found');
            return;
        }

        // Écouter les événements
        setupEventListeners();
    }

    /**
     * Vérifier que le module est initialisé
     */
    function checkInit() {
        if (!svg) {
            console.error('DrawingManager not initialized: SVG layer missing');
            return false;
        }
        return true;
    }

    /**
     * Configurer les écouteurs d'événements
     */
    function setupEventListeners() {
        PubSub.subscribe(EVENTS.MEASUREMENT_CREATED, function(data) {
            drawMeasurement(data.measurement);
        });

        PubSub.subscribe(EVENTS.MEASUREMENT_UPDATED, function(data) {
            updateMeasurement(data.measurement);
        });

        PubSub.subscribe(EVENTS.MEASUREMENT_DELETED, function(data) {
            removeMeasurement(data.measurementId);
        });

        PubSub.subscribe(EVENTS.LAYER_VISIBILITY_CHANGED, function(data) {
            toggleLayerVisibility(data.layerId, data.visible);
        });
    }

    /**
     * Dessiner une mesure
     */
    function drawMeasurement(measurement) {
        if (!checkInit()) {
            console.error('Cannot draw measurement: DrawingManager not initialized');
            return;
        }

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = `measurement-${measurement.id}`;
        group.classList.add('measurement-item');
        group.dataset.measurementId = measurement.id;
        group.dataset.type = measurement.type;

        switch(measurement.type) {
            case 'line':
                drawLine(group, measurement);
                break;
            case 'polyline':
                drawPolyline(group, measurement);
                break;
            case 'rectangle':
                drawRectangle(group, measurement);
                break;
            case 'polygon':
                drawPolygon(group, measurement);
                break;
            case 'circle':
                drawCircle(group, measurement);
                break;
            case 'count':
                drawCountPoint(group, measurement);
                break;
        }

        // Ajouter au SVG d'abord (nécessaire pour getBBox())
        svg.appendChild(group);

        // Ajouter label avec mesure (après insertion dans DOM)
        if (measurement.value) {
            addLabel(group, measurement);
        }

        // Rendre interactif
        makeInteractive(group, measurement);
    }

    /**
     * Dessiner une ligne
     */
    function drawLine(group, measurement) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', measurement.coordinates.start.x);
        line.setAttribute('y1', measurement.coordinates.start.y);
        line.setAttribute('x2', measurement.coordinates.end.x);
        line.setAttribute('y2', measurement.coordinates.end.y);
        line.setAttribute('stroke', measurement.color || '#FF0000');
        line.setAttribute('stroke-width', measurement.thickness || 2);
        line.classList.add('measurement-line');

        group.appendChild(line);
    }

    /**
     * Dessiner une polyligne
     */
    function drawPolyline(group, measurement) {
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');

        const points = measurement.coordinates.points
            .map(p => `${p.x},${p.y}`)
            .join(' ');

        polyline.setAttribute('points', points);
        polyline.setAttribute('stroke', measurement.color || '#FF0000');
        polyline.setAttribute('stroke-width', measurement.thickness || 2);
        polyline.setAttribute('fill', 'none');
        polyline.classList.add('measurement-line');

        group.appendChild(polyline);
    }

    /**
     * Dessiner un rectangle
     */
    function drawRectangle(group, measurement) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        const x = Math.min(measurement.coordinates.topLeft.x, measurement.coordinates.bottomRight.x);
        const y = Math.min(measurement.coordinates.topLeft.y, measurement.coordinates.bottomRight.y);
        const width = Math.abs(measurement.coordinates.bottomRight.x - measurement.coordinates.topLeft.x);
        const height = Math.abs(measurement.coordinates.bottomRight.y - measurement.coordinates.topLeft.y);

        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('stroke', measurement.color || '#FF0000');
        rect.setAttribute('stroke-width', measurement.thickness || 2);
        rect.setAttribute('fill', measurement.fillColor || measurement.color || '#FF0000');
        rect.setAttribute('fill-opacity', measurement.opacity || 0.3);
        rect.classList.add('measurement-polygon');

        group.appendChild(rect);
    }

    /**
     * Dessiner un polygone
     */
    function drawPolygon(group, measurement) {
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

        const points = measurement.coordinates.points
            .map(p => `${p.x},${p.y}`)
            .join(' ');

        polygon.setAttribute('points', points);
        polygon.setAttribute('stroke', measurement.color || '#FF0000');
        polygon.setAttribute('stroke-width', measurement.thickness || 2);
        polygon.setAttribute('fill', measurement.fillColor || measurement.color || '#FF0000');
        polygon.setAttribute('fill-opacity', measurement.opacity || 0.3);
        polygon.classList.add('measurement-polygon');

        // Ajouter motif de hachure si demandé
        if (measurement.pattern) {
            addPattern(group, measurement);
        }

        group.appendChild(polygon);
    }

    /**
     * Dessiner un cercle
     */
    function drawCircle(group, measurement) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

        circle.setAttribute('cx', measurement.coordinates.center.x);
        circle.setAttribute('cy', measurement.coordinates.center.y);
        circle.setAttribute('r', measurement.coordinates.radius);
        circle.setAttribute('stroke', measurement.color || '#FF0000');
        circle.setAttribute('stroke-width', measurement.thickness || 2);
        circle.setAttribute('fill', measurement.fillColor || measurement.color || '#FF0000');
        circle.setAttribute('fill-opacity', measurement.opacity || 0.3);
        circle.classList.add('measurement-polygon');

        group.appendChild(circle);
    }

    /**
     * Dessiner un point de comptage
     */
    function drawCountPoint(group, measurement) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

        circle.setAttribute('cx', measurement.coordinates.x);
        circle.setAttribute('cy', measurement.coordinates.y);
        circle.setAttribute('r', 8);
        circle.setAttribute('stroke', measurement.color || '#0066FF');
        circle.setAttribute('stroke-width', 2);
        circle.setAttribute('fill', '#FFFFFF');
        circle.classList.add('measurement-point');

        group.appendChild(circle);

        // Ajouter numéro
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', measurement.coordinates.x);
        text.setAttribute('y', measurement.coordinates.y + 4);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', measurement.color || '#0066FF');
        text.textContent = measurement.number || '1';

        group.appendChild(text);
    }

    /**
     * Ajouter un label avec la valeur de mesure
     */
    function addLabel(group, measurement) {
        const bbox = group.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centerX);
        text.setAttribute('y', centerY);
        text.setAttribute('text-anchor', 'middle');
        text.classList.add('measurement-label');

        let label = '';
        if (measurement.type === 'line' || measurement.type === 'polyline') {
            label = `${measurement.value.toFixed(2)} m`;
        } else if (measurement.type === 'polygon' || measurement.type === 'rectangle' || measurement.type === 'circle') {
            label = `${measurement.value.toFixed(2)} m²`;
        } else if (measurement.type === 'count') {
            label = `${measurement.value}`;
        }

        text.textContent = label;

        group.appendChild(text);
    }

    /**
     * Ajouter un motif de hachure
     */
    function addPattern(group, measurement) {
        // TODO: Implémenter patterns de hachure
        // Créer des patterns SVG pour différents types de hachures
    }

    /**
     * Rendre un élément interactif
     */
    function makeInteractive(group, measurement) {
        group.style.cursor = 'pointer';

        group.addEventListener('click', function(e) {
            e.stopPropagation();
            selectMeasurement(measurement.id);
        });

        group.addEventListener('mouseenter', function() {
            group.classList.add('highlighted');
        });

        group.addEventListener('mouseleave', function() {
            group.classList.remove('highlighted');
        });
    }

    /**
     * Sélectionner une mesure
     */
    function selectMeasurement(measurementId) {
        // Désélectionner tout
        document.querySelectorAll('.measurement-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Sélectionner l'élément
        const element = document.getElementById(`measurement-${measurementId}`);
        if (element) {
            element.classList.add('selected');
            PubSub.publish(EVENTS.MEASUREMENT_SELECTED, { measurementId });
        }
    }

    /**
     * Mettre à jour une mesure
     */
    function updateMeasurement(measurement) {
        removeMeasurement(measurement.id);
        drawMeasurement(measurement);
    }

    /**
     * Supprimer une mesure
     */
    function removeMeasurement(measurementId) {
        const element = document.getElementById(`measurement-${measurementId}`);
        if (element) {
            element.remove();
        }
    }

    /**
     * Effacer toutes les mesures
     */
    function clearAll() {
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
    }

    /**
     * Basculer visibilité d'un calque
     */
    function toggleLayerVisibility(layerId, visible) {
        const elements = svg.querySelectorAll(`[data-layer-id="${layerId}"]`);
        elements.forEach(element => {
            element.style.display = visible ? 'block' : 'none';
        });
    }

    /**
     * Obtenir le SVG
     */
    function getSVG() {
        return svg;
    }

    // Initialiser
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API publique
    return {
        drawMeasurement,
        updateMeasurement,
        removeMeasurement,
        clearAll,
        selectMeasurement,
        toggleLayerVisibility,
        getSVG
    };
})();
