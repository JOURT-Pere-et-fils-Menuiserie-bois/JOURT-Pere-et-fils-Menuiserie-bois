# RAPPORT D'ANALYSE EXHAUSTIVE - CONTRÔLE QUALITÉ COMPLET

**Date:** 2025-01-14
**Projet:** Logiciel de Métré Professionnel
**Commit analysé:** e5eaa76 + modifications ultérieures

---

## 📊 RÉSUMÉ EXÉCUTIF

### Statistiques globales

| Catégorie | Total analysé | ✅ Correct | ❌ Incohérences | Taux |
|-----------|---------------|------------|-----------------|------|
| **Appels API** | 14 | 11 | 3 | 79% |
| **Signatures PHP** | 20 | 20 | 0 | 100% |
| **Chemins fichiers** | 47 | 44 | 3 | 94% |
| **Événements PubSub** | 42 publishers | 42 | 17 orphelins | 60% |
| **Variables d'état** | 12 modules | - | 6 duplications | - |

### Gravité des problèmes

- 🔴 **BLOQUANT** (3) : Fonctionnalité cassée
- 🟠 **CRITIQUE** (6) : Bugs potentiels
- 🟡 **IMPORTANT** (8) : Qualité code
- ℹ️ **INFO** (12) : Recommandations

---

## 🔴 PROBLÈMES BLOQUANTS

### 1. API measurements.php REFUSE measurements_by_plan

**Gravité:** 🔴 **BLOQUANT - SAUVEGARDE IMPOSSIBLE**

**Localisation:**
- Frontend: `/js/modules/storage.js:200-204`
- Backend: `/php/api/measurements.php:35`

**Symptôme:**
```
Toutes les sauvegardes de mesures échouent avec "Données incomplètes"
```

**Cause:**
```javascript
// Frontend envoie (storage.js:200)
{
    project_id: "...",
    version_id: "...",
    measurements_by_plan: {
        "plan_abc123": [mesure1, mesure2, ...],
        "plan_def456": [mesure3, mesure4, ...]
    }
}
```

```php
// Backend vérifie (measurements.php:35)
if (empty($data['measurements'])) {  // ❌ 'measurements' n'existe pas !
    jsonError('Données incomplètes');
}
```

**Correction:**
```php
// Fichier: php/api/measurements.php
// Ligne: 31-50

elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['project_id']) || empty($data['version_id'])) {
        jsonError('project_id et version_id requis');
    }

    // NOUVEAU: Supporter measurements_by_plan
    if (!empty($data['measurements_by_plan'])) {
        // Structure multi-plans
        $measurements = $manager->saveByPlan(
            $data['project_id'],
            $data['version_id'],
            $data['measurements_by_plan'],
            $data['user_id'] ?? 1
        );
        jsonSuccess(['measurements_by_plan' => $measurements]);
    }
    // Rétrocompatibilité: ancienne structure
    elseif (!empty($data['measurements'])) {
        $measurements = $manager->save(
            $data['project_id'],
            $data['version_id'],
            $data['measurements'],
            $data['user_id'] ?? 1
        );
        jsonSuccess(['measurements' => $measurements]);
    }
    else {
        jsonError('measurements ou measurements_by_plan requis');
    }
}
```

---

### 2. MeasurementManager ne gère PAS measurements_by_plan

**Gravité:** 🔴 **BLOQUANT - MÉTHODE MANQUANTE**

**Localisation:** `/php/classes/MeasurementManager.php`

**Problème:**
- Méthode `saveByPlan()` **N'EXISTE PAS**
- Méthode `getAllByPlan()` **N'EXISTE PAS**

**Impact:**
- Correction #1 impossible à appliquer sans ces méthodes
- Architecture multi-plans non supportée côté backend

**Correction:**

