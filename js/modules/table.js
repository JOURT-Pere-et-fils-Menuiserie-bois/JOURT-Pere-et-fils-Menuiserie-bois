/**
 * Measurements Table Manager
 * Gère le tableau récapitulatif des mesures
 */

const MeasurementTable = (function() {
    let measurements = [];
    let tbody = null;
    let totalDisplay = null;

    // Helper: Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Initialiser
     */
    function init() {
        tbody = document.getElementById('measurements-tbody');
        totalDisplay = document.getElementById('total-amount');

        setupEventListeners();
    }

    /**
     * Configurer les écouteurs d'événements
     */
    function setupEventListeners() {
        // Écouter les nouveaux mesures
        PubSub.subscribe(EVENTS.MEASUREMENT_CREATED, function(data) {
            addMeasurement(data.measurement);
        });

        PubSub.subscribe(EVENTS.MEASUREMENT_UPDATED, function(data) {
            updateMeasurement(data.measurement);
        });

        PubSub.subscribe(EVENTS.MEASUREMENT_DELETED, function(data) {
            removeMeasurement(data.measurementId);
        });

        PubSub.subscribe('measurement:delete:multiple', function(data) {
            data.ids.forEach(id => removeMeasurement(id));
        });
    }

    /**
     * Ajouter une mesure au tableau
     */
    function addMeasurement(measurement) {
        // Retirer empty state
        const emptyState = tbody.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        measurements.push(measurement);

        const row = createRow(measurement);
        tbody.appendChild(row);

        updateTotal();
    }

    /**
     * Créer une ligne du tableau
     */
    function createRow(measurement) {
        const row = document.createElement('tr');
        row.dataset.measurementId = measurement.id;

        // Générer code automatique si manquant
        const code = measurement.item_code || generateItemCode(measurement);
        const description = measurement.description || getDefaultDescription(measurement);
        const category = measurement.category || getCategoryFromType(measurement.type);
        const quantity = measurement.value || 0;
        const unit = measurement.unit || getUnitFromType(measurement.type);
        const unitPrice = measurement.unit_price || 0;
        const total = quantity * unitPrice;
        const status = measurement.status || 'draft';

        row.innerHTML = `
            <td>
                <input type="checkbox" class="row-checkbox" value="${measurement.id}">
            </td>
            <td>
                <input type="text" class="table-input" data-field="item_code" value="${code}">
            </td>
            <td>
                <input type="text" class="table-input" data-field="description" value="${description}">
            </td>
            <td>
                <input type="text" class="table-input" data-field="category" value="${category}">
            </td>
            <td class="text-right">
                <input type="number" class="table-input" data-field="quantity"
                       value="${quantity.toFixed(2)}" step="0.01" style="width: 80px;">
            </td>
            <td>
                <select class="table-input" data-field="unit">
                    <option value="m" ${unit === 'm' ? 'selected' : ''}>m</option>
                    <option value="m²" ${unit === 'm²' ? 'selected' : ''}>m²</option>
                    <option value="m³" ${unit === 'm³' ? 'selected' : ''}>m³</option>
                    <option value="unité" ${unit === 'unité' ? 'selected' : ''}>unité</option>
                </select>
            </td>
            <td class="text-right">
                <input type="number" class="table-input" data-field="unit_price"
                       value="${unitPrice.toFixed(2)}" step="0.01" style="width: 80px;">
            </td>
            <td class="text-right">
                <strong class="row-total">${formatCurrency(total)}</strong>
            </td>
            <td>
                <span class="status-badge status-${status}">${getStatusLabel(status)}</span>
            </td>
            <td>
                <button class="table-action-btn" data-action="edit" title="Éditer">
                    ✏️
                </button>
                <button class="table-action-btn delete" data-action="delete" title="Supprimer">
                    🗑️
                </button>
                <button class="table-action-btn" data-action="highlight" title="Localiser">
                    🎯
                </button>
            </td>
        `;

        // Ajouter événements sur les inputs
        row.querySelectorAll('.table-input').forEach(input => {
            input.addEventListener('change', function() {
                handleInputChange(measurement.id, this);
            });
        });

        // Ajouter événements sur les boutons d'action
        row.querySelectorAll('.table-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                switch(action) {
                    case 'edit':
                        editRow(measurement.id);
                        break;
                    case 'delete':
                        deleteRow(measurement.id);
                        break;
                    case 'highlight':
                        highlightMeasurement(measurement.id);
                        break;
                }
            });
        });

        return row;
    }

    /**
     * Gérer changement de valeur
     */
    function handleInputChange(measurementId, input) {
        const field = input.dataset.field;
        let value = input.value;

        const measurement = measurements.find(m => m.id === measurementId);
        if (!measurement) return;

        // Validation et conversion selon le type de champ
        if (field === 'quantity' || field === 'unit_price') {
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) {
                input.value = measurement[field] || 0; // Restaurer ancienne valeur
                return;
            }
            value = numValue;
        }

        // Mettre à jour la mesure
        measurement[field] = value;

        // Recalculer total si nécessaire
        if (field === 'quantity' || field === 'unit_price') {
            const row = input.closest('tr');
            const quantity = parseFloat(row.querySelector('[data-field="quantity"]').value) || 0;
            const unitPrice = parseFloat(row.querySelector('[data-field="unit_price"]').value) || 0;
            const total = quantity * unitPrice;

            row.querySelector('.row-total').textContent = formatCurrency(total);
            updateTotalDebounced(); // Debounced pour performance pendant saisie
        }

        // Notifier
        PubSub.publish(EVENTS.MEASUREMENT_UPDATED, { measurement });
    }

    /**
     * Mettre à jour une mesure
     */
    function updateMeasurement(measurement) {
        const index = measurements.findIndex(m => m.id === measurement.id);
        if (index !== -1) {
            measurements[index] = measurement;

            const row = tbody.querySelector(`tr[data-measurement-id="${measurement.id}"]`);
            if (row) {
                const newRow = createRow(measurement);
                row.replaceWith(newRow);
            }

            updateTotal();
        }
    }

    /**
     * Supprimer une mesure
     */
    function removeMeasurement(measurementId) {
        const index = measurements.findIndex(m => m.id == measurementId);
        if (index !== -1) {
            measurements.splice(index, 1);
        }

        const row = tbody.querySelector(`tr[data-measurement-id="${measurementId}"]`);
        if (row) {
            row.remove();
        }

        // Réafficher empty state si nécessaire
        if (measurements.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="10">Aucune mesure. Utilisez les outils pour commencer.</td>
                </tr>
            `;
        }

        updateTotal();
    }

    /**
     * Mettre à jour le total
     */
    function updateTotal() {
        let total = 0;

        measurements.forEach(m => {
            const quantity = parseFloat(m.quantity || m.value || 0);
            const unitPrice = parseFloat(m.unit_price || 0);
            total += quantity * unitPrice;
        });

        if (totalDisplay) {
            totalDisplay.innerHTML = `<strong>${formatCurrency(total)}</strong>`;
        }
    }

    // Version debouncée pour éviter trop d'appels
    const updateTotalDebounced = debounce(updateTotal, 300);

    /**
     * Formater montant en euros
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    /**
     * Générer code article automatique
     */
    function generateItemCode(measurement) {
        const typePrefix = {
            'line': 'LIN',
            'polyline': 'POL',
            'rectangle': 'REC',
            'polygon': 'POG',
            'circle': 'CER',
            'count': 'CPT'
        };

        const prefix = typePrefix[measurement.type] || 'MES';
        const number = String(measurement.id).padStart(3, '0');

        return `${prefix}-${number}`;
    }

    /**
     * Obtenir description par défaut
     */
    function getDefaultDescription(measurement) {
        const descriptions = {
            'line': 'Mesure linéaire',
            'polyline': 'Mesure linéaire (polyligne)',
            'rectangle': 'Surface rectangulaire',
            'polygon': 'Surface polygonale',
            'circle': 'Surface circulaire',
            'count': 'Comptage'
        };

        return descriptions[measurement.type] || 'Mesure';
    }

    /**
     * Obtenir catégorie depuis type
     */
    function getCategoryFromType(type) {
        if (type === 'line' || type === 'polyline') {
            return 'Linéaire';
        } else if (type === 'rectangle' || type === 'polygon' || type === 'circle') {
            return 'Surface';
        } else if (type === 'count') {
            return 'Comptage';
        }
        return 'Non catégorisé';
    }

    /**
     * Obtenir unité depuis type
     */
    function getUnitFromType(type) {
        if (type === 'line' || type === 'polyline') {
            return 'm';
        } else if (type === 'rectangle' || type === 'polygon' || type === 'circle') {
            return 'm²';
        } else if (type === 'count') {
            return 'unité';
        }
        return 'm';
    }

    /**
     * Obtenir label statut
     */
    function getStatusLabel(status) {
        const labels = {
            'draft': 'Brouillon',
            'confirmed': 'Confirmé',
            'sent': 'Envoyé',
            'approved': 'Approuvé',
            'rejected': 'Refusé',
            'invoiced': 'Facturé',
            'paid': 'Payé'
        };
        return labels[status] || status;
    }

    /**
     * Éditer une ligne
     */
    function editRow(measurementId) {
        const measurement = measurements.find(m => m.id == measurementId);
        if (measurement) {
            // Focus sur le premier input
            const row = tbody.querySelector(`tr[data-measurement-id="${measurementId}"]`);
            const firstInput = row.querySelector('input[type="text"]');
            if (firstInput) {
                firstInput.focus();
                firstInput.select();
            }
        }
    }

    /**
     * Supprimer une ligne
     */
    function deleteRow(measurementId) {
        if (confirm('Supprimer cette mesure ?')) {
            PubSub.publish(EVENTS.MEASUREMENT_DELETED, { measurementId });
        }
    }

    /**
     * Mettre en évidence une mesure sur le plan
     */
    function highlightMeasurement(measurementId) {
        // Sélectionner sur le dessin
        DrawingManager.selectMeasurement(measurementId);

        // Scroll vers la mesure si nécessaire
        const measurement = measurements.find(m => m.id == measurementId);
        if (measurement && measurement.coordinates) {
            // Centrer la vue sur la mesure
            // TODO: Implémenter pan vers coordonnées
        }
    }

    /**
     * Exporter les mesures
     */
    function exportData(format) {
        switch(format) {
            case 'csv':
                exportToCSV();
                break;
            case 'excel':
                exportToExcel();
                break;
            case 'pdf':
                exportToPDF();
                break;
        }
    }

    /**
     * Exporter en CSV
     */
    function exportToCSV() {
        const headers = ['Code', 'Description', 'Catégorie', 'Quantité', 'Unité', 'P.U.', 'Total'];

        let csv = headers.join(',') + '\n';

        measurements.forEach(m => {
            const row = [
                m.item_code || generateItemCode(m),
                m.description || getDefaultDescription(m),
                m.category || getCategoryFromType(m.type),
                (m.value || 0).toFixed(2),
                m.unit || getUnitFromType(m.type),
                (m.unit_price || 0).toFixed(2),
                ((m.value || 0) * (m.unit_price || 0)).toFixed(2)
            ];
            csv += row.join(',') + '\n';
        });

        // Télécharger
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `mesures_${Date.now()}.csv`;
        link.click();
    }

    /**
     * Obtenir les mesures
     */
    function getMeasurements() {
        return measurements;
    }

    /**
     * Charger des mesures
     */
    function loadMeasurements(data) {
        measurements = [];
        tbody.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach(m => addMeasurement(m));
        } else {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="10">Aucune mesure. Utilisez les outils pour commencer.</td>
                </tr>
            `;
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
        addMeasurement,
        updateMeasurement,
        removeMeasurement,
        getMeasurements,
        loadMeasurements,
        exportData,
        editRow,
        deleteRow,
        highlightMeasurement
    };
})();
