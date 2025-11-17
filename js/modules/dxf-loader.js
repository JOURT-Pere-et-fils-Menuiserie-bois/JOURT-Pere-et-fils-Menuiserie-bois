/**
 * DXF Loader
 * Chargement, parsing et affichage de fichiers DXF
 * Support des entités: LINE, CIRCLE, ARC, LWPOLYLINE, POLYLINE, SPLINE
 */

const DXFLoader = (function() {
    let dxfData = null;
    let entities = [];
    let bounds = null;
    let currentCanvas = null;

    /**
     * Parser DXF ASCII
     */
    function parseDXF(text) {
        const lines = text.split('\n').map(l => l.trim());
        const result = {
            entities: [],
            layers: {},
            blocks: {},
            header: {}
        };

        let i = 0;
        let currentSection = null;
        let currentEntity = null;
        let currentCode = null;

        while (i < lines.length) {
            const line = lines[i];

            // Code de groupe DXF
            const code = parseInt(line);

            if (!isNaN(code)) {
                currentCode = code;
                i++;
                const value = lines[i] || '';

                // Section markers
                if (code === 0) {
                    if (value === 'SECTION') {
                        i++;
                        const sectionCode = parseInt(lines[i]);
                        i++;
                        currentSection = lines[i];
                    } else if (value === 'ENDSEC') {
                        currentSection = null;
                    } else if (value === 'EOF') {
                        break;
                    }
                    // Nouvelle entité
                    else if (currentSection === 'ENTITIES') {
                        if (currentEntity) {
                            result.entities.push(currentEntity);
                        }
                        currentEntity = { type: value, data: {} };
                    }
                }
                // Données de l'entité
                else if (currentEntity) {
                    parseEntityCode(currentEntity, code, value);
                }
            }

            i++;
        }

        // Ajouter dernière entité
        if (currentEntity) {
            result.entities.push(currentEntity);
        }

        console.log('DXF parsed:', result.entities.length, 'entities');
        return result;
    }

    /**
     * Parser les codes de groupe DXF pour une entité
     */
    function parseEntityCode(entity, code, value) {
        const data = entity.data;

        switch (code) {
            case 8: // Layer name
                data.layer = value;
                break;
            case 10: // X coordinate (start point, center)
                data.x = parseFloat(value);
                break;
            case 20: // Y coordinate
                data.y = parseFloat(value);
                break;
            case 30: // Z coordinate
                data.z = parseFloat(value);
                break;
            case 11: // X coordinate (end point)
                data.x2 = parseFloat(value);
                break;
            case 21: // Y coordinate (end point)
                data.y2 = parseFloat(value);
                break;
            case 40: // Radius
                data.radius = parseFloat(value);
                break;
            case 50: // Start angle
                data.startAngle = parseFloat(value) * Math.PI / 180;
                break;
            case 51: // End angle
                data.endAngle = parseFloat(value) * Math.PI / 180;
                break;
            case 62: // Color number
                data.color = parseInt(value);
                break;
            case 70: // Polyline flag
                data.flag = parseInt(value);
                break;
            case 90: // Number of vertices (LWPOLYLINE)
                data.vertices = [];
                data.vertexCount = parseInt(value);
                break;
            case 42: // Bulge
                if (!data.bulges) data.bulges = [];
                data.bulges.push(parseFloat(value));
                break;
        }

        // Vertices pour LWPOLYLINE
        if (entity.type === 'LWPOLYLINE') {
            if (!data.vertices) data.vertices = [];

            if (code === 10) {
                data.vertices.push({ x: parseFloat(value), y: 0 });
            } else if (code === 20 && data.vertices.length > 0) {
                data.vertices[data.vertices.length - 1].y = parseFloat(value);
            }
        }
    }

    /**
     * Calculer les limites (bounding box) du DXF
     */
    function calculateBounds(entities) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        entities.forEach(entity => {
            const d = entity.data;

            switch (entity.type) {
                case 'LINE':
                    minX = Math.min(minX, d.x, d.x2);
                    minY = Math.min(minY, d.y, d.y2);
                    maxX = Math.max(maxX, d.x, d.x2);
                    maxY = Math.max(maxY, d.y, d.y2);
                    break;

                case 'CIRCLE':
                    minX = Math.min(minX, d.x - d.radius);
                    minY = Math.min(minY, d.y - d.radius);
                    maxX = Math.max(maxX, d.x + d.radius);
                    maxY = Math.max(maxY, d.y + d.radius);
                    break;

                case 'ARC':
                    minX = Math.min(minX, d.x - d.radius);
                    minY = Math.min(minY, d.y - d.radius);
                    maxX = Math.max(maxX, d.x + d.radius);
                    maxY = Math.max(maxY, d.y + d.radius);
                    break;

                case 'LWPOLYLINE':
                case 'POLYLINE':
                    if (d.vertices) {
                        d.vertices.forEach(v => {
                            minX = Math.min(minX, v.x);
                            minY = Math.min(minY, v.y);
                            maxX = Math.max(maxX, v.x);
                            maxY = Math.max(maxY, v.y);
                        });
                    }
                    break;
            }
        });

        return {
            minX, minY, maxX, maxY,
            width: maxX - minX,
            height: maxY - minY,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    }

    /**
     * Transformer coordonnées DXF en coordonnées canvas
     */
    function transformCoords(x, y, bounds, canvas) {
        const padding = 50;
        const availableWidth = canvas.width - 2 * padding;
        const availableHeight = canvas.height - 2 * padding;

        // Calculer échelle pour fit dans canvas
        const scaleX = availableWidth / bounds.width;
        const scaleY = availableHeight / bounds.height;
        const scale = Math.min(scaleX, scaleY);

        // Centrer
        const offsetX = (canvas.width - bounds.width * scale) / 2;
        const offsetY = (canvas.height - bounds.height * scale) / 2;

        return {
            x: (x - bounds.minX) * scale + offsetX,
            y: canvas.height - ((y - bounds.minY) * scale + offsetY) // Inverser Y
        };
    }

    /**
     * Dessiner entités DXF sur canvas
     */
    function renderDXF(canvas, entities, bounds) {
        const ctx = canvas.getContext('2d');

        // Fond blanc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        entities.forEach(entity => {
            const d = entity.data;

            switch (entity.type) {
                case 'LINE':
                    const start = transformCoords(d.x, d.y, bounds, canvas);
                    const end = transformCoords(d.x2, d.y2, bounds, canvas);

                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                    break;

                case 'CIRCLE':
                    const center = transformCoords(d.x, d.y, bounds, canvas);
                    const scale = Math.min(
                        (canvas.width - 100) / bounds.width,
                        (canvas.height - 100) / bounds.height
                    );
                    const radius = d.radius * scale;

                    ctx.beginPath();
                    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                    break;

                case 'ARC':
                    const arcCenter = transformCoords(d.x, d.y, bounds, canvas);
                    const arcScale = Math.min(
                        (canvas.width - 100) / bounds.width,
                        (canvas.height - 100) / bounds.height
                    );
                    const arcRadius = d.radius * arcScale;

                    ctx.beginPath();
                    // Inverser angles car Y est inversé
                    ctx.arc(arcCenter.x, arcCenter.y, arcRadius, -d.endAngle, -d.startAngle, true);
                    ctx.stroke();
                    break;

                case 'LWPOLYLINE':
                case 'POLYLINE':
                    if (d.vertices && d.vertices.length > 0) {
                        ctx.beginPath();

                        const firstPoint = transformCoords(d.vertices[0].x, d.vertices[0].y, bounds, canvas);
                        ctx.moveTo(firstPoint.x, firstPoint.y);

                        for (let i = 1; i < d.vertices.length; i++) {
                            const point = transformCoords(d.vertices[i].x, d.vertices[i].y, bounds, canvas);
                            ctx.lineTo(point.x, point.y);
                        }

                        // Fermer si polyline fermée (flag & 1)
                        if (d.flag & 1) {
                            ctx.closePath();
                        }

                        ctx.stroke();
                    }
                    break;

                default:
                    // Entités non supportées (TEXT, DIMENSION, etc.)
                    break;
            }
        });

        console.log('✅ DXF rendu:', entities.length, 'entités dessinées');
    }

    /**
     * Charger un fichier DXF depuis File
     */
    async function loadDXF(file) {
        try {
            console.log('📂 Chargement DXF:', file.name);
            const text = await file.text();

            dxfData = parseDXF(text);
            entities = dxfData.entities;
            bounds = calculateBounds(entities);

            console.log('📐 Limites DXF:', bounds);

            // Rendre sur canvas si disponible
            const canvas = document.getElementById('pdf-canvas');
            if (canvas) {
                currentCanvas = canvas;
                renderDXF(canvas, entities, bounds);
            }

            PubSub.publish(EVENTS.PLAN_LOADED, {
                type: 'dxf',
                fileName: file.name,
                entities: entities.length,
                bounds: bounds
            });

            return dxfData;

        } catch (error) {
            console.error('❌ Erreur chargement DXF:', error);
            throw error;
        }
    }

    /**
     * Décharger le plan DXF actuel (libération mémoire)
     * CRITIQUE pour les DXF volumineux
     */
    function unloadPlan() {
        console.log('🗑️ Déchargement plan DXF actuel...');

        // 1. Nettoyer le canvas
        if (currentCanvas) {
            const ctx = currentCanvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
            }
            currentCanvas.width = 0;
            currentCanvas.height = 0;
        }

        // 2. Nettoyer le SVG annotations
        const svg = document.getElementById('annotations-layer');
        if (svg) {
            svg.setAttribute('width', '0');
            svg.setAttribute('height', '0');
            while (svg.firstChild) {
                svg.removeChild(svg.firstChild);
            }
        }

        // 3. Réinitialiser les variables
        dxfData = null;
        entities = [];
        bounds = null;
        currentCanvas = null;

        console.log('✅ Mémoire DXF libérée');
    }

    /**
     * Charger DXF depuis URL
     * Décharge automatiquement le plan précédent
     */
    async function loadDXFFromURL(url) {
        try {
            // ✅ CRITIQUE: Décharger l'ancien plan AVANT de charger le nouveau
            unloadPlan();

            console.log('📂 Chargement DXF depuis URL:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();

            dxfData = parseDXF(text);
            entities = dxfData.entities;
            bounds = calculateBounds(entities);

            console.log('📐 Limites DXF:', bounds);
            console.log(`✅ DXF chargé: ${entities.length} entité(s)`);

            // Rendre sur canvas
            const canvas = document.getElementById('pdf-canvas');
            if (canvas) {
                currentCanvas = canvas;
                renderDXF(canvas, entities, bounds);
            }

            PubSub.publish(EVENTS.PLAN_LOADED, {
                type: 'dxf',
                fileName: url.split('/').pop(),
                entities: entities.length,
                bounds: bounds
            });

            return dxfData;

        } catch (error) {
            console.error('❌ Erreur chargement DXF URL:', error);
            throw error;
        }
    }

    /**
     * Recharger le DXF (ex: après resize canvas)
     */
    function rerender() {
        if (currentCanvas && entities.length > 0 && bounds) {
            renderDXF(currentCanvas, entities, bounds);
        }
    }

    /**
     * Obtenir les données DXF
     */
    function getDXFData() {
        return dxfData;
    }

    /**
     * Obtenir les entités
     */
    function getEntities() {
        return entities;
    }

    /**
     * Obtenir les limites
     */
    function getBounds() {
        return bounds;
    }

    // API publique
    return {
        loadDXF,
        loadDXFFromURL,
        unloadPlan,
        getDXFData,
        getEntities,
        getBounds,
        rerender
    };
})();