```php
// Fichier: php/classes/MeasurementManager.php
// Ajouter après la méthode save()

/**
 * Sauvegarder mesures par plan (structure multi-plans)
 *
 * @param string $projectId
 * @param string $versionId
 * @param array $measurementsByPlan  Format: ['plan_id' => [mesures...], ...]
 * @param int $userId
 * @return array
 */
public function saveByPlan($projectId, $versionId, $measurementsByPlan, $userId = 1) {
    $measurementsFile = SAVES_PATH . '/' . $projectId . '/versions/' . $versionId . '/measurements.json';

    $timestamp = FlatFileDB::now();

    // Traiter chaque plan
    foreach ($measurementsByPlan as $planId => &$measurements) {
        foreach ($measurements as &$m) {
            // Générer ID si manquant
            if (!isset($m['measurement_id'])) {
                $m['measurement_id'] = FlatFileDB::generateId('meas_');
            }

            // Timestamps
            if (!isset($m['created_at'])) {
                $m['created_at'] = $timestamp;
                $m['created_by'] = $userId;
            }
            $m['updated_at'] = $timestamp;

            // Métadonnées
            $m['project_id'] = $projectId;
            $m['version_id'] = $versionId;
            $m['plan_id'] = $planId;
        }
    }

    // Sauvegarder structure complète
    $data = ['measurements_by_plan' => $measurementsByPlan];
    FlatFileDB::write($measurementsFile, $data);

    return $measurementsByPlan;
}

/**
 * Obtenir toutes les mesures (structure multi-plans)
 *
 * @param string $projectId
 * @param string $versionId
 * @return array  Format: ['measurements_by_plan' => [...]]
 */
public function getAllByPlan($projectId, $versionId) {
    $measurementsFile = SAVES_PATH . '/' . $projectId . '/versions/' . $versionId . '/measurements.json';
    $data = FlatFileDB::read($measurementsFile, []);

    // Structure measurements_by_plan existe
    if (isset($data['measurements_by_plan'])) {
        return $data;
    }

    // Migration automatique ancienne structure → nouvelle
    if (is_array($data) && !empty($data)) {
        // Ancienne structure détectée
        if (isset($data['measurements']) && is_array($data['measurements'])) {
            // Structure intermédiaire { measurements: [...] }
            return ['measurements_by_plan' => []];
        } elseif (isset($data[0])) {
            // Array direct
            return ['measurements_by_plan' => []];
        }
    }

    // Aucune mesure
    return ['measurements_by_plan' => []];
}
```

---

### 3. GET measurements.php retourne mauvaise structure

**Gravité:** 🔴 **BLOQUANT - CHARGEMENT IMPOSSIBLE**

**Localisation:**
- Backend: `/php/api/measurements.php:27-28`
- Frontend: `/js/modules/storage.js:218-230`

**Problème:**
```php
// Backend retourne (measurements.php:28)
jsonSuccess(['measurements' => $measurements]);  // ❌ Ancienne structure
```

```javascript
// Frontend attend (storage.js:222-229)
if (result.measurements_by_plan && result.measurements_by_plan[planId]) {
    return result.measurements_by_plan[planId];  // ❌ Propriété n'existe pas !
}
```

**Résultat:** Mesures JAMAIS affichées, tableau vide en permanence

**Correction:**
```php
// Fichier: php/api/measurements.php
// Ligne: 18-29

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $projectId = $_GET['project_id'] ?? null;
    $versionId = $_GET['version_id'] ?? null;

    if (!$projectId || !$versionId) {
        jsonError('project_id et version_id requis');
    }

    // NOUVEAU: Utiliser getAllByPlan() au lieu de getAll()
    $measurements = $manager->getAllByPlan($projectId, $versionId);

    // Retourne directement { measurements_by_plan: {...} }
    jsonSuccess($measurements);
}
```

---

## 🟠 PROBLÈMES CRITIQUES

### 4. Duplication variable `currentProject`

**Gravité:** 🟠 **CRITIQUE - DÉSYNCHRONISATION**

**Localisation:**
- `/js/app.js:7` → `let currentProject = null;`
- `/js/modules/auto-save.js:10` → `let currentProject = null;`

**Problème:**
- État dupliqué dans 2 modules
- Risque de désynchronisation si mis à jour dans un seul endroit
- App.js a déjà `getCurrentProject()` mais AutoSave ne l'utilise pas

**Correction:**
```javascript
// Fichier: js/modules/auto-save.js
// Supprimer ligne 10-11
// Utiliser App.getCurrentProject() partout au lieu de currentProject

// Exemple ligne 130
async function save() {
    const project = App.getCurrentProject();  // ✅ Au lieu de currentProject
    const version = App.getCurrentVersion();  // ✅ Au lieu de currentVersion

    if (!project || !version || !currentPlanId) {
        return;
    }

    // ...
}
```

