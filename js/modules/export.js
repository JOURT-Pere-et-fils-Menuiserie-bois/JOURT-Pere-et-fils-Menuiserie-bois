/**
 * Export Manager
 * Gère les exports (CSV, Excel, PDF)
 */

const ExportManager = (function() {

    /**
     * Afficher le menu d'export
     */
    function showMenu() {
        const menu = confirm('Exporter les mesures ?\n\nOK = CSV\nAnnuler = Retour');

        if (menu) {
            exportToCSV();
        }
    }

    /**
     * Exporter en CSV
     */
    function exportToCSV() {
        const measurements = MeasurementTable.getMeasurements();

        if (measurements.length === 0) {
            alert('Aucune mesure à exporter');
            return;
        }

        MeasurementTable.exportData('csv');

        PubSub.publish(EVENTS.EXPORT_COMPLETED, { format: 'csv' });
    }

    /**
     * Exporter en Excel (via serveur PHP)
     */
    async function exportToExcel() {
        const measurements = MeasurementTable.getMeasurements();
        const project = App.getCurrentProject();

        if (!project) {
            alert('Aucun projet ouvert');
            return;
        }

        try {
            PubSub.publish(EVENTS.EXPORT_STARTED, { format: 'excel' });

            const result = await StorageManager.apiRequest('/export.php', 'POST', {
                project_id: project.project_id,
                format: 'excel',
                measurements: measurements
            });

            if (result.success) {
                // Télécharger le fichier
                window.open(result.file_url, '_blank');

                PubSub.publish(EVENTS.EXPORT_COMPLETED, { format: 'excel', url: result.file_url });
            } else {
                throw new Error(result.error || 'Export failed');
            }

        } catch (error) {
            console.error('Export Excel error:', error);
            alert('Erreur lors de l\'export Excel: ' + error.message);
        }
    }

    /**
     * Exporter en PDF
     */
    async function exportToPDF() {
        alert('Export PDF en développement');
        // TODO: Implémenter export PDF avec plan + mesures
    }

    // API publique
    return {
        showMenu,
        exportToCSV,
        exportToExcel,
        exportToPDF
    };
})();
