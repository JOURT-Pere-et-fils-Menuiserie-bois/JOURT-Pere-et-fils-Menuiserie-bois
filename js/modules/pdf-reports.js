/**
 * PDF Reports Generator
 * Génération de rapports de métré professionnels en PDF
 * Utilise jsPDF + jsPDF-AutoTable pour mise en forme
 */

const PDFReports = (function() {
    let companyInfo = {
        name: 'JOURT Père et fils',
        subtitle: 'Menuiserie Bois',
        address: '',
        phone: '',
        email: '',
        logo: null // Base64 ou URL
    };

    /**
     * Initialiser
     */
    function init() {
        loadCompanyInfo();
        setupEventListeners();
    }

    /**
     * Charger infos entreprise
     */
    function loadCompanyInfo() {
        const stored = localStorage.getItem('companyInfo');
        if (stored) {
            try {
                companyInfo = { ...companyInfo, ...JSON.parse(stored) };
            } catch(e) {
                console.error('Erreur chargement infos entreprise', e);
            }
        }
    }

    /**
     * Sauvegarder infos entreprise
     */
    function saveCompanyInfo() {
        localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    }

    /**
     * Configurer écouteurs
     */
    function setupEventListeners() {
        PubSub.subscribe('pdf:generate:request', function(data) {
            generateReport(data.measurements, data.options);
        });
    }

    /**
     * Mettre à jour infos entreprise
     */
    function setCompanyInfo(info) {
        companyInfo = { ...companyInfo, ...info };
        saveCompanyInfo();
    }

    /**
     * Obtenir infos entreprise
     */
    function getCompanyInfo() {
        return companyInfo;
    }

    // ===== GÉNÉRATION RAPPORT =====

    /**
     * Générer rapport PDF complet
     * @param {array} measurements - Mesures à inclure
     * @param {object} options - Options du rapport
     */
    function generateReport(measurements = null, options = {}) {
        if (typeof jsPDF === 'undefined') {
            alert('Bibliothèque jsPDF non chargée. Incluez jspdf.umd.min.js depuis CDN.');
            return;
        }

        // Options par défaut
        const opts = {
            title: 'Rapport de Métré',
            includeImages: true,
            includeSummary: true,
            includeDetails: true,
            includeSignature: true,
            fileName: 'rapport_metre_' + new Date().getTime() + '.pdf',
            ...options
        };

        // Obtenir mesures si non fournies
        if (!measurements) {
            const project = App.getCurrentProject();
            const version = App.getCurrentVersion();

            if (!project || !version) {
                alert('Aucun projet ouvert');
                return;
            }

            StorageManager.loadMeasurements(project.project_id, version).then(data => {
                const allMeasurements = [];

                if (data.measurements_by_plan) {
                    Object.keys(data.measurements_by_plan).forEach(planId => {
                        data.measurements_by_plan[planId].forEach(m => {
                            allMeasurements.push({ ...m, plan_id: planId });
                        });
                    });
                }

                buildPDF(allMeasurements, opts);
            });
        } else {
            buildPDF(measurements, opts);
        }
    }

    /**
     * Construire document PDF
     */
    function buildPDF(measurements, options) {
        // Créer document A4
        const doc = new jsPDF('p', 'mm', 'a4');
        let yPos = 20;

        // Page 1: En-tête et sommaire
        yPos = addHeader(doc, yPos, options.title);
        yPos = addProjectInfo(doc, yPos);

        if (options.includeSummary) {
            yPos = addSummary(doc, yPos, measurements);
        }

        // Nouvelle page pour détails
        doc.addPage();
        yPos = 20;

        if (options.includeDetails) {
            yPos = addDetailsTable(doc, yPos, measurements);
        }

        // Nouvelle page pour totaux par catégorie
        if (measurements.length > 20) {
            doc.addPage();
            yPos = 20;
        }

        yPos = addCategoryTotals(doc, yPos, measurements);

        // Signature
        if (options.includeSignature) {
            yPos = addSignatureBlock(doc, yPos);
        }

        // Pied de page sur toutes les pages
        addFooter(doc);

        // Télécharger
        doc.save(options.fileName);

        PubSub.publish('pdf:generated', { fileName: options.fileName });
    }

    /**
     * Ajouter en-tête
     */
    function addHeader(doc, y, title) {
        // Logo entreprise (si disponible)
        if (companyInfo.logo) {
            try {
                doc.addImage(companyInfo.logo, 'PNG', 15, y, 30, 30);
            } catch(e) {
                console.error('Erreur ajout logo', e);
            }
        }

        // Infos entreprise
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(companyInfo.name, companyInfo.logo ? 50 : 15, y + 5);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(companyInfo.subtitle, companyInfo.logo ? 50 : 15, y + 12);

        if (companyInfo.address) {
            doc.setFontSize(9);
            doc.text(companyInfo.address, companyInfo.logo ? 50 : 15, y + 18);
        }

        if (companyInfo.phone || companyInfo.email) {
            doc.setFontSize(9);
            const contact = [companyInfo.phone, companyInfo.email].filter(Boolean).join(' - ');
            doc.text(contact, companyInfo.logo ? 50 : 15, y + 23);
        }

        // Ligne de séparation
        doc.setDrawColor(200);
        doc.line(15, y + 30, 195, y + 30);

        // Titre rapport
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 105, y + 42, { align: 'center' });

        // Date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Date: ' + new Date().toLocaleDateString(), 195, y + 42, { align: 'right' });

        return y + 55;
    }

    /**
     * Ajouter infos projet
     */
    function addProjectInfo(doc, y) {
        const project = App.getCurrentProject();
        const version = App.getCurrentVersion();

        if (!project) return y;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMATIONS PROJET', 15, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const lines = [
            `Projet: ${project.name || project.project_id}`,
            `Version: ${version ? version.version_label : 'N/A'}`,
            `Date création: ${project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}`
        ];

        lines.forEach((line, i) => {
            doc.text(line, 15, y + 7 + (i * 6));
        });

        return y + 30;
    }

    /**
     * Ajouter récapitulatif
     */
    function addSummary(doc, y, measurements) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('RÉCAPITULATIF', 15, y);

        // Compter par type
        const byType = {};
        measurements.forEach(m => {
            const type = m.type || 'Non spécifié';
            if (!byType[type]) {
                byType[type] = { count: 0, total: 0, unit: m.unit || '' };
            }
            byType[type].count++;
            byType[type].total += parseFloat(m.value) || 0;
        });

        // Tableau
        const tableData = [];
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

            tableData.push([
                typeLabel,
                byType[type].count,
                byType[type].total.toFixed(2),
                byType[type].unit
            ]);
        });

        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                startY: y + 5,
                head: [['Type', 'Nombre', 'Total', 'Unité']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [66, 139, 202] },
                styles: { fontSize: 9 },
                margin: { left: 15, right: 15 }
            });

            return doc.lastAutoTable.finalY + 10;
        } else {
            // Fallback si autoTable non disponible
            return y + 50;
        }
    }

    /**
     * Ajouter tableau détaillé
     */
    function addDetailsTable(doc, y, measurements) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('DÉTAIL DES MESURES', 15, y);

        const tableData = [];

        measurements.forEach((m, i) => {
            const typeLabel = {
                'line': 'Lin.',
                'polyline': 'Polyl.',
                'rectangle': 'Rect.',
                'polygon': 'Poly.',
                'circle': 'Cercle',
                'count': 'Compt.',
                'volume': 'Vol.'
            }[m.type] || m.type;

            tableData.push([
                i + 1,
                m.item_code || '-',
                m.description || '-',
                m.category || '-',
                typeLabel,
                parseFloat(m.value || 0).toFixed(2),
                m.unit || '',
                m.plan_id || '-'
            ]);
        });

        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                startY: y + 5,
                head: [['N°', 'Code', 'Description', 'Catégorie', 'Type', 'Qté', 'Unité', 'Plan']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [66, 139, 202] },
                styles: { fontSize: 8 },
                margin: { left: 15, right: 15 },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 15 },
                    5: { cellWidth: 18 },
                    6: { cellWidth: 15 },
                    7: { cellWidth: 20 }
                }
            });

            return doc.lastAutoTable.finalY + 10;
        } else {
            return y + 50;
        }
    }

    /**
     * Ajouter totaux par catégorie
     */
    function addCategoryTotals(doc, y, measurements) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAUX PAR CATÉGORIE', 15, y);

        // Grouper par catégorie
        const byCategory = {};
        measurements.forEach(m => {
            const cat = m.category || 'Sans catégorie';
            const unit = m.unit || '';

            if (!byCategory[cat]) {
                byCategory[cat] = { items: [], total: 0, unit: unit };
            }

            byCategory[cat].items.push(m);
            byCategory[cat].total += parseFloat(m.value) || 0;
        });

        const tableData = [];
        Object.keys(byCategory).forEach(cat => {
            tableData.push([
                cat,
                byCategory[cat].items.length,
                byCategory[cat].total.toFixed(2),
                byCategory[cat].unit
            ]);
        });

        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                startY: y + 5,
                head: [['Catégorie', 'Nombre', 'Total', 'Unité']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [66, 139, 202] },
                styles: { fontSize: 9 },
                margin: { left: 15, right: 15 }
            });

            return doc.lastAutoTable.finalY + 10;
        } else {
            return y + 50;
        }
    }

    /**
     * Ajouter bloc signature
     */
    function addSignatureBlock(doc, y) {
        // Vérifier si on a assez d'espace, sinon nouvelle page
        if (y > 240) {
            doc.addPage();
            y = 20;
        }

        doc.setDrawColor(150);
        doc.line(15, y, 195, y);

        y += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Bloc établi par
        doc.text('Établi par:', 20, y);
        doc.text('Date: ' + new Date().toLocaleDateString(), 20, y + 7);
        doc.rect(20, y + 15, 70, 30); // Cadre signature

        // Bloc validé par (client)
        doc.text('Validé par (client):', 120, y);
        doc.text('Date: ', 120, y + 7);
        doc.rect(120, y + 15, 70, 30); // Cadre signature

        return y + 50;
    }

    /**
     * Ajouter pied de page sur toutes les pages
     */
    function addFooter(doc) {
        const pageCount = doc.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Ligne
            doc.setDrawColor(200);
            doc.line(15, 285, 195, 285);

            // Texte pied de page
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text(
                `${companyInfo.name} - Rapport généré le ${new Date().toLocaleDateString()}`,
                105,
                290,
                { align: 'center' }
            );

            // Numéro de page
            doc.text(
                `Page ${i} / ${pageCount}`,
                195,
                290,
                { align: 'right' }
            );
        }
    }

    // ===== RAPPORT SIMPLIFIÉ (SANS AUTOTABLE) =====

    /**
     * Générer rapport simple sans dépendance autoTable
     */
    function generateSimpleReport(measurements = null, fileName = 'rapport_metre.pdf') {
        if (typeof jsPDF === 'undefined') {
            alert('Bibliothèque jsPDF non chargée');
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        let y = 20;

        // En-tête
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(companyInfo.name, 105, y, { align: 'center' });

        y += 10;
        doc.setFontSize(14);
        doc.text('Rapport de Métré', 105, y, { align: 'center' });

        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Date: ' + new Date().toLocaleDateString(), 105, y, { align: 'center' });

        y += 15;

        // Statistiques
        if (measurements && measurements.length > 0) {
            doc.text(`Nombre total de mesures: ${measurements.length}`, 15, y);
            y += 10;

            // Liste simplifiée
            doc.setFontSize(9);
            measurements.slice(0, 50).forEach((m, i) => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }

                const line = `${i + 1}. ${m.description || 'Mesure'} - ${parseFloat(m.value || 0).toFixed(2)} ${m.unit || ''}`;
                doc.text(line, 15, y);
                y += 5;
            });

            if (measurements.length > 50) {
                doc.text(`... et ${measurements.length - 50} autres mesures`, 15, y + 5);
            }
        }

        doc.save(fileName);
    }

    // Initialiser
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API publique
    return {
        generateReport,
        generateSimpleReport,
        setCompanyInfo,
        getCompanyInfo
    };
})();
