/**
 * PubSub - Publish/Subscribe Pattern
 * Permet la communication découplée entre modules
 */

const PubSub = (function() {
    const events = {};

    /**
     * S'abonner à un événement
     */
    function subscribe(event, callback) {
        if (!events[event]) {
            events[event] = [];
        }
        events[event].push(callback);

        // Retourner fonction de désabonnement
        return function unsubscribe() {
            events[event] = events[event].filter(cb => cb !== callback);
        };
    }

    /**
     * Publier un événement
     */
    function publish(event, data) {
        if (!events[event]) {
            return;
        }

        events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} callback:`, error);
            }
        });
    }

    /**
     * Se désabonner d'un événement
     */
    function unsubscribe(event, callback) {
        if (!events[event]) {
            return;
        }
        events[event] = events[event].filter(cb => cb !== callback);
    }

    /**
     * Supprimer tous les abonnements d'un événement
     */
    function clear(event) {
        if (event) {
            delete events[event];
        } else {
            Object.keys(events).forEach(key => delete events[key]);
        }
    }

    // API publique
    return {
        subscribe,
        publish,
        unsubscribe,
        clear
    };
})();

// Liste des événements disponibles
const EVENTS = {
    // Projet
    PROJECT_CREATED: 'project:created',
    PROJECT_LOADED: 'project:loaded',
    PROJECT_UPDATED: 'project:updated',

    // Plans
    PLAN_UPLOADED: 'plan:uploaded',
    PLAN_LOADED: 'plan:loaded',
    PLAN_CHANGED: 'plan:changed',

    // Versions
    VERSION_CREATED: 'version:created',
    VERSION_CHANGED: 'version:changed',
    VERSION_DELETED: 'version:deleted',

    // Calibration
    CALIBRATION_STARTED: 'calibration:started',
    CALIBRATION_COMPLETED: 'calibration:completed',
    SCALE_CHANGED: 'scale:changed',

    // Outils
    TOOL_CHANGED: 'tool:changed',

    // Mesures
    MEASUREMENT_CREATED: 'measurement:created',
    MEASUREMENT_UPDATED: 'measurement:updated',
    MEASUREMENT_DELETED: 'measurement:deleted',
    MEASUREMENT_SELECTED: 'measurement:selected',

    // Calques
    LAYER_CREATED: 'layer:created',
    LAYER_CHANGED: 'layer:changed',
    LAYER_DELETED: 'layer:deleted',
    LAYER_VISIBILITY_CHANGED: 'layer:visibility',

    // Sauvegarde
    SAVE_REQUESTED: 'save:requested',
    SAVE_COMPLETED: 'save:completed',
    SAVE_ERROR: 'save:error',

    // Export
    EXPORT_STARTED: 'export:started',
    EXPORT_COMPLETED: 'export:completed',

    // UI
    UI_ERROR: 'ui:error',
    UI_SUCCESS: 'ui:success',
    UI_WARNING: 'ui:warning'
};
