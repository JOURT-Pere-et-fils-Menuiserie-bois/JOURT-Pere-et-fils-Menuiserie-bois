/**
 * UI Handlers
 * Gestion des interactions utilisateur pour fonctionnalités avancées
 */

(function() {
    'use strict';

    /**
     * Initialiser les handlers
     */
    function init() {
        setupExportMenu();
        setupAdvancedFeatures();
        setupInputUpload();
    }

    /**
     * Configurer menu d'export (dropdown)
     */
    function setupExportMenu() {
        const btnExport = document.getElementById('btn-export');
        const exportMenu = document.getElementById('export-menu');

        if (!btnExport || !exportMenu) return;

        // Toggle menu
        btnExport.addEventListener('click', function(e) {
            e.stopPropagation();
            exportMenu.classList.toggle('active');
        });

        // Fermer menu en cliquant ailleurs
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-group')) {
                exportMenu.classList.remove('active');
            }
        });

        // Export Excel
        const btnExportExcel = document.getElementById('btn-export-excel');
        if (btnExportExcel) {
            btnExportExcel.addEventListener('click', function() {
                exportMenu.classList.remove('active');
                ExcelManager.exportMeasurements();
            });
        }

        // Export CSV
        const btnExportCSV = document.getElementById('btn-export-csv');
        if (btnExportCSV) {
            btnExportCSV.addEventListener('click', function() {
                exportMenu.classList.remove('active');
                ExcelManager.exportToCSV();
            });
        }

        // Export PDF
        const btnExportPDF = document.getElementById('btn-export-pdf');
        if (btnExportPDF) {
            btnExportPDF.addEventListener('click', function() {
                exportMenu.classList.remove('active');
                showPDFOptionsDialog();
            });
        }

        // Export Product Sheets Table
        const btnExportProductSheets = document.getElementById('btn-export-product-sheets');
        if (btnExportProductSheets) {
            btnExportProductSheets.addEventListener('click', function() {
                exportMenu.classList.remove('active');
                handleProductSheetsExport();
            });
        }

        // Import catalogue
        const btnImportCatalogue = document.getElementById('btn-import-catalogue');
        if (btnImportCatalogue) {
            btnImportCatalogue.addEventListener('click', function() {
                exportMenu.classList.remove('active');
                triggerCatalogueImport();
            });
        }
    }

    /**
     * Afficher dialogue options PDF
     */
    function showPDFOptionsDialog() {
        const options = confirm(
            'Générer un rapport PDF professionnel avec:\n' +
            '- En-tête entreprise\n' +
            '- Récapitulatif des mesures\n' +
            '- Détails par plan\n' +
            '- Bloc signature\n\n' +
            'Continuer ?'
        );

        if (options) {
            PDFReports.generateReport(null, {
                title: 'Rapport de Métré',
                includeSummary: true,
                includeDetails: true,
                includeSignature: true
            });
        }
    }

    /**
     * Exporter tableau des fiches techniques produits
     */
    function handleProductSheetsExport() {
        // Vérifier que PDFReports est disponible
        if (typeof PDFReports === 'undefined') {
            alert('Module PDFReports non disponible');
            return;
        }

        // Récupérer les mesures
        if (typeof MeasurementTable === 'undefined') {
            alert('Module MeasurementTable non disponible');
            return;
        }

        const measurements = MeasurementTable.getMeasurements();

        if (!measurements || measurements.length === 0) {
            alert('Aucune mesure à exporter');
            return;
        }

        // Vérifier qu'au moins une mesure a des fiches associées
        const hasSheetsAssociated = measurements.some(m =>
            m.product_sheets && m.product_sheets.length > 0
        );

        if (!hasSheetsAssociated) {
            alert('Aucune fiche technique associée aux mesures.\n\n' +
                  'Utilisez le bouton "📄 Fiches" dans le tableau pour associer des fiches produits aux ouvrages.');
            return;
        }

        // Récupérer les infos du projet
        const currentProject = App.getCurrentProject();
        const currentVersion = App.getCurrentVersion();

        const projectInfo = {
            name: currentProject ? currentProject.name : 'Projet',
            version: currentVersion ? currentVersion.name : 'Version 1'
        };

        // Générer le PDF
        PDFReports.exportProductSheetsTable(measurements, {
            title: 'Tableau des Fiches Techniques',
            fileName: `fiches-techniques-${Date.now()}.pdf`,
            projectInfo: projectInfo
        });
    }

    /**
     * Déclencher import catalogue
     */
    function triggerCatalogueImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv';

        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                ExcelManager.importCatalogue(file);
            }
        });

        input.click();
    }

    /**
     * Configurer fonctionnalités avancées
     */
    function setupAdvancedFeatures() {
        // Ajouter bouton "Convertir en volume" dans le tableau
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-convert-volume')) {
                handleConvertToVolume(e.target);
            }
        });

        // Raccourcis clavier
        document.addEventListener('keydown', function(e) {
            // Ctrl+E: Export Excel
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                ExcelManager.exportMeasurements();
            }

            // Ctrl+Shift+P: Rapport PDF
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                showPDFOptionsDialog();
            }
        });
    }

    /**
     * Gérer conversion en volume
     */
    function handleConvertToVolume(button) {
        const measurementId = button.dataset.measurementId;
        // Prompt pour épaisseur
        const thickness = parseFloat(prompt('Épaisseur en mètres (ex: 0.10 pour 10cm):'));

        if (!thickness || thickness <= 0) {
            alert('Épaisseur invalide');
            return;
        }

        // Obtenir mesure
        const measurements = ToolsManager.getMeasurements();
        const measurement = measurements.find(m => m.id == measurementId);

        if (!measurement) {
            alert('Mesure introuvable');
            return;
        }

        try {
            const volumeMeasurement = AdvancedMeasurements.convertToVolume(measurement, thickness);

            // Publier nouvelle mesure
            PubSub.publish(EVENTS.MEASUREMENT_CREATED, { measurement: volumeMeasurement });

            alert(`Mesure convertie en volume: ${volumeMeasurement.value.toFixed(2)} m³`);
        } catch(error) {
            alert('Erreur: ' + error.message);
        }
    }

    /**
     * Créer input pour upload fichier
     */
    function setupInputUpload() {
        // Input caché pour import catalogue (déjà géré dans triggerCatalogueImport)
    }

    // Écouter succès d'export
    PubSub.subscribe('excel:exported', function(data) {
        console.log('Excel exporté:', data.fileName);
        alert(`Fichier Excel exporté: ${data.fileName}\n${data.count} mesures`);
    });

    PubSub.subscribe('csv:exported', function(data) {
        console.log('CSV exporté:', data.fileName);
        alert(`Fichier CSV exporté: ${data.fileName}\n${data.count} mesures`);
    });

    PubSub.subscribe('pdf:generated', function(data) {
        console.log('PDF généré:', data.fileName);
        alert(`Rapport PDF généré: ${data.fileName}`);
    });

    PubSub.subscribe('catalogue:imported', function(data) {
        console.log('Catalogue importé:', data.catalogue);
        alert(`Catalogue importé:\n${data.catalogue.name}\n${data.catalogue.items.length} articles`);
    });

    // Initialiser au chargement DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
