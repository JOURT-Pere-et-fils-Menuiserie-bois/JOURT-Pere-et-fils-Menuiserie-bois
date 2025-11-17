/**
 * Module Gestion Bibliothèque Fiches Produits
 *
 * Gère la bibliothèque centralisée de fiches techniques produits (PDF fournisseurs)
 * Système de références pour éviter la duplication
 */

const ProductSheets = (function() {
    'use strict';

    // État
    let library = {}; // { sheet_id: metadata }
    let isLibraryLoaded = false;

    /**
     * Initialiser le module
     */
    function init() {
        console.log('ProductSheets: Initialisation');

        // Charger la bibliothèque
        loadLibrary();

        // Écouter les événements
        setupEventListeners();
    }

    /**
     * Charger la bibliothèque depuis l'API
     */
    async function loadLibrary() {
        try {
            const response = await fetch('php/api/product-sheets.php');
            const responseText = await response.text();

            // Valider que c'est du JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Invalid JSON response:', responseText.substring(0, 500));
                console.error('Erreur chargement bibliothèque: Le serveur a retourné une réponse invalide');
                return;
            }

            if (data.success) {
                library = data.sheets || {};
                isLibraryLoaded = true;
                console.log(`ProductSheets: ${Object.keys(library).length} fiches chargées`);

                PubSub.publish(EVENTS.PRODUCT_SHEETS_LOADED, { library });
            } else {
                console.error('Erreur chargement bibliothèque:', data.error);
            }
        } catch (error) {
            console.error('Erreur chargement bibliothèque:', error);
        }
    }

    /**
     * Configurer les event listeners
     */
    function setupEventListeners() {
        // Bouton "Bibliothèque Fiches"
        const btnLibrary = document.getElementById('btn-product-sheets-library');
        if (btnLibrary) {
            btnLibrary.addEventListener('click', openLibraryModal);
        }

        // Bouton upload dans la modal bibliothèque
        const btnUpload = document.getElementById('btn-upload-product-sheet');
        if (btnUpload) {
            btnUpload.addEventListener('click', handleUploadSheet);
        }

        // Recherche dans la bibliothèque
        const searchInput = document.getElementById('product-sheets-search');
        if (searchInput) {
            searchInput.addEventListener('input', handleLibrarySearch);
        }
    }

    /**
     * Ouvrir la modal bibliothèque
     */
    function openLibraryModal() {
        const modal = document.getElementById('product-sheets-library-modal');
        if (!modal) return;

        // Rafraîchir la liste
        renderLibraryList();

        modal.style.display = 'block';
    }

    /**
     * Fermer la modal bibliothèque
     */
    function closeLibraryModal() {
        const modal = document.getElementById('product-sheets-library-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Afficher la liste des fiches dans la modal bibliothèque
     */
    function renderLibraryList(filter = '') {
        const container = document.getElementById('product-sheets-list');
        if (!container) return;

        container.innerHTML = '';

        const sheets = Object.values(library);

        // Filtrer
        const filteredSheets = filter
            ? sheets.filter(sheet =>
                sheet.name.toLowerCase().includes(filter.toLowerCase()) ||
                (sheet.reference && sheet.reference.toLowerCase().includes(filter.toLowerCase())) ||
                (sheet.manufacturer && sheet.manufacturer.toLowerCase().includes(filter.toLowerCase())) ||
                (sheet.category && sheet.category.toLowerCase().includes(filter.toLowerCase()))
            )
            : sheets;

        if (filteredSheets.length === 0) {
            container.innerHTML = '<p class="empty-state">Aucune fiche dans la bibliothèque</p>';
            return;
        }

        // Afficher les fiches
        filteredSheets.forEach(sheet => {
            const item = createLibraryItem(sheet);
            container.appendChild(item);
        });
    }

    /**
     * Créer un élément de liste pour une fiche
     */
    function createLibraryItem(sheet) {
        const div = document.createElement('div');
        div.className = 'product-sheet-item';
        div.dataset.sheetId = sheet.id;

        const normsHtml = sheet.norms && sheet.norms.length > 0
            ? `<span class="norms">${sheet.norms.join(', ')}</span>`
            : '';

        const categoryHtml = sheet.category
            ? `<span class="category">${sheet.category}</span>`
            : '';

        div.innerHTML = `
            <div class="sheet-info">
                <h4>${escapeHtml(sheet.name)}</h4>
                <p class="ref">Réf: ${escapeHtml(sheet.reference || 'N/A')}</p>
                <p class="manufacturer">${escapeHtml(sheet.manufacturer || 'N/A')}</p>
                <div class="meta">
                    ${categoryHtml}
                    ${normsHtml}
                </div>
            </div>
            <div class="sheet-actions">
                <button class="btn-icon btn-view-pdf" data-sheet-id="${sheet.id}" title="Voir PDF">
                    👁️
                </button>
                <button class="btn-icon btn-edit-sheet" data-sheet-id="${sheet.id}" title="Modifier">
                    ✏️
                </button>
                <button class="btn-icon btn-delete-sheet" data-sheet-id="${sheet.id}" title="Supprimer">
                    🗑️
                </button>
            </div>
        `;

        // Event listeners
        div.querySelector('.btn-view-pdf').addEventListener('click', () => viewSheetPDF(sheet.id));
        div.querySelector('.btn-edit-sheet').addEventListener('click', () => editSheet(sheet.id));
        div.querySelector('.btn-delete-sheet').addEventListener('click', () => deleteSheet(sheet.id));

        return div;
    }

    /**
     * Upload nouvelle fiche
     */
    async function handleUploadSheet() {
        const fileInput = document.getElementById('product-sheet-pdf-file');
        const nameInput = document.getElementById('product-sheet-name');
        const refInput = document.getElementById('product-sheet-ref');
        const manuInput = document.getElementById('product-sheet-manufacturer');
        const normsInput = document.getElementById('product-sheet-norms');
        const categoryInput = document.getElementById('product-sheet-category');
        const tagsInput = document.getElementById('product-sheet-tags');

        if (!fileInput || !fileInput.files.length) {
            alert('Veuillez sélectionner un fichier PDF');
            return;
        }

        if (!nameInput || !nameInput.value.trim()) {
            alert('Veuillez saisir un nom pour la fiche');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', fileInput.files[0]);
        formData.append('name', nameInput.value.trim());
        formData.append('reference', refInput ? refInput.value.trim() : '');
        formData.append('manufacturer', manuInput ? manuInput.value.trim() : '');

        // Normes (tableau)
        const normsArray = normsInput && normsInput.value.trim()
            ? normsInput.value.split(',').map(n => n.trim()).filter(n => n)
            : [];
        formData.append('norms', JSON.stringify(normsArray));

        formData.append('category', categoryInput ? categoryInput.value.trim() : '');

        // Tags (tableau)
        const tagsArray = tagsInput && tagsInput.value.trim()
            ? tagsInput.value.split(',').map(t => t.trim()).filter(t => t)
            : [];
        formData.append('tags', JSON.stringify(tagsArray));

        try {
            const response = await fetch('php/api/product-sheets.php', {
                method: 'POST',
                body: formData
            });

            const responseText = await response.text();

            // Valider JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Invalid JSON response:', responseText.substring(0, 500));
                alert('Erreur serveur: réponse invalide');
                return;
            }

            if (data.success) {
                // Ajouter à la bibliothèque locale
                library[data.sheet.id] = data.sheet;

                // Rafraîchir la liste
                renderLibraryList();

                // Réinitialiser le formulaire
                fileInput.value = '';
                nameInput.value = '';
                if (refInput) refInput.value = '';
                if (manuInput) manuInput.value = '';
                if (normsInput) normsInput.value = '';
                if (categoryInput) categoryInput.value = '';
                if (tagsInput) tagsInput.value = '';

                alert('Fiche ajoutée à la bibliothèque');

                PubSub.publish(EVENTS.PRODUCT_SHEET_ADDED, { sheet: data.sheet });
            } else {
                alert('Erreur: ' + data.error);
            }
        } catch (error) {
            console.error('Erreur upload fiche:', error);
            alert('Erreur lors de l\'upload de la fiche');
        }
    }

    /**
     * Voir le PDF d'une fiche
     */
    function viewSheetPDF(sheetId) {
        const sheet = library[sheetId];
        if (!sheet) return;

        const pdfUrl = `uploads/product-sheets/${sheet.pdf_filename}`;
        window.open(pdfUrl, '_blank');
    }

    /**
     * Modifier les métadonnées d'une fiche
     */
    async function editSheet(sheetId) {
        const sheet = library[sheetId];
        if (!sheet) return;

        // TODO: Implémenter modal d'édition
        const newName = prompt('Nom de la fiche:', sheet.name);
        if (!newName) return;

        try {
            const response = await fetch('php/api/product-sheets.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sheet_id: sheetId,
                    name: newName
                })
            });

            const responseText = await response.text();

            // Valider JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Invalid JSON response:', responseText.substring(0, 500));
                alert('Erreur serveur: réponse invalide');
                return;
            }

            if (data.success) {
                library[sheetId] = data.sheet;
                renderLibraryList();
                PubSub.publish(EVENTS.PRODUCT_SHEET_UPDATED, { sheet: data.sheet });
            } else {
                alert('Erreur: ' + data.error);
            }
        } catch (error) {
            console.error('Erreur modification fiche:', error);
            alert('Erreur lors de la modification');
        }
    }

    /**
     * Supprimer une fiche
     */
    async function deleteSheet(sheetId) {
        const sheet = library[sheetId];
        if (!sheet) return;

        if (!confirm(`Supprimer la fiche "${sheet.name}" ?\n\nCette action est irréversible.`)) {
            return;
        }

        try {
            const response = await fetch('php/api/product-sheets.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sheet_id: sheetId
                })
            });

            const responseText = await response.text();

            // Valider JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Invalid JSON response:', responseText.substring(0, 500));
                alert('Erreur serveur: réponse invalide');
                return;
            }

            if (data.success) {
                delete library[sheetId];
                renderLibraryList();
                PubSub.publish(EVENTS.PRODUCT_SHEET_DELETED, { sheetId });
            } else {
                alert('Erreur: ' + data.error);
            }
        } catch (error) {
            console.error('Erreur suppression fiche:', error);
            alert('Erreur lors de la suppression');
        }
    }

    /**
     * Recherche dans la bibliothèque
     */
    function handleLibrarySearch(event) {
        const filter = event.target.value;
        renderLibraryList(filter);
    }

    /**
     * Obtenir une fiche par ID
     */
    function getSheet(sheetId) {
        return library[sheetId] || null;
    }

    /**
     * Obtenir toutes les fiches
     */
    function getAllSheets() {
        return Object.values(library);
    }

    /**
     * Obtenir les fiches pour une liste d'IDs
     */
    function getSheetsByIds(sheetIds) {
        return sheetIds.map(id => library[id]).filter(sheet => sheet !== undefined);
    }

    /**
     * Escape HTML pour prévenir XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // API Publique
    return {
        init,
        loadLibrary,
        openLibraryModal,
        closeLibraryModal,
        getSheet,
        getAllSheets,
        getSheetsByIds
    };
})();
