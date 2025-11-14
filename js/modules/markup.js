/**
 * Markup Manager
 * Outils d'annotation avancés: textes, flèches, symboles, formes
 * (Sans mesure - annotations visuelles uniquement)
 */

const MarkupManager = (function() {
    let markups = [];
    let markupIdCounter = 1;
    let currentTool = null;
    let isDrawing = false;
    let currentPoints = [];
    let tempElement = null;
    let symbolLibrary = {};

    // Helper: Générer ID unique pour markup
    function generateMarkupId() {
        return 'mark-' + (markupIdCounter++);
    }

    // Propriétés courantes
    let markupProperties = {
        color: '#0066FF',
        thickness: 2,
        opacity: 1,
        fontSize: 14,
        fontFamily: 'Arial',
        fillColor: null
    };

    /**
     * Initialiser
     */
    function init() {
        setupEventListeners();
        loadSymbolLibrary();
    }

    /**
     * Configurer écouteurs
     */
    function setupEventListeners() {
        const canvas = document.getElementById('plan-canvas');

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('click', handleClick);

        // Écouter changement outil markup
        PubSub.subscribe('markup:tool:changed', function(data) {
            currentTool = data.tool;
            cancelCurrentDrawing();
        });

        // Écouter changement propriétés
        PubSub.subscribe('markup:properties:changed', function(data) {
            markupProperties = { ...markupProperties, ...data };
        });
    }

    /**
     * Charger bibliothèque de symboles
     */
    function loadSymbolLibrary() {
        // Symboles prédéfinis (SVG paths ou caractères Unicode)
        symbolLibrary = {
            // Flèches
            'arrow-up': { type: 'path', data: 'M 0,10 L 5,0 L 10,10 Z', category: 'arrows' },
            'arrow-down': { type: 'path', data: 'M 0,0 L 5,10 L 10,0 Z', category: 'arrows' },
            'arrow-left': { type: 'path', data: 'M 10,0 L 0,5 L 10,10 Z', category: 'arrows' },
            'arrow-right': { type: 'path', data: 'M 0,0 L 10,5 L 0,10 Z', category: 'arrows' },

            // Symboles construction
            'window': { type: 'unicode', data: '🪟', category: 'construction' },
            'door': { type: 'unicode', data: '🚪', category: 'construction' },
            'stairs': { type: 'unicode', data: '🪜', category: 'construction' },
            'wall': { type: 'rect', width: 20, height: 2, category: 'construction' },

            // Électricité
            'power-outlet': { type: 'circle', radius: 5, category: 'electrical' },
            'light': { type: 'unicode', data: '💡', category: 'electrical' },
            'switch': { type: 'rect', width: 8, height: 12, category: 'electrical' },

            // Annotations
            'checkmark': { type: 'unicode', data: '✓', category: 'annotations' },
            'cross': { type: 'unicode', data: '✗', category: 'annotations' },
            'star': { type: 'unicode', data: '★', category: 'annotations' },
            'warning': { type: 'unicode', data: '⚠', category: 'annotations' },
            'info': { type: 'unicode', data: 'ℹ', category: 'annotations' }
        };

        // Charger symboles personnalisés depuis localStorage
        const custom = localStorage.getItem('customSymbols');
        if (custom) {
            try {
                const customSymbols = JSON.parse(custom);
                symbolLibrary = { ...symbolLibrary, ...customSymbols };
            } catch(e) {
                console.error('Erreur chargement symboles personnalisés', e);
            }
        }
    }

    /**
     * Obtenir point canvas
     */
    function getCanvasPoint(e) {
        const canvas = document.getElementById('plan-canvas');
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    // ===== GESTION ÉVÉNEMENTS =====

    function handleMouseDown(e) {
        if (!currentTool || !currentTool.startsWith('markup:')) return;

        const point = getCanvasPoint(e);
        const tool = currentTool.replace('markup:', '');

        switch(tool) {
            case 'arrow':
                startArrow(point);
                break;
            case 'freehand':
                startFreehand(point);
                break;
            case 'cloud':
                startCloud(point);
                break;
        }
    }

    function handleMouseMove(e) {
        if (!isDrawing) return;

        const point = getCanvasPoint(e);
        const tool = currentTool.replace('markup:', '');

        switch(tool) {
            case 'arrow':
                updateArrow(point);
                break;
            case 'freehand':
                updateFreehand(point);
                break;
            case 'cloud':
                updateCloud(point);
                break;
        }
    }

    function handleMouseUp(e) {
        if (!isDrawing) return;

        const point = getCanvasPoint(e);
        const tool = currentTool.replace('markup:', '');

        switch(tool) {
            case 'arrow':
                finishArrow(point);
                break;
            case 'freehand':
                finishFreehand(point);
                break;
            case 'cloud':
                finishCloud(point);
                break;
        }
    }

    function handleClick(e) {
        if (!currentTool || !currentTool.startsWith('markup:')) return;

        const point = getCanvasPoint(e);
        const tool = currentTool.replace('markup:', '');

        switch(tool) {
            case 'text':
                addText(point);
                break;
            case 'symbol':
                addSymbol(point);
                break;
        }
    }

    // ===== FLÈCHE =====

    function startArrow(point) {
        isDrawing = true;
        currentPoints = [point];

        const svg = document.getElementById('annotations-layer');
        tempElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Ligne
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('stroke', markupProperties.color);
        line.setAttribute('stroke-width', markupProperties.thickness);
        line.setAttribute('x1', point.x);
        line.setAttribute('y1', point.y);
        line.setAttribute('x2', point.x);
        line.setAttribute('y2', point.y);
        line.classList.add('temp-line');
        tempElement.appendChild(line);

        svg.appendChild(tempElement);
    }

    function updateArrow(point) {
        if (!tempElement) return;

        const line = tempElement.querySelector('.temp-line');
        if (line) {
            line.setAttribute('x2', point.x);
            line.setAttribute('y2', point.y);
        }
    }

    function finishArrow(point) {
        isDrawing = false;
        currentPoints.push(point);

        if (tempElement) {
            tempElement.remove();
            tempElement = null;
        }

        // Créer flèche avec pointe
        const markup = {
            id: generateMarkupId(),
            type: 'arrow',
            coordinates: {
                start: currentPoints[0],
                end: currentPoints[1]
            },
            color: markupProperties.color,
            thickness: markupProperties.thickness,
            created_at: new Date().toISOString()
        };

        markups.push(markup);
        drawArrow(markup);
        PubSub.publish('markup:created', { markup });

        currentPoints = [];
    }

    function drawArrow(markup) {
        const svg = document.getElementById('annotations-layer');
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = `markup-${markup.id}`;
        group.classList.add('markup-item');

        // Ligne
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', markup.coordinates.start.x);
        line.setAttribute('y1', markup.coordinates.start.y);
        line.setAttribute('x2', markup.coordinates.end.x);
        line.setAttribute('y2', markup.coordinates.end.y);
        line.setAttribute('stroke', markup.color);
        line.setAttribute('stroke-width', markup.thickness);
        line.setAttribute('marker-end', 'url(#arrowhead)');
        group.appendChild(line);

        // Définir marker pointe de flèche si pas déjà fait
        if (!svg.querySelector('#arrowhead')) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.id = 'arrowhead';
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '10');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '3');
            marker.setAttribute('orient', 'auto');

            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3, 0 6');
            polygon.setAttribute('fill', markup.color);

            marker.appendChild(polygon);
            defs.appendChild(marker);
            svg.appendChild(defs);
        }

        svg.appendChild(group);
    }

    // ===== TEXTE =====

    function addText(point) {
        // Afficher modal pour saisie texte
        const text = prompt('Entrez le texte à annoter:');
        if (!text) return;

        const markup = {
            id: generateMarkupId(),
            type: 'text',
            coordinates: point,
            text: text,
            color: markupProperties.color,
            fontSize: markupProperties.fontSize,
            fontFamily: markupProperties.fontFamily,
            created_at: new Date().toISOString()
        };

        markups.push(markup);
        drawText(markup);
        PubSub.publish('markup:created', { markup });
    }

    function drawText(markup) {
        const svg = document.getElementById('annotations-layer');
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        text.id = `markup-${markup.id}`;
        text.classList.add('markup-item', 'markup-text');
        text.setAttribute('x', markup.coordinates.x);
        text.setAttribute('y', markup.coordinates.y);
        text.setAttribute('fill', markup.color);
        text.setAttribute('font-size', markup.fontSize);
        text.setAttribute('font-family', markup.fontFamily);
        text.textContent = markup.text;

        // Ajouter background pour lisibilité
        const bbox = text.getBBox();
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', bbox.x - 2);
        rect.setAttribute('y', bbox.y - 2);
        rect.setAttribute('width', bbox.width + 4);
        rect.setAttribute('height', bbox.height + 4);
        rect.setAttribute('fill', '#FFFFFF');
        rect.setAttribute('fill-opacity', '0.8');

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = `markup-${markup.id}`;
        group.appendChild(rect);
        group.appendChild(text);

        svg.appendChild(group);
    }

    // ===== DESSIN LIBRE =====

    function startFreehand(point) {
        isDrawing = true;
        currentPoints = [point];

        const svg = document.getElementById('annotations-layer');
        tempElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempElement.setAttribute('stroke', markupProperties.color);
        tempElement.setAttribute('stroke-width', markupProperties.thickness);
        tempElement.setAttribute('fill', 'none');
        tempElement.setAttribute('d', `M ${point.x},${point.y}`);

        svg.appendChild(tempElement);
    }

    function updateFreehand(point) {
        if (!tempElement) return;

        currentPoints.push(point);

        // Créer path avec tous les points
        const pathData = currentPoints.map((p, i) =>
            i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`
        ).join(' ');

        tempElement.setAttribute('d', pathData);
    }

    function finishFreehand(point) {
        isDrawing = false;

        if (tempElement) {
            tempElement.remove();
            tempElement = null;
        }

        if (currentPoints.length < 2) {
            currentPoints = [];
            return;
        }

        const markup = {
            id: generateMarkupId(),
            type: 'freehand',
            coordinates: {
                points: [...currentPoints]
            },
            color: markupProperties.color,
            thickness: markupProperties.thickness,
            created_at: new Date().toISOString()
        };

        markups.push(markup);
        drawFreehand(markup);
        PubSub.publish('markup:created', { markup });

        currentPoints = [];
    }

    function drawFreehand(markup) {
        const svg = document.getElementById('annotations-layer');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        const pathData = markup.coordinates.points.map((p, i) =>
            i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`
        ).join(' ');

        path.id = `markup-${markup.id}`;
        path.classList.add('markup-item');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', markup.color);
        path.setAttribute('stroke-width', markup.thickness);
        path.setAttribute('fill', 'none');

        svg.appendChild(path);
    }

    // ===== NUAGE (CLOUD MARKUP) =====

    function startCloud(point) {
        isDrawing = true;
        currentPoints = [point];

        const svg = document.getElementById('annotations-layer');
        tempElement = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        tempElement.setAttribute('stroke', markupProperties.color);
        tempElement.setAttribute('stroke-width', markupProperties.thickness);
        tempElement.setAttribute('stroke-dasharray', '5,5');
        tempElement.setAttribute('fill', 'none');
        tempElement.setAttribute('cx', point.x);
        tempElement.setAttribute('cy', point.y);
        tempElement.setAttribute('rx', 0);
        tempElement.setAttribute('ry', 0);

        svg.appendChild(tempElement);
    }

    function updateCloud(point) {
        if (!tempElement || currentPoints.length === 0) return;

        const start = currentPoints[0];
        const rx = Math.abs(point.x - start.x);
        const ry = Math.abs(point.y - start.y);

        tempElement.setAttribute('rx', rx);
        tempElement.setAttribute('ry', ry);
    }

    function finishCloud(point) {
        isDrawing = false;
        currentPoints.push(point);

        if (tempElement) {
            tempElement.remove();
            tempElement = null;
        }

        const markup = {
            id: generateMarkupId(),
            type: 'cloud',
            coordinates: {
                center: currentPoints[0],
                rx: Math.abs(currentPoints[1].x - currentPoints[0].x),
                ry: Math.abs(currentPoints[1].y - currentPoints[0].y)
            },
            color: markupProperties.color,
            thickness: markupProperties.thickness,
            created_at: new Date().toISOString()
        };

        markups.push(markup);
        drawCloud(markup);
        PubSub.publish('markup:created', { markup });

        currentPoints = [];
    }

    function drawCloud(markup) {
        const svg = document.getElementById('annotations-layer');
        const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');

        ellipse.id = `markup-${markup.id}`;
        ellipse.classList.add('markup-item');
        ellipse.setAttribute('cx', markup.coordinates.center.x);
        ellipse.setAttribute('cy', markup.coordinates.center.y);
        ellipse.setAttribute('rx', markup.coordinates.rx);
        ellipse.setAttribute('ry', markup.coordinates.ry);
        ellipse.setAttribute('stroke', markup.color);
        ellipse.setAttribute('stroke-width', markup.thickness);
        ellipse.setAttribute('stroke-dasharray', '3,3');
        ellipse.setAttribute('fill', 'none');

        svg.appendChild(ellipse);
    }

    // ===== SYMBOLES =====

    function addSymbol(point, symbolId = null) {
        // Si pas de symbole spécifié, afficher sélecteur
        if (!symbolId) {
            symbolId = prompt('ID symbole (voir bibliothèque):');
            if (!symbolId || !symbolLibrary[symbolId]) {
                alert('Symbole introuvable');
                return;
            }
        }

        const symbol = symbolLibrary[symbolId];

        const markup = {
            id: generateMarkupId(),
            type: 'symbol',
            coordinates: point,
            symbolId: symbolId,
            symbol: symbol,
            color: markupProperties.color,
            created_at: new Date().toISOString()
        };

        markups.push(markup);
        drawSymbol(markup);
        PubSub.publish('markup:created', { markup });
    }

    function drawSymbol(markup) {
        const svg = document.getElementById('annotations-layer');
        let element;

        switch(markup.symbol.type) {
            case 'unicode':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                element.setAttribute('x', markup.coordinates.x);
                element.setAttribute('y', markup.coordinates.y);
                element.setAttribute('font-size', '24');
                element.setAttribute('text-anchor', 'middle');
                element.textContent = markup.symbol.data;
                break;

            case 'path':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                element.setAttribute('d', markup.symbol.data);
                element.setAttribute('transform', `translate(${markup.coordinates.x}, ${markup.coordinates.y})`);
                element.setAttribute('fill', markup.color);
                break;

            case 'circle':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                element.setAttribute('cx', markup.coordinates.x);
                element.setAttribute('cy', markup.coordinates.y);
                element.setAttribute('r', markup.symbol.radius);
                element.setAttribute('fill', markup.color);
                break;

            case 'rect':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                element.setAttribute('x', markup.coordinates.x - markup.symbol.width / 2);
                element.setAttribute('y', markup.coordinates.y - markup.symbol.height / 2);
                element.setAttribute('width', markup.symbol.width);
                element.setAttribute('height', markup.symbol.height);
                element.setAttribute('fill', markup.color);
                break;
        }

        if (element) {
            element.id = `markup-${markup.id}`;
            element.classList.add('markup-item', 'markup-symbol');
            svg.appendChild(element);
        }
    }

    // ===== GESTION =====

    function cancelCurrentDrawing() {
        isDrawing = false;
        currentPoints = [];

        if (tempElement) {
            tempElement.remove();
            tempElement = null;
        }
    }

    function deleteMarkup(markupId) {
        const element = document.getElementById(`markup-${markupId}`);
        if (element) {
            element.remove();
        }

        markups = markups.filter(m => m.id !== markupId);
        PubSub.publish('markup:deleted', { markupId });
    }

    function clearAllMarkups() {
        markups.forEach(m => {
            const element = document.getElementById(`markup-${m.id}`);
            if (element) element.remove();
        });

        markups = [];
        PubSub.publish('markup:cleared');
    }

    function getMarkups() {
        return markups;
    }

    function getSymbolLibrary() {
        return symbolLibrary;
    }

    function addCustomSymbol(id, symbol) {
        symbolLibrary[id] = symbol;

        // Sauvegarder dans localStorage
        const custom = {};
        Object.keys(symbolLibrary).forEach(key => {
            if (!['arrow-up', 'arrow-down', 'window', 'door'].includes(key)) {
                custom[key] = symbolLibrary[key];
            }
        });

        localStorage.setItem('customSymbols', JSON.stringify(custom));
        PubSub.publish('symbol:added', { id, symbol });
    }

    // Initialiser
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API publique
    return {
        // Markup
        deleteMarkup,
        clearAllMarkups,
        getMarkups,

        // Symboles
        addSymbol,
        getSymbolLibrary,
        addCustomSymbol,

        // Texte
        addText,

        // Propriétés
        setProperties: function(props) {
            markupProperties = { ...markupProperties, ...props };
        }
    };
})();
