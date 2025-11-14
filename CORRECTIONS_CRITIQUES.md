# ANALYSE CRITIQUE ET CORRECTIONS - Architecture Multi-Plans

## 🚨 PROBLÈMES IDENTIFIÉS

### **1. versioning.js - Incompatibilité structure plans[]**
**Fichier:** `js/modules/versioning.js:121-127`

**PROBLÈME:**
```javascript
// Ligne 121-127
await PDFLoader.loadPDFFromURL(version.file_path);
```
- Essaie de charger `version.file_path` directement
- Mais maintenant les versions ont `plans[]` au lieu de `file_path`
- Ne fonctionne PAS avec nouvelle architecture

**SOLUTION:**
- Déléguer à `PlanManager.loadPlans(projectId, versionId)`
- PlanManager chargera automatiquement le premier plan disponible

---

### **2. project-selector.js - Ouverture projet incompatible**
**Fichier:** `js/modules/project-selector.js:176-207`

**PROBLÈME:**
```javascript
// Ligne 176-178
if (currentVersion.file_path && typeof PDFLoader !== 'undefined') {
    await PDFLoader.loadPDFFromURL(currentVersion.file_path);
}

// Ligne 183-198
const measurements = measurementsData.measurements || measurementsData || [];
MeasurementTable.loadMeasurements(measurements);
```
- Charge `currentVersion.file_path` directement (ancienne structure)
- Charge `measurements` comme array unique (ancienne structure)
- Ne supporte PAS multi-plans

**SOLUTION:**
- Publier événement `VERSION_CHANGED` pour que PlanManager charge les plans
- PlanManager s'occupera de charger plans + mesures par plan

---

### **3. storage.js - Sauvegarde mesures incompatible**
**Fichier:** `js/modules/storage.js:152-159`

**PROBLÈME:**
```javascript
async function saveMeasurements(projectId, versionId, measurements) {
    const result = await apiRequest('/measurements.php', 'POST', {
        project_id: projectId,
        version_id: versionId,
        measurements: measurements  // ❌ Ancienne structure !
    });
}
```
- Sauvegarde `measurements` comme array unique
- Nouvelle structure = `measurements_by_plan: { plan_id: [...] }`
- Ne permet PAS de gérer mesures par plan

**SOLUTION:**
- Ajouter paramètre `planId`
- Charger measurements_by_plan existants
- Mettre à jour seulement le plan concerné
- Sauvegarder structure complète

---

### **4. auto-save.js - Sauvegarde incorrecte**
**Fichier:** `js/modules/auto-save.js:87-107`

**PROBLÈME:**
```javascript
async function save() {
    measurements = getMeasurementsFromTable();
    await StorageManager.saveMeasurements(currentProject.project_id, currentVersion, measurements);
}
```
- Sauvegarde TOUTES les mesures du tableau
- Ne sait PAS quel plan est actuellement affiché
- Mélange les mesures de plusieurs plans

**SOLUTION:**
- Obtenir plan courant via `PlanManager.getCurrentPlan()`
- Sauvegarder seulement les mesures du plan courant avec planId

---

### **5. app.js - Upload crée VERSION au lieu de PLAN**
**Fichier:** `js/app.js:196-222`

**PROBLÈME:**
```javascript
async function loadPDFFile(file) {
    const uploadResult = await StorageManager.uploadFile(file, currentProject.project_id, {
        file_type: 'pdf'
    });

    currentVersion = uploadResult.version_id;  // ❌ Crée VERSION !
}
```
- Upload crée une NOUVELLE VERSION à chaque fois
- Devrait créer un PLAN dans la version courante
- Workflow incorrect pour multi-plans

**SOLUTION:**
- Si aucune version: créer version puis plan
- Si version existe: ajouter plan via `PlanManager.addPlan()`
- Demander niveau (RDC, R+1, etc.) avant d'ajouter

---

### **6. Manque gestion "plan:changed" pour mesures**

**PROBLÈME:**
- Quand utilisateur change de plan via sélecteur
- Les mesures du plan précédent doivent être sauvegardées
- Les mesures du nouveau plan doivent être chargées
- Actuellement : mesures mélangées

**SOLUTION:**
- Auto-save doit sauvegarder avant changement de plan
- PlanManager charge déjà les mesures du nouveau plan ✅
- Mais table mesures doit être vidée avant chargement nouveau plan

---

## ✅ CORRECTIONS À APPLIQUER