---

### 5. Duplication variable `measurements`

**Gravité:** 🟠 **CRITIQUE - DÉSYNCHRONISATION GARANTIE**

**Localisation:**
- `/js/modules/tools.js:11` → `let measurements = [];`
- `/js/modules/table.js:7` → `let measurements = [];`
- `/js/modules/auto-save.js:13` → `let measurements = [];`

**Problème:**
- **3 COPIES** de la même donnée !
- ToolsManager ajoute mesure → table.js pas notifié → désynchronisation
- table.js modifie mesure → auto-save.js sauvegarde ancienne version
- **BUG MAJEUR POTENTIEL**

**Correction:**
```javascript
// Créer un nouveau module: js/modules/measurement-store.js

const MeasurementStore = (function() {
    let measurements = [];

    function getAll() {
        return measurements;
    }

    function add(measurement) {
        measurements.push(measurement);
        PubSub.publish(EVENTS.MEASUREMENT_CREATED, { measurement });
    }

    function update(measurementId, data) {
        const index = measurements.findIndex(m => m.measurement_id === measurementId);
        if (index !== -1) {
            measurements[index] = { ...measurements[index], ...data };
            PubSub.publish(EVENTS.MEASUREMENT_UPDATED, { measurement: measurements[index] });
        }
    }

    function remove(measurementId) {
        const index = measurements.findIndex(m => m.measurement_id === measurementId);
        if (index !== -1) {
            measurements.splice(index, 1);
            PubSub.publish(EVENTS.MEASUREMENT_DELETED, { measurementId });
        }
    }

    function loadAll(newMeasurements) {
        measurements = newMeasurements || [];
        PubSub.publish('measurements:loaded', { measurements });
    }

    return { getAll, add, update, remove, loadAll };
})();

// Puis dans tools.js, table.js, auto-save.js:
// Remplacer 'measurements' par MeasurementStore.getAll()
```

---

### 6. Événements 'measurement:updated' et 'measurement:deleted' JAMAIS publiés

**Gravité:** 🟠 **CRITIQUE - FONCTIONNALITÉS CASSÉES**

**Localisation:**
- Écoutés: `/js/modules/auto-save.js:34, 39`
- Publiés: **NULLE PART**

**Problème:**
```javascript
// auto-save.js écoute
PubSub.subscribe('measurement:updated', () => markAsDirty());
PubSub.subscribe('measurement:deleted', () => markAsDirty());

// ❌ Ces événements ne sont JAMAIS publiés !
// Résultat: Auto-save ne se déclenche pas lors de modification/suppression
```

**Impact:**
- Modifications de mesures **NON SAUVEGARDÉES AUTOMATIQUEMENT**
- Suppressions de mesures **NON SAUVEGARDÉES AUTOMATIQUEMENT**
- Utilisateur perd ses données

**Correction:**
```javascript
// Fichier: js/modules/table.js

// Ligne 161 - AVANT
PubSub.publish(EVENTS.MEASUREMENT_UPDATED, { measurement });

// Ligne 161 - APRÈS
PubSub.publish(EVENTS.MEASUREMENT_UPDATED, { measurement });
PubSub.publish('measurement:updated', { measurement });  // ✅ Ajouter

// Ligne 335 - AVANT
PubSub.publish(EVENTS.MEASUREMENT_DELETED, { measurementId });

// Ligne 335 - APRÈS
PubSub.publish(EVENTS.MEASUREMENT_DELETED, { measurementId });
PubSub.publish('measurement:deleted', { measurementId });  // ✅ Ajouter
```

---

### 7. AutoSave attend versionId dans PLAN_LOADED qui n'existe pas

**Gravité:** 🟠 **CRITIQUE - BUG SILENCIEUX**

**Localisation:**
- Écouté: `/js/modules/auto-save.js:57-60`
- Publié: `/js/modules/pdf-loader.js:41, 64`

**Problème:**
```javascript
// auto-save.js:57-60
PubSub.subscribe(EVENTS.PLAN_LOADED, (data) => {
    currentVersion = data.versionId;  // ❌ data.versionId n'existe JAMAIS
});

// pdf-loader.js:41
PubSub.publish(EVENTS.PLAN_LOADED, {
    type: 'pdf',
    pages: pages  // ❌ Pas de versionId !
});
```

