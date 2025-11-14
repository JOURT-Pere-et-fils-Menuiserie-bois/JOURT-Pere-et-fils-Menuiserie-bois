/**
 * Calibration Manager
 * Gère la calibration de l'échelle du plan
 */

const CalibrationManager = (function() {
    let isCalibrating = false;
    let calibrationLine = null;
    let startPoint = null;
    let scale = null; // mètres par pixel
    let modal = null;

    /**
     * Initialiser
     */
    function init() {
        modal = document.getElementById('calibration-modal');

        // Écouter les événements calibration
        setupEventListeners();
    }

    /**
     * Configurer les écouteurs d'événements
     */
    function setupEventListeners() {
        const canvas = document.getElementById('plan-canvas');
        const svg = document.getElementById('annotations-layer');

        // Click sur le canvas pendant calibration
        canvas.addEventListener('click', handleCanvasClick);

        // Mouvement souris pendant calibration
        canvas.addEventListener('mousemove', handleMouseMove);

        // Inputs dans le modal
        const realInput = document.getElementById('calibration-real');
        const unitSelect = document.getElementById('calibration-unit');

        if (realInput) {
            realInput.addEventListener('input', calculateScale);
        }
        if (unitSelect) {
            unitSelect.addEventListener('change', calculateScale);
        }
    }

    /**
     * Démarrer la calibration
     */
    function start() {
        isCalibrating = true;
        startPoint = null;
        calibrationLine = null;

        // Afficher instructions
        showModal();

        // Créer élément SVG pour la ligne de calibration
        const svg = document.getElementById('annotations-layer');
        calibrationLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        calibrationLine.setAttribute('stroke', '#ff0000');
        calibrationLine.setAttribute('stroke-width', '3');
        calibrationLine.setAttribute('stroke-dasharray', '5,5');
        calibrationLine.id = 'calibration-line';
        svg.appendChild(calibrationLine);

        // Changer curseur
        document.getElementById('plan-canvas').style.cursor = 'crosshair';

        PubSub.publish(EVENTS.CALIBRATION_STARTED);
    }

    /**
     * Gérer le clic sur le canvas
     */
    function handleCanvasClick(e) {
        if (!isCalibrating) return;

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!startPoint) {
            // Premier point
            startPoint = { x, y };
            calibrationLine.setAttribute('x1', x);
            calibrationLine.setAttribute('y1', y);
            calibrationLine.setAttribute('x2', x);
            calibrationLine.setAttribute('y2', y);
        } else {
            // Deuxième point - calibration terminée
            const endPoint = { x, y };
            const distance = calculateDistance(startPoint, endPoint);

            // Mettre à jour le modal avec la distance mesurée
            document.getElementById('calibration-pixels').value = distance.toFixed(2);

            // Focus sur l'input de longueur réelle
            document.getElementById('calibration-real').focus();
        }
    }

    /**
     * Gérer le mouvement de la souris
     */
    function handleMouseMove(e) {
        if (!isCalibrating || !startPoint) return;

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Mettre à jour la ligne
        calibrationLine.setAttribute('x2', x);
        calibrationLine.setAttribute('y2', y);

        // Afficher la distance temporaire
        const distance = calculateDistance(startPoint, { x, y });
        document.getElementById('calibration-pixels').value = distance.toFixed(2);
    }

    /**
     * Calculer la distance entre deux points
     */
    function calculateDistance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculer l'échelle
     */
    function calculateScale() {
        const pixelsInput = document.getElementById('calibration-pixels');
        const realInput = document.getElementById('calibration-real');
        const unitSelect = document.getElementById('calibration-unit');
        const scaleDisplay = document.getElementById('calculated-scale');

        const pixels = parseFloat(pixelsInput.value);
        const realValue = parseFloat(realInput.value);
        const unit = unitSelect.value;

        if (!pixels || !realValue || pixels <= 0 || realValue <= 0) {
            scaleDisplay.textContent = '-';
            return null;
        }

        // Convertir en mètres
        let realMeters = realValue;
        switch(unit) {
            case 'cm':
                realMeters = realValue / 100;
                break;
            case 'mm':
                realMeters = realValue / 1000;
                break;
        }

        // Calculer l'échelle (mètres par pixel)
        scale = realMeters / pixels;

        // Afficher
        scaleDisplay.textContent = `1 px = ${scale.toFixed(6)} m (1:${(1/scale).toFixed(0)})`;

        return scale;
    }

    /**
     * Confirmer la calibration
     */
    function confirm() {
        const calculatedScale = calculateScale();

        if (!calculatedScale) {
            alert('Veuillez entrer une longueur réelle valide');
            return;
        }

        // Sauvegarder l'échelle
        scale = calculatedScale;

        // Nettoyer
        cleanup();

        // Fermer modal
        hideModal();

        // Notifier
        PubSub.publish(EVENTS.CALIBRATION_COMPLETED, {
            scale: scale,
            pixels: parseFloat(document.getElementById('calibration-pixels').value),
            real: parseFloat(document.getElementById('calibration-real').value),
            unit: document.getElementById('calibration-unit').value
        });

        // Sauvegarder dans le projet
        saveScaleToCurrentVersion();

        alert('Calibration réussie ! Échelle: ' + (1/scale).toFixed(0) + ':1');
    }

    /**
     * Annuler la calibration
     */
    function cancel() {
        cleanup();
        hideModal();
    }

    /**
     * Nettoyer
     */
    function cleanup() {
        isCalibrating = false;
        startPoint = null;

        // Retirer la ligne de calibration
        const line = document.getElementById('calibration-line');
        if (line) {
            line.remove();
        }

        // Restaurer curseur par défaut
        document.getElementById('plan-canvas').style.cursor = 'default';
    }

    /**
     * Afficher modal
     */
    function showModal() {
        modal.classList.add('active');

        // Réinitialiser les champs
        document.getElementById('calibration-pixels').value = '';
        document.getElementById('calibration-real').value = '';
        document.getElementById('calculated-scale').textContent = '-';
    }

    /**
     * Masquer modal
     */
    function hideModal() {
        modal.classList.remove('active');
    }

    /**
     * Obtenir l'échelle courante
     */
    function getScale() {
        return scale;
    }

    /**
     * Définir l'échelle
     */
    function setScale(newScale) {
        scale = newScale;
        PubSub.publish(EVENTS.SCALE_CHANGED, { scale: scale });
    }

    /**
     * Convertir pixels en mètres
     */
    function pixelsToMeters(pixels) {
        if (!scale) {
            console.warn('Échelle non calibrée');
            return null;
        }
        return pixels * scale;
    }

    /**
     * Convertir mètres en pixels
     */
    function metersToPixels(meters) {
        if (!scale) {
            console.warn('Échelle non calibrée');
            return null;
        }
        return meters / scale;
    }

    /**
     * Calculer l'aire en m² depuis pixels²
     */
    function pixelsSquaredToMetersSquared(pixelsSquared) {
        if (!scale) return null;
        return pixelsSquared * scale * scale;
    }

    /**
     * Sauvegarder l'échelle dans la version courante
     */
    async function saveScaleToCurrentVersion() {
        const currentVersion = App.getCurrentVersion();
        if (!currentVersion) return;

        try {
            await StorageManager.apiRequest('/versions.php', 'PUT', {
                version_id: currentVersion,
                scale_factor: scale
            });
        } catch (error) {
            console.error('Erreur sauvegarde échelle:', error);
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
        start,
        confirm,
        cancel,
        getScale,
        setScale,
        pixelsToMeters,
        metersToPixels,
        pixelsSquaredToMetersSquared
    };
})();
