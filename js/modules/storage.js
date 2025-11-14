/**
 * Storage Manager
 * Gère la sauvegarde locale et serveur
 */

const StorageManager = (function() {
    const API_BASE = 'php/api';

    /**
     * Sauvegarder en localStorage
     */
    function saveLocal(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Local storage error:', error);
            return false;
        }
    }

    /**
     * Charger depuis localStorage
     */
    function loadLocal(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Local storage error:', error);
            return null;
        }
    }

    /**
     * Supprimer de localStorage
     */
    function removeLocal(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Local storage error:', error);
            return false;
        }
    }

    /**
     * Effectuer une requête API
     */
    async function apiRequest(endpoint, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, options);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Upload de fichier
     */
    async function uploadFile(file, projectId, metadata = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId);
        formData.append('metadata', JSON.stringify(metadata));

        try {
            const response = await fetch(`${API_BASE}/upload.php`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                // Essayer de lire le message d'erreur du serveur
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                console.error('Upload error details:', errorMessage);
                throw new Error(`Upload error: ${errorMessage}`);
            }

            return await response.json();
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }

    /**
     * Sauvegarder projet
     */
    async function saveProject(projectData) {
        // Sauvegarde locale d'abord
        saveLocal(`project_${projectData.project_id}`, projectData);

        // Puis serveur
        try {
            const result = await apiRequest('/projects.php', 'PUT', projectData);
            PubSub.publish(EVENTS.SAVE_COMPLETED, { type: 'project', data: result });
            return result;
        } catch (error) {
            PubSub.publish(EVENTS.SAVE_ERROR, { type: 'project', error: error.message });
            throw error;
        }
    }

    /**
     * Charger projet
     */
    async function loadProject(projectId) {
        try {
            const result = await apiRequest(`/projects.php?id=${projectId}`, 'GET');
            saveLocal(`project_${projectId}`, result);
            return result;
        } catch (error) {
            // Fallback sur local si serveur non disponible
            const localData = loadLocal(`project_${projectId}`);
            if (localData) {
                return localData;
            }
            throw error;
        }
    }

    /**
     * Sauvegarder mesures
     */
    async function saveMeasurements(projectId, versionId, measurements) {
        saveLocal(`measurements_${versionId}`, measurements);

        try {
            const result = await apiRequest('/measurements.php', 'POST', {
                project_id: projectId,
                version_id: versionId,
                measurements: measurements
            });
            return result;
        } catch (error) {
            console.error('Error saving measurements:', error);
            throw error;
        }
    }

    /**
     * Charger mesures
     */
    async function loadMeasurements(projectId, versionId) {
        try {
            const result = await apiRequest(`/measurements.php?project_id=${projectId}&version_id=${versionId}`, 'GET');
            saveLocal(`measurements_${versionId}`, result);
            return result;
        } catch (error) {
            const localData = loadLocal(`measurements_${versionId}`);
            if (localData) {
                return localData;
            }
            throw error;
        }
    }

    // API publique
    return {
        saveLocal,
        loadLocal,
        removeLocal,
        apiRequest,
        uploadFile,
        saveProject,
        loadProject,
        saveMeasurements,
        loadMeasurements
    };
})();