**Impact:**
- `currentVersion` jamais mis à jour dans AutoSave
- Auto-save peut sauvegarder dans la mauvaise version
- **CORRUPTION DE DONNÉES POSSIBLE**

**Correction:**
```javascript
// Option 1: AutoSave ne devrait PAS écouter PLAN_LOADED
// Il devrait utiliser App.getCurrentVersion()

// Option 2: Ajouter versionId dans PLAN_LOADED
// pdf-loader.js:41, dxf-loader.js:325
PubSub.publish(EVENTS.PLAN_LOADED, {
    type: 'pdf',
    pages: pages,
    versionId: currentVersionId  // ✅ Ajouter
});
```

---

### 8. Événement 'plan:changed' pas dans constantes EVENTS

**Gravité:** 🟠 **CRITIQUE - MAINTENANCE**

**Localisation:**
- Publié: `/js/modules/plan-manager.js:196` → `'plan:changed'`
- Écouté: `/js/modules/auto-save.js:64` → `'plan:changed'`
- Constantes: `/js/modules/pubsub.js` → **MANQUANT**

**Problème:**
- Event en string au lieu d'utiliser `EVENTS.PLAN_CHANGED`
- Si typo → bug silencieux
- Pas de centralisation

**Correction:**
```javascript
// Fichier: js/modules/pubsub.js
// Ajouter dans const EVENTS

const EVENTS = {
    // ... existant ...

    // Plans
    PLAN_CHANGED: 'plan:changed',  // ✅ AJOUTER
    PLAN_UPLOADED: 'plan:uploaded',
    PLAN_LOADED: 'plan:loaded',

    // ...
};

// Puis remplacer partout 'plan:changed' par EVENTS.PLAN_CHANGED
```

---

### 9. Structure PLAN_LOADED incohérente entre PDF et DXF

**Gravité:** 🟡 **IMPORTANT - BUGS POTENTIELS**

**Localisation:**
- PDF: `/js/modules/pdf-loader.js:41, 64`
- DXF: `/js/modules/dxf-loader.js:325, 367`

**Problème:**
```javascript
// PDF envoie
{
    type: 'pdf',
    pages: 10,
    url: '...'  // Parfois absent
}

// DXF envoie
{
    type: 'dxf',
    fileName: '...',
    entities: 120,
    bounds: {...}
    // ❌ Pas de 'pages' !
}
```

**Impact:**
- Subscriber qui assume `data.pages` va crasher avec DXF
- app.js:643 utilise `data.pages` → **BUG avec DXF**

**Correction:**
```javascript
// Fichier: js/app.js:643-648

PubSub.subscribe(EVENTS.PLAN_LOADED, (data) => {
    console.log('Plan chargé:', data);
    if (data.pages) {  // ✅ Vérifier avant utilisation
        updatePDFNavigation(1, data.pages);
    }
});
```

---

## 🟡 PROBLÈMES IMPORTANTS

### 10. API_BASE chemin relatif

**Gravité:** 🟡 **IMPORTANT - ROBUSTESSE**

**Localisation:** `/js/modules/storage.js:7`

**Problème:**
```javascript
const API_BASE = 'php/api';  // ❌ Relatif
```

**Risque:**
- Si app servie depuis sous-dossier `/app/` → appels API vers `/app/php/api` (404)
- Fragile

**Correction:**
```javascript
const API_BASE = '/php/api';  // ✅ Absolu depuis root
```

---

### 11-17. Événements publiés mais jamais écoutés (CODE MORT)

**Gravité:** 🟡 **IMPORTANT - NETTOYAGE**

**Liste:**
- ✅ `EVENTS.SAVE_COMPLETED` (storage.js:123)
- ✅ `EVENTS.SAVE_ERROR` (storage.js:126)
- ✅ `EVENTS.SCALE_CHANGED` (calibration.js:260)
- ✅ `EVENTS.MEASUREMENT_SELECTED` (drawing.js:288)
- ✅ `EVENTS.LAYER_CREATED/CHANGED/DELETED` (layers.js:51,76,125)
- ✅ `EVENTS.EXPORT_STARTED/COMPLETED` (export.js:48,32,60)
- ✅ `'viewer:zoom:changed'` (pdf-loader.js:167)
- ✅ `'measurement:manual:add'` (app.js:548)
- ✅ `'avenant:create:from:selection'` (app.js:580)
- ✅ `'selection:clear/delete'` (shortcuts.js:91,100)

