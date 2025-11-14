/**
 * DXF Loader
 * Chargement et affichage de fichiers DXF
 */

const DXFLoader = (function() {
    let dxfData = null;

    /**
     * Charger un fichier DXF
     */
    async function loadDXF(file) {
        try {
            const text = await file.text();

            // TODO: Parser le DXF et le rendre sur canvas
            // Pour l'instant, afficher un message
            alert('Chargement DXF en développement\n\nPour cette version, utilisez des fichiers PDF.');

            console.log('DXF content:', text.substring(0, 500));

            PubSub.publish(EVENTS.PLAN_LOADED, {
                type: 'dxf',
                fileName: file.name
            });

            return text;

        } catch (error) {
            console.error('Erreur chargement DXF:', error);
            throw error;
        }
    }

    /**
     * Obtenir les données DXF
     */
    function getDXFData() {
        return dxfData;
    }

    // API publique
    return {
        loadDXF,
        getDXFData
    };
})();
