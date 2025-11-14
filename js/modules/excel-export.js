/**
 * Excel Export/Import
 * Export des quantitatifs vers Excel et import de catalogues fournisseurs
 * Utilise SheetJS (xlsx.js) pour manipulation Excel
 */

const ExcelManager = (function() {
    let catalogues = [];

    /**
     * Initialiser
     */
    function init() {
        // Vérifier si SheetJS est chargé
        if (typeof XLSX === 'undefined') {
            console.warn('SheetJS (xlsx.js) non chargé - fonctionnalités Excel désactivées');
            return;
        }

        setupEventListeners();
        loadCatalogues();
    }

    /**
     * Configurer écouteurs
     */
    function setupEventListeners() {
        PubSub.subscribe('excel:export:request', function(data) {
            exportMeasurements(data.measurements, data.fileName);
        });

        PubSub.subscribe('excel:import:catalogue', function(data) {
            importCatalogue(data.file);
        });
    }

    /**
     * Charger catalogues sauvegardés
     */
    function loadCatalogues() {
        const stored = localStorage.getItem('catalogues');
        if (stored) {
            try {
                catalogues = JSON.parse(stored);
            } catch(e) {
                console.error('Erreur chargement catalogues', e);
                catalogues = [];
            }
        }
    }

    /**
     * Sauvegarder catalogues
     */
    function saveCatalogues() {
        localStorage.setItem('catalogues', JSON.stringify(catalogues));
    }

    // ===== EXPORT EXCEL =====

    /**
     * Exporter mesures vers fichier Excel
     * @param {array} measurements - Liste des mesures
     * @param {string} fileName - Nom du fichier (optionnel)
     */
    function exportMeasurements(measurements = null, fileName = null) {
        if (typeof XLSX === 'undefined') {
            alert('Bibliothèque Excel non chargée. Incluez xlsx.js depuis CDN.');
            return;
        }

        // Obtenir mesures si non fournies
        if (!measurements) {
            const project = App.getCurrentProject();
            const version = App.getCurrentVersion();

            if (!project || !version) {
                alert('Aucun projet ouvert');
                return;
            }

            // Charger depuis StorageManager
            StorageManager.loadMeasurements(project.project_id, version).then(data => {
                const allMeasurements = [];

                // Extraire toutes les mesures de tous les plans
                if (data.measurements_by_plan) {
                    Object.keys(data.measurements_by_plan).forEach(planId => {
                        data.measurements_by_plan[planId].forEach(m => {
                            allMeasurements.push({ ...m, plan_id: planId });
                        });
                    });
                }

                generateExcelFile(allMeasurements, fileName || 'export_metre.xlsx');
            });
        } else {
            generateExcelFile(measurements, fileName || 'export_metre.xlsx');
        }
    }

    /**
     * Générer fichier Excel
     */
    function generateExcelFile(measurements, fileName) {
        // Créer workbook
        const wb = XLSX.utils.book_new();

        // Feuille 1: Récapitulatif
        const summaryData = generateSummarySheet(measurements);
        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Récapitulatif');

        // Feuille 2: Détail par plan
        const detailData = generateDetailSheet(measurements);
        const ws2 = XLSX.utils.aoa_to_sheet(detailData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Détail par plan');

        // Feuille 3: Quantitatifs (format standard)
        const quantData = generateQuantitativeSheet(measurements);
        const ws3 = XLSX.utils.aoa_to_sheet(quantData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Quantitatifs');

        // Télécharger
        XLSX.writeFile(wb, fileName);

        PubSub.publish('excel:exported', { fileName, count: measurements.length });
    }

    /**
     * Générer feuille récapitulative
     */
    function generateSummarySheet(measurements) {
        const data = [
            ['RÉCAPITULATIF MÉTRÉ'],
            [''],
            ['Date export:', new Date().toLocaleDateString()],
            ['Nombre total de mesures:', measurements.length],
            [''],
            ['TOTAUX PAR TYPE'],
            ['Type', 'Quantité', 'Unité']
        ];

        // Grouper par type
        const byType = {};
        measurements.forEach(m => {
            const type = m.type || 'Non spécifié';
            const unit = m.unit || '';

            if (!byType[type]) {
                byType[type] = { total: 0, unit: unit, count: 0 };
            }

            byType[type].total += parseFloat(m.value) || 0;
            byType[type].count += 1;
        });

        // Ajouter lignes
        Object.keys(byType).forEach(type => {
            const typeLabel = {
                'line': 'Linéaire',
                'polyline': 'Polyligne',
                'rectangle': 'Rectangle',
                'polygon': 'Polygone',
                'circle': 'Cercle',
                'count': 'Comptage',
                'volume': 'Volume'
            }[type] || type;

            data.push([
                typeLabel,
                byType[type].total.toFixed(2),
                byType[type].unit
            ]);
        });

        data.push(['']);
        data.push(['TOTAUX PAR CATÉGORIE']);
        data.push(['Catégorie', 'Quantité', 'Unité']);

        // Grouper par catégorie
        const byCategory = {};
        measurements.forEach(m => {
            const cat = m.category || 'Sans catégorie';
            const unit = m.unit || '';

            if (!byCategory[cat]) {
                byCategory[cat] = { total: 0, unit: unit };
            }

            byCategory[cat].total += parseFloat(m.value) || 0;
        });

        Object.keys(byCategory).forEach(cat => {
            data.push([
                cat,
                byCategory[cat].total.toFixed(2),
                byCategory[cat].unit
            ]);
        });

        return data;
    }

    /**
     * Générer feuille détail par plan
     */
    function generateDetailSheet(measurements) {
        const data = [
            ['DÉTAIL PAR PLAN'],
            [''],
            ['Code', 'Description', 'Catégorie', 'Type', 'Quantité', 'Unité', 'Plan', 'Date création']
        ];

        // Trier par plan puis par date
        const sorted = [...measurements].sort((a, b) => {
            if (a.plan_id !== b.plan_id) {
                return (a.plan_id || '').localeCompare(b.plan_id || '');
            }
            return new Date(a.created_at) - new Date(b.created_at);
        });

        sorted.forEach(m => {
            const typeLabel = {
                'line': 'Linéaire',
                'polyline': 'Polyligne',
                'rectangle': 'Rectangle',
                'polygon': 'Polygone',
                'circle': 'Cercle',
                'count': 'Comptage',
                'volume': 'Volume'
            }[m.type] || m.type;

            data.push([
                m.item_code || '',
                m.description || '',
                m.category || '',
                typeLabel,
                parseFloat(m.value || 0).toFixed(2),
                m.unit || '',
                m.plan_id || '',
                m.created_at ? new Date(m.created_at).toLocaleDateString() : ''
            ]);
        });

        return data;
    }

    /**
     * Générer feuille quantitatifs (format standard pour import ERP)
     */
    function generateQuantitativeSheet(measurements) {
        const data = [
            ['CODE', 'DESIGNATION', 'UNITE', 'QUANTITE', 'PU_HT', 'MONTANT_HT', 'CATEGORIE', 'PLAN', 'REMARQUE']
        ];

        measurements.forEach(m => {
            data.push([
                m.item_code || '',
                m.description || '',
                m.unit || '',
                parseFloat(m.value || 0).toFixed(2),
                parseFloat(m.unit_price || 0).toFixed(2),
                (parseFloat(m.value || 0) * parseFloat(m.unit_price || 0)).toFixed(2),
                m.category || '',
                m.plan_id || '',
                m.notes || ''
            ]);
        });

        // Ligne total
        data.push(['', '', '', '', '', '', '', '', '']);
        data.push(['', '', 'TOTAL HT', '', '', '=SUM(F2:F' + measurements.length + ')', '', '', '']);

        return data;
    }

    // ===== IMPORT CATALOGUE =====

    /**
     * Importer catalogue fournisseur depuis Excel/CSV
     * @param {File} file - Fichier Excel ou CSV
     */
    function importCatalogue(file) {
        if (typeof XLSX === 'undefined') {
            alert('Bibliothèque Excel non chargée');
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Lire première feuille
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // Parser catalogue
                const catalogue = parseCatalogue(rows, file.name);

                if (catalogue && catalogue.items.length > 0) {
                    catalogues.push(catalogue);
                    saveCatalogues();

                    PubSub.publish('catalogue:imported', { catalogue });
                    alert(`Catalogue importé: ${catalogue.items.length} articles`);
                } else {
                    alert('Aucun article trouvé dans le fichier');
                }

            } catch(error) {
                console.error('Erreur import catalogue', error);
                alert('Erreur lors de l\'import du catalogue');
            }
        };

        reader.readAsArrayBuffer(file);
    }

    /**
     * Parser fichier catalogue
     */
    function parseCatalogue(rows, fileName) {
        if (rows.length < 2) {
            throw new Error('Fichier vide ou invalide');
        }

        // Détecter colonnes (première ligne = en-têtes)
        const headers = rows[0].map(h => String(h).toLowerCase().trim());

        const colCode = findColumnIndex(headers, ['code', 'ref', 'référence', 'article']);
        const colDesignation = findColumnIndex(headers, ['designation', 'désignation', 'libelle', 'libellé', 'description']);
        const colUnit = findColumnIndex(headers, ['unite', 'unité', 'u']);
        const colPrice = findColumnIndex(headers, ['prix', 'pu', 'prix_ht', 'tarif']);
        const colCategory = findColumnIndex(headers, ['categorie', 'catégorie', 'famille', 'type']);

        if (colCode === -1 || colDesignation === -1) {
            throw new Error('Colonnes obligatoires manquantes (CODE et DESIGNATION)');
        }

        const items = [];

        // Parser lignes
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];

            if (!row || row.length === 0 || !row[colCode]) continue;

            const item = {
                code: String(row[colCode]).trim(),
                designation: String(row[colDesignation]).trim(),
                unit: colUnit >= 0 ? String(row[colUnit]).trim() : '',
                price: colPrice >= 0 ? parseFloat(row[colPrice]) || 0 : 0,
                category: colCategory >= 0 ? String(row[colCategory]).trim() : ''
            };

            items.push(item);
        }

        return {
            id: 'cat_' + Date.now(),
            name: fileName,
            imported_at: new Date().toISOString(),
            items: items
        };
    }

    /**
     * Trouver index de colonne à partir de variantes
     */
    function findColumnIndex(headers, variants) {
        for (let variant of variants) {
            const index = headers.indexOf(variant);
            if (index >= 0) return index;
        }
        return -1;
    }

    /**
     * Obtenir tous les catalogues
     */
    function getCatalogues() {
        return catalogues;
    }

    /**
     * Rechercher article dans catalogues
     */
    function searchInCatalogues(query) {
        const results = [];
        const q = query.toLowerCase();

        catalogues.forEach(cat => {
            cat.items.forEach(item => {
                if (item.code.toLowerCase().includes(q) ||
                    item.designation.toLowerCase().includes(q)) {
                    results.push({
                        ...item,
                        catalogue: cat.name
                    });
                }
            });
        });

        return results;
    }

    /**
     * Supprimer catalogue
     */
    function deleteCatalogue(catalogueId) {
        catalogues = catalogues.filter(c => c.id !== catalogueId);
        saveCatalogues();
        PubSub.publish('catalogue:deleted', { catalogueId });
    }

    // ===== EXPORT CSV SIMPLE =====

    /**
     * Exporter vers CSV (sans dépendance externe)
     */
    function exportToCSV(measurements = null, fileName = 'export_metre.csv') {
        const project = App.getCurrentProject();
        const version = App.getCurrentVersion();

        if (!measurements && (!project || !version)) {
            alert('Aucun projet ouvert');
            return;
        }

        if (!measurements) {
            StorageManager.loadMeasurements(project.project_id, version).then(data => {
                const allMeasurements = [];

                if (data.measurements_by_plan) {
                    Object.keys(data.measurements_by_plan).forEach(planId => {
                        data.measurements_by_plan[planId].forEach(m => {
                            allMeasurements.push({ ...m, plan_id: planId });
                        });
                    });
                }

                generateCSVFile(allMeasurements, fileName);
            });
        } else {
            generateCSVFile(measurements, fileName);
        }
    }

    /**
     * Générer fichier CSV
     */
    function generateCSVFile(measurements, fileName) {
        const headers = ['Code', 'Description', 'Catégorie', 'Type', 'Quantité', 'Unité', 'PU HT', 'Montant HT', 'Plan', 'Date'];
        const rows = [headers];

        measurements.forEach(m => {
            const typeLabel = {
                'line': 'Linéaire',
                'polyline': 'Polyligne',
                'rectangle': 'Rectangle',
                'polygon': 'Polygone',
                'circle': 'Cercle',
                'count': 'Comptage',
                'volume': 'Volume'
            }[m.type] || m.type;

            const quantity = parseFloat(m.value || 0);
            const unitPrice = parseFloat(m.unit_price || 0);
            const total = quantity * unitPrice;

            rows.push([
                m.item_code || '',
                m.description || '',
                m.category || '',
                typeLabel,
                quantity.toFixed(2),
                m.unit || '',
                unitPrice.toFixed(2),
                total.toFixed(2),
                m.plan_id || '',
                m.created_at ? new Date(m.created_at).toLocaleDateString() : ''
            ]);
        });

        // Convertir en CSV
        const csv = rows.map(row =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')
        ).join('\n');

        // Télécharger
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        PubSub.publish('csv:exported', { fileName, count: measurements.length });
    }

    // Initialiser
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API publique
    return {
        // Export
        exportMeasurements,
        exportToCSV,

        // Import
        importCatalogue,
        getCatalogues,
        searchInCatalogues,
        deleteCatalogue
    };
})();
