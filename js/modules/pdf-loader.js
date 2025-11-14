/**
 * PDF Loader
 * Chargement et affichage de fichiers PDF avec PDF.js
 */

const PDFLoader = (function() {
    let pdfDoc = null;
    let currentPage = 1;
    let canvas = null;
    let context = null;
    let scale = 1.0;
    let viewport = null;

    /**
     * Initialiser
     */
    function init() {
        canvas = document.getElementById('plan-canvas');
        context = canvas.getContext('2d');

        // Configurer PDF.js worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/lib/pdf.worker.min.mjs';
        }
    }

    /**
     * Charger un fichier PDF
     */
    async function loadPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

            pdfDoc = await loadingTask.promise;
            console.log('PDF chargé:', pdfDoc.numPages, 'pages');

            // Afficher la première page
            await renderPage(1);

            PubSub.publish(EVENTS.PLAN_LOADED, {
                type: 'pdf',
                pages: pdfDoc.numPages
            });

            return pdfDoc;

        } catch (error) {
            console.error('Erreur chargement PDF:', error);
            throw error;
        }
    }

    /**
     * Charger un PDF depuis une URL
     */
    async function loadPDFFromURL(url) {
        try {
            const loadingTask = pdfjsLib.getDocument(url);
            pdfDoc = await loadingTask.promise;

            await renderPage(1);

            PubSub.publish(EVENTS.PLAN_LOADED, {
                type: 'pdf',
                pages: pdfDoc.numPages,
                url: url
            });

            return pdfDoc;

        } catch (error) {
            console.error('Erreur chargement PDF:', error);
            throw error;
        }
    }

    /**
     * Rendre une page
     */
    async function renderPage(pageNum) {
        if (!pdfDoc) {
            return;
        }

        try {
            const page = await pdfDoc.getPage(pageNum);
            viewport = page.getViewport({ scale: scale });

            // Ajuster la taille du canvas
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Ajuster le SVG annotations
            const svg = document.getElementById('annotations-layer');
            svg.setAttribute('width', viewport.width);
            svg.setAttribute('height', viewport.height);
            svg.style.width = viewport.width + 'px';
            svg.style.height = viewport.height + 'px';

            // Rendre la page
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            await page.render(renderContext).promise;

            currentPage = pageNum;

            console.log('Page', pageNum, 'rendue');

        } catch (error) {
            console.error('Erreur rendu page:', error);
            throw error;
        }
    }

    /**
     * Changer de page
     */
    async function goToPage(pageNum) {
        if (!pdfDoc || pageNum < 1 || pageNum > pdfDoc.numPages) {
            return;
        }

        await renderPage(pageNum);
    }

    /**
     * Page suivante
     */
    async function nextPage() {
        if (currentPage < pdfDoc.numPages) {
            await goToPage(currentPage + 1);
        }
    }

    /**
     * Page précédente
     */
    async function previousPage() {
        if (currentPage > 1) {
            await goToPage(currentPage - 1);
        }
    }

    /**
     * Zoomer
     */
    async function setZoom(newScale) {
        scale = newScale;
        await renderPage(currentPage);

        // Mettre à jour l'affichage du zoom
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = Math.round(scale * 100) + '%';
        }

        PubSub.publish('viewer:zoom:changed', { scale: scale });
    }

    /**
     * Zoom in
     */
    async function zoomIn() {
        await setZoom(scale * 1.2);
    }

    /**
     * Zoom out
     */
    async function zoomOut() {
        await setZoom(scale / 1.2);
    }

    /**
     * Ajuster à la fenêtre
     */
    async function zoomFit() {
        if (!viewport) return;

        const container = document.getElementById('viewer-main');
        const containerWidth = container.clientWidth - 40; // Padding
        const containerHeight = container.clientHeight - 40;

        const scaleX = containerWidth / (viewport.width / scale);
        const scaleY = containerHeight / (viewport.height / scale);
        const fitScale = Math.min(scaleX, scaleY);

        await setZoom(fitScale);
    }

    /**
     * Obtenir les dimensions du canvas
     */
    function getCanvasDimensions() {
        return {
            width: canvas ? canvas.width : 0,
            height: canvas ? canvas.height : 0,
            scale: scale
        };
    }

    /**
     * Obtenir le viewport courant
     */
    function getViewport() {
        return viewport;
    }

    /**
     * Obtenir le document PDF
     */
    function getPDFDocument() {
        return pdfDoc;
    }

    /**
     * Écouter les événements de zoom
     */
    PubSub.subscribe('viewer:zoom', function(data) {
        switch(data.direction) {
            case 'in':
                zoomIn();
                break;
            case 'out':
                zoomOut();
                break;
            case 'fit':
                zoomFit();
                break;
        }
    });

    // Initialiser au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API publique
    return {
        loadPDF,
        loadPDFFromURL,
        renderPage,
        goToPage,
        nextPage,
        previousPage,
        setZoom,
        zoomIn,
        zoomOut,
        zoomFit,
        getCanvasDimensions,
        getViewport,
        getPDFDocument
    };
})();