### **Correction 1: versioning.js**
```javascript
async function loadVersion(versionId) {
    try {
        console.log('🔄 Chargement version:', versionId);

        const version = versions.find(v => v.version_id === versionId);
        if (!version) {
            console.error('❌ Version non trouvée:', versionId);
            alert('Version non trouvée');
            return;
        }

        if (!currentProjectId) {
            console.error('❌ Aucun projet ouvert');
            alert('❌ Erreur : Aucun projet ouvert');
            return;
        }

        console.log('✅ Version trouvée:', version);

        currentVersionId = versionId;

        // NOUVEAU: Publier événement pour que PlanManager charge les plans
        PubSub.publish(EVENTS.VERSION_CHANGED, {
            versionId,
            version
        });

        // PlanManager s'abonne à VERSION_CHANGED et charge automatiquement les plans
        // Pas besoin de charger PDF ou mesures ici!

        // Fermer modal
        document.getElementById('versions-modal').classList.remove('active');

        console.log('✅ Version changée, PlanManager va charger les plans');

    } catch (error) {
        console.error('❌ ERREUR CHARGEMENT VERSION:', error);
        alert(`❌ Erreur lors du chargement de la version:\n\n${error.message}`);
    }
}
```

### **Correction 2: project-selector.js**
```javascript
async function openProject(projectId) {
    try {
        console.log('Ouverture du projet:', projectId);

        // 1. Charger métadonnées projet
        const result = await StorageManager.loadProject(projectId);
        const project = result.project || result;

        PubSub.publish(EVENTS.PROJECT_LOADED, project);

        // 2. Charger versions
        const versionsResult = await StorageManager.apiRequest(`/versions.php?project_id=${projectId}`, 'GET');
        const versions = versionsResult.versions || [];

        console.log('Versions trouvées:', versions.length);

        if (typeof VersionManager !== 'undefined') {
            await VersionManager.loadVersions(projectId);
        }

        // 3. Trouver version actuelle
        let currentVersion = versions.find(v => v.is_current === 1 || v.is_current === '1');
        if (!currentVersion && versions.length > 0) {
            currentVersion = versions.sort((a, b) =>
                new Date(b.created_at || b.upload_date) - new Date(a.created_at || a.upload_date)
            )[0];
        }

        // 4. NOUVEAU: Publier VERSION_CHANGED pour que PlanManager charge les plans
        if (currentVersion) {
            console.log('Chargement de la version:', currentVersion.version_label);

            // PlanManager va s'occuper de charger plans + mesures
            PubSub.publish(EVENTS.VERSION_CHANGED, {
                versionId: currentVersion.version_id,
                version: currentVersion
            });

            showNotification(`✅ Projet "${project.project_name}" ouvert avec ${versions.length} version(s)`, 'success');
        } else {
            showNotification(`✅ Projet "${project.project_name}" ouvert (aucun plan)`, 'success');
        }

        // Fermer modale
        document.getElementById('open-project-modal').classList.remove('active');

    } catch (error) {
        console.error('Erreur ouverture projet:', error);
        alert(`Erreur lors de l'ouverture du projet:\n\n${error.message}`);
    }
}
```

### **Correction 3: storage.js - saveMeasurements**
```javascript
/**
 * Sauvegarder mesures d'un plan spécifique
 */
async function saveMeasurements(projectId, versionId, planId, measurements) {
    saveLocal(`measurements_${versionId}_${planId}`, measurements);

    try {
        // Charger measurements_by_plan existants
        let allMeasurements = { measurements_by_plan: {} };

        try {
            const existing = await apiRequest(`/measurements.php?project_id=${projectId}&version_id=${versionId}`, 'GET');
            if (existing && existing.measurements_by_plan) {
                allMeasurements = existing;
            }
        } catch (e) {
            // Pas de mesures existantes, OK
        }

        // Mettre à jour mesures du plan courant
        allMeasurements.measurements_by_plan[planId] = measurements;

        // Sauvegarder tout
        const result = await apiRequest('/measurements.php', 'POST', {
            project_id: projectId,
            version_id: versionId,
            measurements_by_plan: allMeasurements.measurements_by_plan
        });

        return result;
    } catch (error) {
        console.error('Error saving measurements:', error);
        throw error;
    }
}

/**
 * Charger mesures d'un plan spécifique
 */
async function loadMeasurements(projectId, versionId, planId = null) {
    try {
        const result = await apiRequest(`/measurements.php?project_id=${projectId}&version_id=${versionId}`, 'GET');
        saveLocal(`measurements_${versionId}`, result);

        // Si planId fourni, retourner seulement ce plan
        if (planId && result.measurements_by_plan) {
            return result.measurements_by_plan[planId] || [];
        }

        return result;
    } catch (error) {
        const localData = loadLocal(`measurements_${versionId}`);
        if (localData) {
            if (planId && localData.measurements_by_plan) {
                return localData.measurements_by_plan[planId] || [];
            }
            return localData;
        }
        throw error;
    }
}
```

### **Correction 4: auto-save.js**
```javascript
let currentPlanId = null;