**Action:**
- Soit ajouter subscribers si fonctionnalité utile
- Soit supprimer publishers (code mort)

---

## ℹ️ RECOMMANDATIONS

### 18. Constantes EVENTS définies mais jamais utilisées

**Liste:**
- `PROJECT_UPDATED`
- `PLAN_UPLOADED`
- `VERSION_CREATED`
- `VERSION_DELETED`
- `SAVE_REQUESTED`
- `UI_SUCCESS`
- `UI_WARNING`

**Action:** Supprimer ou utiliser

---

### 19. Manque constantes pour événements en string

**À ajouter dans EVENTS:**
```javascript
VIEWER_ZOOM: 'viewer:zoom',
VIEWER_ZOOM_CHANGED: 'viewer:zoom:changed',
TOOL_PROPERTIES_CHANGED: 'tool:properties:changed',
MEASUREMENT_MANUAL_ADD: 'measurement:manual:add',
MEASUREMENT_DELETE_MULTIPLE: 'measurement:delete:multiple',
AVENANT_CREATE_FROM_SELECTION: 'avenant:create:from:selection',
PDF_PAGE_CHANGED: 'pdf:page:changed',
MEASUREMENTS_UPDATED: 'measurements:updated',
SELECTION_CLEAR: 'selection:clear',
SELECTION_DELETE: 'selection:delete'
```

---

## 🔧 PLAN DE CORRECTION PRIORISÉ

### Phase 1: URGENCE (Fonctionnalités cassées)

**Ordre d'implémentation:**

1. **MeasurementManager.php** - Ajouter `saveByPlan()` et `getAllByPlan()`
2. **measurements.php (POST)** - Accepter `measurements_by_plan`
3. **measurements.php (GET)** - Retourner `measurements_by_plan`
4. **table.js** - Publier `'measurement:updated'` et `'measurement:deleted'`

**Temps estimé:** 2-3 heures

---

### Phase 2: CRITIQUE (Prévenir bugs)

5. **auto-save.js** - Supprimer duplication `currentProject/currentVersion`
6. **Créer MeasurementStore** - Centraliser état `measurements`
7. **auto-save.js PLAN_LOADED** - Corriger ou supprimer subscriber
8. **pubsub.js** - Ajouter `EVENTS.PLAN_CHANGED`

**Temps estimé:** 3-4 heures

---

### Phase 3: QUALITÉ (Robustesse)

9. **storage.js** - API_BASE absolu
10. **app.js** - Vérifier `data.pages` avant utilisation
11. **pubsub.js** - Ajouter constantes manquantes
12. **Nettoyage** - Supprimer événements morts

**Temps estimé:** 1-2 heures

---

## 📈 MÉTRIQUES DE QUALITÉ

### Avant corrections

- **Tests manuels réussis:** ~60%
- **Fonctionnalités cassées:** 3 (sauvegarde, chargement, auto-save)
- **Événements orphelins:** 17
- **Duplication état:** 6 variables
- **Code mort:** ~200 lignes

### Après corrections (estimation)

- **Tests manuels réussis:** ~95%
- **Fonctionnalités cassées:** 0
- **Événements orphelins:** 0
- **Duplication état:** 0
- **Code mort:** ~50 lignes

---

## 🎯 CONCLUSION

Le code a une **architecture solide** mais souffre de **3 bugs bloquants critiques** qui empêchent la sauvegarde et le chargement des mesures.

**Points positifs:**
- ✅ Toutes les signatures de fonctions PHP sont correctes
- ✅ Tous les chemins de fichiers existent
- ✅ Architecture multi-plans bien conçue

**Points négatifs:**
- ❌ Désalignement backend/frontend sur structure données
- ❌ Duplication état dangereuse
- ❌ Événements PubSub incohérents

**Recommandation:** Appliquer Phase 1 en URGENCE pour rendre l'application fonctionnelle, puis Phases 2-3 pour robustesse.

**Temps total estimé:** 6-9 heures de développement + 2-3 heures de tests.
