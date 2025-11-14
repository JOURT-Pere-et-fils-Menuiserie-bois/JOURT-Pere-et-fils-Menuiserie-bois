/**
 * Tools Manager
 * Gère les outils de mesure (ligne, surface, comptage...)
 */

const ToolsManager = (function() {
    let currentTool = null;
    let isDrawing = false;
    let currentPoints = [];
    let tempElement = null;
    let measurements = [];
    let measurementIdCounter = 1;

    // Helper: Générer ID unique pour mesure
    function generateMeasurementId() {
        return 'meas-' + (measurementIdCounter++);
    }

    // Helper: Vérifier calibration avant mesure
    function checkCalibration() {
        if (typeof CalibrationManager === 'undefined') {
            alert('Erreur: Module de calibration non chargé');
            return false;
        }
        if (!CalibrationManager.getScale()) {
            alert('⚠️ Veuillez calibrer l\'échelle avant de mesurer\n\nCliquez sur le bouton "Calibrer" et tracez une ligne sur une dimension connue du plan.');
            return false;
        }
        return true;
    }

    // Propriétés courantes
    let toolProperties = {
        color: '#FF0000',
        thickness: 2,
        opacity: 0.5,
        fillColor: null
    };

    /**
     * Initialiser
     */
    function init() {
        setupEventListeners();
    }

    /**
     * Configurer les écouteurs d'événements
     */
    function setupEventListeners() {
        const canvas = document.getElementById('plan-canvas');

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('dblclick', handleDoubleClick);

        // Écouter changement d'outil
        PubSub.subscribe(EVENTS.TOOL_CHANGED, function(data) {
            currentTool = data.tool;

            // Si c'est un outil markup, notifier le MarkupManager
            if (currentTool && currentTool.startsWith('markup:')) {
                PubSub.publish('markup:tool:changed', { tool: currentTool });
            }

            cancelCurrentDrawing();
        });

        // Écouter changement de propriétés
        PubSub.subscribe('tool:properties:changed', function(data) {
            toolProperties = { ...toolProperties, ...data };
        });

        // Touche Echap pour annuler
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                cancelCurrentDrawing();
            }
        });
    }

    /**
     * Gérer mousedown
     */
    function handleMouseDown(e) {
        if (!currentTool || currentTool === 'select' || currentTool === 'pan') {
            return;
        }

        const point = getCanvasPoint(e);

        switch(currentTool) {
            case 'line':
                startLine(point);
                break;
            case 'rectangle':
                startRectangle(point);
                break;
            case 'circle':
                startCircle(point);
                break;
        }
    }

    /**
     * Gérer mousemove
     */
    function handleMouseMove(e) {
        const point = getCanvasPoint(e);

        // Mettre à jour position curseur
        updateCursorPosition(point);

        if (!isDrawing) return;

        switch(currentTool) {
            case 'line':
                updateLine(point);
                break;
            case 'polyline':
                updatePolyline(point);
                break;
            case 'polygon':
                updatePolygon(point);
                break;
            case 'rectangle':
                updateRectangle(point);
                break;
            case 'circle':
                updateCircle(point);
                break;
        }
    }

    /**
     * Gérer mouseup
     */
    function handleMouseUp(e) {
        if (!isDrawing) return;

        const point = getCanvasPoint(e);

        switch(currentTool) {
            case 'line':
                finishLine(point);
                break;
            case 'rectangle':
                finishRectangle(point);
                break;
            case 'circle':
                finishCircle(point);
                break;
        }
    }

    /**
     * Gérer click
     */
    function handleClick(e) {
        if (!currentTool) return;

        const point = getCanvasPoint(e);

        switch(currentTool) {
            case 'polyline':
                addPolylinePoint(point);
                break;
            case 'polygon':
                addPolygonPoint(point);
                break;
            case 'count':
                addCountPoint(point);
                break;
        }
    }

    /**
     * Gérer double-click
     */
    function handleDoubleClick(e) {
        e.preventDefault();

        switch(currentTool) {
            case 'polyline':
                finishPolyline();
                break;
            case 'polygon':
                finishPolygon();
                break;
        }
    }

    /**
     * Obtenir point canvas à partir de l'événement
     */
    function getCanvasPoint(e) {
        const canvas = document.getElementById('plan-canvas');
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    /**
     * Mettre à jour position curseur
     */
    function updateCursorPosition(point) {
        const positionDisplay = document.getElementById('cursor-position');
        if (positionDisplay) {
            const scale = CalibrationManager.getScale();
            if (scale) {
                const meters = CalibrationManager.pixelsToMeters(
                    Math.sqrt(point.x * point.x + point.y * point.y)
                );
                positionDisplay.textContent = `Position: ${point.x.toFixed(0)}, ${point.y.toFixed(0)} (${meters.toFixed(2)} m)`;
            } else {
                positionDisplay.textContent = `Position: ${point.x.toFixed(0)}, ${point.y.toFixed(0)}`;
            }
        }
    }

    // ===== LIGNE =====

    function startLine(point) {
        isDrawing = true;
        currentPoints = [point];

        // Créer élément temporaire
        const svg = document.getElementById('annotations-layer');
        tempElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tempElement.setAttribute('stroke', toolProperties.color);
        tempElement.setAttribute('stroke-width', toolProperties.thickness);
        tempElement.setAttribute('stroke-dasharray', '5,5');
        tempElement.setAttribute('x1', point.x);
        tempElement.setAttribute('y1', point.y);
        tempElement.setAttribute('x2', point.x);
        tempElement.setAttribute('y2', point.y);
        svg.appendChild(tempElement);
    }

    function updateLine(point) {
        if (tempElement) {
            tempElement.setAttribute('x2', point.x);
            tempElement.setAttribute('y2', point.y);
        }
    }

    function finishLine(point) {
        isDrawing = false;
        currentPoints.push(point);

        // Supprimer élément temporaire
        if (tempElement) {
            tempElement.remove();
            tempElement = null;
        }

        // Vérifier calibration avant calcul
        if (!checkCalibration()) {
            currentPoints = [];
            return;
        }

        // Calculer longueur
        const length = calculateDistance(currentPoints[0], currentPoints[1]);
        const lengthMeters = CalibrationManager.pixelsToMeters(length);

        // Créer mesure
        const measurement = {
            id: generateMeasurementId(),
            type: 'line',
            coordinates: {
                start: currentPoints[0],
                end: currentPoints[1]
            },
            value: lengthMeters,
            unit: 'm',
            color: toolProperties.color,
            thickness: toolProperties.thickness,
            created_at: new Date().toISOString()
        };

        measurements.push(measurement);
        PubSub.publish(EVENTS.MEASUREMENT_CREATED, { measurement });

        currentPoints = [];
    }

    // ===== POLYLIGNE =====

    function addPolylinePoint(point) {
        if (!isDrawing) {
            // Premier point
            isDrawing = true;
            currentPoints = [point];

            const svg = document.getElementById('annotations-layer');
            tempElement = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            tempElement.setAttribute('stroke', toolProperties.color);
            tempElement.setAttribute('stroke-width', toolProperties.thickness);
            tempElement.setAttribute('stroke-dasharray', '5,5');
            tempElement.setAttribute('fill', 'none');
            tempElement.setAttribute('points', `${point.x},${point.y}`);
            svg.appendChild(tempElement);
        } else {
            // Ajouter point
            currentPoints.push(point);
            updatePolylineElement();
        }
    }

    function updatePolyline(point) {
        if (!isDrawing || currentPoints.length === 0) return;

        // Mettre à jour dernier point temporaire
        const points = [...currentPoints, point]
            .map(p => `${p.x},${p.y}`)
            .join(' ');

        if (tempElement) {
            tempElement.setAttribute('points', points);
        }
    }

    function updatePolylineElement() {
        const points = currentPoints
            .map(p => `${p.x},${p.y}`)
            .join(' ');

        if (tempElement) {
            tempElement.setAttribute('points', points);
        }
    }

    function finishPolyline() {
        if (currentPoints.length < 2) {
            cancelCurrentDrawing();
            return;
        }

        isDrawing = false;

        if (tempElement) {
            tempElement.remove();
            tempElement = null;
        }

        // Vérifier calibration avant calcul
        if (!checkCalibration()) {
            currentPoints = [];
            return;
        }

        // Calculer longueur totale
        let totalLength = 0;
        for (let i = 0; i < currentPoints.length - 1; i++) {
            totalLength += calculateDistance(currentPoints[i], currentPoints[i + 1]);
        }

        const lengthMeters = CalibrationManager.pixelsToMeters(totalLength);
        }

        const measurement = {
            id: generateMeasurementId(),
            type: 'polyline',
            coordinates: {
                points: [...currentPoints]
            },
            value: lengthMeters,
            unit: 'm',
            color: toolProperties.color,
            thickness: toolProperties.thickness,
            created_at: new Date().toISOString()
        };

        measurements.push(measurement);
        PubSub.publish(EVENTS.MEASUREMENT_CREATED, { measurement });

        currentPoints = [];
    }

    // ===== RECTANGLE =====

    function startRectangle(point) {
        isDrawing = true;
        currentPoints = [point];

        const svg = document.getElementById('annotations-layer');
        tempElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tempElement.setAttribute('stroke', toolProperties.color);
        tempElement.setAttribute('stroke-width', toolProperties.thickness);
        tempElement.setAttribute('stroke-dasharray', '5,5');
        tempElement.setAttribute('fill', toolProperties.color);
        tempElement.setAttribute('fill-opacity', toolProperties.opacity);
        tempElement.setAttribute('x', point.x);
        tempElement.setAttribute('y', point.y);
        tempElement.setAttribute('width', 0);
        tempElement.setAttribute('height', 0);
        svg.appendChild(tempElement);
    }

    function updateRectangle(point) {
        if (!tempElement || currentPoints.length === 0) return;

        const start = currentPoints[0];
        const width = point.x - start.x;
        const height = point.y - start.y;

        tempElement.setAttribute('x', Math.min(start.x, point.x));
        tempElement.setAttribute('y', Math.min(start.y, point.y));
        tempElement.setAttribute('width', Math.abs(width));
        tempElement.setAttribute('height', Math.abs(height));
    }

    function finishRectangle(point) {
        isDrawing = false;
        currentPoints.push(point);

        if (tempElement) {
            tempElement.remove();
            tempElement = null;
        }

        // Vérifier calibration avant calcul
        if (!checkCalibration()) {
            currentPoints = [];
            return;
        }

        // Calculer surface
        const width = Math.abs(currentPoints[1].x - currentPoints[0].x);
        const height = Math.abs(currentPoints[1].y - currentPoints[0].y);
        const areaPixels = width * height;
        const areaMeters = CalibrationManager.pixelsSquaredToMetersSquared(areaPixels);

        const measurement = {
            id: generateMeasurementId(),
            type: 'rectangle',
            coordinates: {
                topLeft: currentPoints[0],
                bottomRight: currentPoints[1]
            },
            value: areaMeters,
            unit: 'm²',
            color: toolProperties.color,
            thickness: toolProperties.thickness,
            fillColor: toolProperties.color,
            opacity: toolProperties.opacity,
            created_at: new Date().toISOString()
        };

        measurements.push(measurement);
        PubSub.publish(EVENTS.MEASUREMENT_CREATED, { measurement });

        currentPoints = [];
    }

    // ===== POLYGONE =====

    function addPolygonPoint(point) {
        if (!isDrawing) {
            isDrawing = true;
            currentPoints = [point];

            const svg = document.getElementById('annotations-layer');
            tempElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            tempElement.setAttribute('stroke', toolProperties.color);
            tempElement.setAttribute('stroke-width', toolProperties.thickness);
            tempElement.setAttribute('stroke-dasharray', '5,5');
            tempElement.setAttribute('fill', toolProperties.color);
            tempElement.setAttribute('fill-opacity', toolProperties.opacity);
            tempElement.setAttribute('points', `${point.x},${point.y}`);
            svg.appendChild(tempElement);
        } else {
            currentPoints.push(point);
            updatePolygonElement();
        }
    }

    function updatePolygon(point) {
        if (!isDrawing || currentPoints.length === 0) return;

        const points = [...currentPoints, point]
            .map(p => `${p.x},${p.y}`)
            .join(' ');

        if (tempElement) {
            tempElement.setAttribute('points', points);
        }
    }

    function updatePolygonElement() {
        const points = currentPoints
            .map(p => `${p.x},${p.y}`)
            .join(' ');

        if (tempElement) {
            tempElement.setAttribute('points', points);
        }
    }

    function finishPolygon() {
        if (currentPoints.length < 3) {
            cancelCurrentDrawing();
            return;
        }

        isDrawing = false;

        if (tempElement) {
            tempElement.remove();
            tempElement = null;
        }

        // Vérifier calibration avant calcul
        if (!checkCalibration()) {
            currentPoints = [];
            return;
        }

        // Calculer surface avec formule du lacet (Shoelace formula)
        const areaPixels = calculatePolygonArea(currentPoints);
        const areaMeters = CalibrationManager.pixelsSquaredToMetersSquared(areaPixels);

        const measurement = {
            id: generateMeasurementId(),
            type: 'polygon',
            coordinates: {
                points: [...currentPoints]
            },
            value: areaMeters,
            unit: 'm²',
            color: toolProperties.color,
            thickness: toolProperties.thickness,
            fillColor: toolProperties.color,
            opacity: toolProperties.opacity,
            created_at: new Date().toISOString()
        };

        measurements.push(measurement);
        PubSub.publish(EVENTS.MEASUREMENT_CREATED, { measurement });

        currentPoints = [];
    }

    // ===== CERCLE =====

    function startCircle(point) {
        isDrawing = true;
        currentPoints = [point];

        const svg = document.getElementById('annotations-layer');
        tempElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        tempElement.setAttribute('cx', point.x);
        tempElement.setAttribute('cy', point.y);
        tempElement.setAttribute('r', 0);
        tempElement.setAttribute('stroke', toolProperties.color);
        tempElement.setAttribute('stroke-width', toolProperties.thickness);
        tempElement.setAttribute('stroke-dasharray', '5,5');
        tempElement.setAttribute('fill', toolProperties.color);
        tempElement.setAttribute('fill-opacity', toolProperties.opacity);
        svg.appendChild(tempElement);
    }

    function updateCircle(point) {
        if (!tempElement || currentPoints.length === 0) return;

        const center = currentPoints[0];
        const radius = calculateDistance(center, point);

        tempElement.setAttribute('r', radius);
    }

    function finishCircle(point) {
        isDrawing = false;
        currentPoints.push(point);

        if (tempElement) {
            tempElement.remove();
            tempElement = null;
        }

        // Vérifier calibration avant calcul
        if (!checkCalibration()) {
            currentPoints = [];
            return;
        }

        // Calculer surface
        const radius = calculateDistance(currentPoints[0], currentPoints[1]);
        const areaPixels = Math.PI * radius * radius;
        const areaMeters = CalibrationManager.pixelsSquaredToMetersSquared(areaPixels);

        const measurement = {
            id: generateMeasurementId(),
            type: 'circle',
            coordinates: {
                center: currentPoints[0],
                radius: radius
            },
            value: areaMeters,
            unit: 'm²',
            color: toolProperties.color,
            thickness: toolProperties.thickness,
            fillColor: toolProperties.color,
            opacity: toolProperties.opacity,
            created_at: new Date().toISOString()
        };

        measurements.push(measurement);
        PubSub.publish(EVENTS.MEASUREMENT_CREATED, { measurement });

        currentPoints = [];
    }

    // ===== COMPTAGE =====

    function addCountPoint(point) {
        const measurement = {
            id: generateMeasurementId(),
            type: 'count',
            coordinates: point,
            value: 1,
            number: measurements.filter(m => m.type === 'count').length + 1,
            color: toolProperties.color,
            created_at: new Date().toISOString()
        };

        measurements.push(measurement);
        PubSub.publish(EVENTS.MEASUREMENT_CREATED, { measurement });
    }

    // ===== UTILITAIRES =====

    function calculateDistance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function calculatePolygonArea(points) {
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        return Math.abs(area / 2);
    }

    function cancelCurrentDrawing() {
        isDrawing = false;
        currentPoints = [];

        if (tempElement) {
            tempElement.remove();
            tempElement = null;
        }
    }

    function getMeasurements() {
        return measurements;
    }

    // Initialiser
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API publique
    return {
        getMeasurements,
        cancelCurrentDrawing
    };
})();