// Ajouter subscription plan changed
PubSub.subscribe('plan:changed', (data) => {
    // Sauvegarder ancien plan avant de changer
    if (isDirty && currentPlanId) {
        console.log('💾 Auto-save avant changement de plan');
        saveNow();
    }

    currentPlanId = data.planId;
});

async function save() {
    if (!currentProject || !currentVersion || !currentPlanId) {
        console.warn('Auto-save: projet/version/plan non défini');
        return;
    }

    try {
        InfoPanel.updateSaveIndicator('saving');

        // Récupérer mesures du tableau
        measurements = getMeasurementsFromTable();

        console.log(`💾 Auto-save: ${measurements.length} mesure(s) pour plan ${currentPlanId}`);

        // Sauvegarder avec plan_id
        await StorageManager.saveMeasurements(
            currentProject.project_id,
            currentVersion,
            currentPlanId,  // NOUVEAU: plan_id
            measurements
        );

        isDirty = false;
        InfoPanel.updateSaveIndicator('saved');
        console.log('✅ Auto-save réussi');

    } catch (error) {
        console.error('❌ Auto-save échoué:', error);
        InfoPanel.updateSaveIndicator('error');
    }
}
```

### **Correction 5: app.js - Upload fichier**
```javascript
async function loadPDFFile(file) {
    try {
        if (!currentProject) {
            alert('Veuillez d\'abord créer un projet');
            showNewProjectModal();
            return;
        }

        // Masquer drop zone
        document.getElementById('drop-zone').classList.add('hidden');

        console.log('Upload PDF:', file.name);

        // Demander le niveau (modal simple)
        const floorLevel = prompt('Niveau du plan (ex: RDC, R+1, R+2):', 'RDC');
        if (!floorLevel) {
            document.getElementById('drop-zone').classList.remove('hidden');
            return;
        }

        const floorOrder = { 'Sous-sol': -1, 'RDC': 0, 'R+1': 1, 'R+2': 2, 'R+3': 3 }[floorLevel] || 0;

        // Si aucune version, créer version d'abord
        if (!currentVersion) {
            console.log('Création première version...');
            const versionResult = await StorageManager.apiRequest('/versions.php', 'POST', {
                project_id: currentProject.project_id,
                version_label: 'Version initiale'
            });
            currentVersion = versionResult.version.version_id;
        }

        // Ajouter plan via PlanManager
        if (typeof PlanManager !== 'undefined') {
            await PlanManager.addPlan(file, floorLevel, floorOrder);
        } else {
            throw new Error('PlanManager non disponible');
        }

    } catch (error) {
        console.error('Erreur chargement PDF:', error);
        alert('Erreur lors du chargement du PDF: ' + error.message);
        document.getElementById('drop-zone').classList.remove('hidden');
    }
}
```

---

## 📋 ORDRE D'APPLICATION DES CORRECTIONS

1. ✅ **storage.js** - Adapter saveMeasurements/loadMeasurements
2. ✅ **auto-save.js** - Sauvegarder par plan_id
3. ✅ **versioning.js** - Déléguer à PlanManager
4. ✅ **project-selector.js** - Déléguer à PlanManager
5. ✅ **app.js** - Utiliser PlanManager.addPlan()

---

## 🧪 TESTS À EFFECTUER APRÈS CORRECTIONS

1. **Test: Créer projet + uploader PDF**
   - Créer nouveau projet
   - Drag & drop PDF
   - Vérifier qu'il demande niveau
   - Vérifier plan créé dans version
   - Vérifier sélecteur plans affiche le plan

2. **Test: Ajouter 2ème plan**
   - Clic ➕ Ajouter plan
   - Sélectionner R+1, upload PDF
   - Vérifier 2 plans dans sélecteur
   - Vérifier switch entre plans fonctionne

3. **Test: Mesures par plan**
   - Ajouter mesure sur plan RDC
   - Changer vers plan R+1
   - Vérifier mesures RDC disparaissent
   - Ajouter mesure sur R+1
   - Revenir sur RDC
   - Vérifier mesures RDC réapparaissent

4. **Test: Auto-save par plan**
   - Ajouter mesure sur RDC
   - Attendre 30s
   - Vérifier auto-save déclenché
   - Changer vers R+1
   - Vérifier mesures RDC sauvegardées avant changement

5. **Test: Ouvrir projet existant**
   - Fermer
   - Rouvrir projet
   - Vérifier plans chargés
   - Vérifier mesures chargées par plan

6. **Test: Rétrocompatibilité**
   - Migrer ancien projet
   - Ouvrir
   - Vérifier plan RDC créé automatiquement
   - Vérifier mesures chargées
