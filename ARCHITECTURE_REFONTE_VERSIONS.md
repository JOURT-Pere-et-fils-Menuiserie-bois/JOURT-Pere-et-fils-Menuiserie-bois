# REFONTE COMPLÈTE : ARCHITECTURE MULTI-PLANS PAR VERSION

## 🚨 PROBLÈME ACTUEL IDENTIFIÉ

### Erreur: "Erreur lors du chargement de la version"

**Localisation:** `js/modules/versioning.js` ligne 141-144

```javascript
} catch (error) {
    console.error('Erreur chargement version:', error);
    alert('Erreur lors du chargement de la version');
}
```

**Causes possibles:**
1. `PDFLoader.loadPDFFromURL()` échoue si le fichier PDF n'existe pas sur le serveur
2. `StorageManager.loadMeasurements()` retourne 400 si project_id/version_id invalides
3. `MeasurementTable.loadMeasurements()` ou `DrawingManager.drawMeasurement()` non définis
4. Erreur réseau ou timeout API

**Solution immédiate:** Ajouter logs détaillés pour identifier l'étape exacte qui échoue.

---

## 🎯 PROBLÈME ARCHITECTURAL FONDAMENTAL

### Architecture actuelle (LIMITÉE):
```
Projet
  ├── Version v001
  │     ├── un seul fichier PDF
  │     └── measurements.json
  ├── Version v002
  │     ├── un seul fichier PDF
  │     └── measurements.json
```

**LIMITATIONS:**
- ❌ **1 version = 1 PDF uniquement**
- ❌ **Impossible d'avoir plusieurs niveaux (RDC, R+1, R+2) dans une version**
- ❌ **Pas de workflow de remplacement de plans**
- ❌ **Pas de backup automatique lors du remplacement**
- ❌ **Impossible de gérer des projets de bâtiment multi-étages**

### Architecture REQUISE (RÉELLE):
```
Projet: "Immeuble 15 rue Victor Hugo"
  ├── Version v001 "Plans initiaux"
  │     ├── Plan: RDC (Rez-de-chaussée)
  │     │     ├── rdc_plan.pdf
  │     │     └── measurements_rdc.json
  │     ├── Plan: R+1 (1er étage)
  │     │     ├── r1_plan.pdf
  │     │     └── measurements_r1.json
  │     ├── Plan: R+2 (2ème étage)
  │     │     ├── r2_plan.pdf
  │     │     └── measurements_r2.json
  │     └── Plan: Combles
  │           ├── combles_plan.pdf
  │           └── measurements_combles.json
  │
  ├── Version v002 "Modification cuisine RDC"
  │     ├── Plan: RDC (NOUVEAU - remplace v001)
  │     │     ├── rdc_plan_v2.pdf
  │     │     └── measurements_rdc.json
  │     ├── Plan: R+1 (COPIÉ depuis v001)
  │     │     ├── r1_plan.pdf (lien vers v001)
  │     │     └── measurements_r1.json
  │     ├── Plan: R+2 (COPIÉ depuis v001)
  │     │     ├── r2_plan.pdf (lien vers v001)
  │     │     └── measurements_r2.json
  │     └── Plan: Combles (COPIÉ depuis v001)
  │           ├── combles_plan.pdf (lien vers v001)
  │           └── measurements_combles.json
```

---

## 📐 NOUVELLE ARCHITECTURE PROPOSÉE

### 1. STRUCTURE DE DONNÉES

#### 1.1 Fichier `saves/{project_id}/versions/versions.json`

```json
{
  "versions": [
    {
      "version_id": "v001",
      "version_number": 1,
      "version_label": "Plans initiaux",
      "description": "Plans d'origine fournis par l'architecte",
      "created_at": "2025-01-15T10:30:00",
      "created_by": "user_001",
      "is_current": true,
      "status": "published",
      "plans": [
        {
          "plan_id": "plan_001",
          "floor_level": "RDC",
          "floor_order": 0,
          "file_path": "saves/projet_xxx/uploads/hash_abc/rdc_plan.pdf",
          "file_name": "rdc_plan.pdf",
          "file_hash": "sha256_abc...",
          "file_size": 2048576,
          "mime_type": "application/pdf",
          "uploaded_at": "2025-01-15T10:30:00",
          "is_modified": false,
          "source_version_id": null,
          "source_plan_id": null
        },
        {
          "plan_id": "plan_002",
          "floor_level": "R+1",
          "floor_order": 1,
          "file_path": "saves/projet_xxx/uploads/hash_def/r1_plan.pdf",
          "file_name": "r1_plan.pdf",
          "file_hash": "sha256_def...",
          "file_size": 1987654,
          "mime_type": "application/pdf",
          "uploaded_at": "2025-01-15T10:32:00",
          "is_modified": false,
          "source_version_id": null,
          "source_plan_id": null
        },
        {
          "plan_id": "plan_003",
          "floor_level": "R+2",
          "floor_order": 2,
          "file_path": "saves/projet_xxx/uploads/hash_ghi/r2_plan.pdf",
          "file_name": "r2_plan.pdf",
          "file_hash": "sha256_ghi...",
          "file_size": 1876543,
          "mime_type": "application/pdf",
          "uploaded_at": "2025-01-15T10:35:00",
          "is_modified": false,
          "source_version_id": null,
          "source_plan_id": null
        }
      ]
    },
    {
      "version_id": "v002",
      "version_number": 2,
      "version_label": "Modification cuisine RDC",
      "description": "Nouvelle cuisine + extension 5m²",
      "created_at": "2025-02-10T14:20:00",
      "created_by": "user_001",
      "is_current": false,
      "status": "draft",
      "parent_version_id": "v001",
      "plans": [
        {
          "plan_id": "plan_004",
          "floor_level": "RDC",
          "floor_order": 0,
          "file_path": "saves/projet_xxx/uploads/hash_jkl/rdc_plan_v2.pdf",
          "file_name": "rdc_plan_v2.pdf",
          "file_hash": "sha256_jkl...",
          "file_size": 2156789,
          "mime_type": "application/pdf",
          "uploaded_at": "2025-02-10T14:20:00",
          "is_modified": true,
          "source_version_id": "v001",
          "source_plan_id": "plan_001",
          "change_description": "Plan RDC modifié: nouvelle cuisine"
        },
        {
          "plan_id": "plan_002",
          "floor_level": "R+1",
          "floor_order": 1,
          "file_path": "saves/projet_xxx/uploads/hash_def/r1_plan.pdf",
          "file_name": "r1_plan.pdf",
          "file_hash": "sha256_def...",
          "file_size": 1987654,
          "mime_type": "application/pdf",
          "uploaded_at": "2025-01-15T10:32:00",
          "is_modified": false,
          "source_version_id": "v001",
          "source_plan_id": "plan_002",
          "inherited_from": "v001"
        },
        {
          "plan_id": "plan_003",
          "floor_level": "R+2",
          "floor_order": 2,
          "file_path": "saves/projet_xxx/uploads/hash_ghi/r2_plan.pdf",
          "file_name": "r2_plan.pdf",
          "file_hash": "sha256_ghi...",
          "file_size": 1876543,
          "mime_type": "application/pdf",
          "uploaded_at": "2025-01-15T10:35:00",
          "is_modified": false,
          "source_version_id": "v001",
          "source_plan_id": "plan_003",
          "inherited_from": "v001"
        }
      ]
    }
  ]
}
```

#### 1.2 Fichier `saves/{project_id}/versions/{version_id}/measurements.json`

**STRUCTURE MODIFIÉE:**

```json
{
  "measurements_by_plan": {
    "plan_001": [
      {
        "measurement_id": "meas_001",
        "type": "line",
        "code": "LIN001",
        "description": "Mur porteur nord",
        "geometry": {...},
        "quantity": 12.5,
        "unit": "m",
        "unit_price": 150.00,
        "total": 1875.00
      }
    ],
    "plan_002": [
      {
        "measurement_id": "meas_002",
        "type": "rectangle",
        "code": "SURF001",
        "description": "Carrelage chambre 1",
        "geometry": {...},
        "quantity": 18.5,
        "unit": "m²",
        "unit_price": 45.00,
        "total": 832.50
      }
    ],
    "plan_003": [...]
  }
}
```

**AVANTAGE:** Mesures organisées par plan, pas mélangées.

---

### 2. API PHP - NOUVELLES ROUTES

#### 2.1 `php/api/plans.php` (NOUVEAU)

```php
<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/PlanManager.php';

$manager = new PlanManager();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // GET /plans.php?project_id=xxx&version_id=v001
        // Retourne tous les plans d'une version
        $projectId = $_GET['project_id'] ?? null;
        $versionId = $_GET['version_id'] ?? null;

        if (!$projectId || !$versionId) {
            jsonError('project_id et version_id requis');
        }

        $plans = $manager->getAllByVersion($projectId, $versionId);
        jsonSuccess(['plans' => $plans]);
        break;

    case 'POST':
        // POST /plans.php
        // Body: { project_id, version_id, floor_level, file, metadata }
        // Upload un nouveau plan pour un niveau spécifique
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['project_id'], $data['version_id'], $data['floor_level'])) {
            jsonError('project_id, version_id et floor_level requis');
        }

        $plan = $manager->create($data);
        jsonSuccess(['plan' => $plan], 'Plan ajouté avec succès');
        break;

    case 'PUT':
        // PUT /plans.php
        // Body: { project_id, version_id, plan_id, floor_level, file }
        // Remplace un plan existant (avec backup automatique)
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['project_id'], $data['version_id'], $data['plan_id'])) {
            jsonError('project_id, version_id et plan_id requis');
        }

        $result = $manager->replace($data);
        jsonSuccess(['plan' => $result['plan'], 'backup' => $result['backup']], 'Plan remplacé avec succès');
        break;

    case 'DELETE':
        // DELETE /plans.php?project_id=xxx&version_id=v001&plan_id=plan_001
        $projectId = $_GET['project_id'] ?? null;
        $versionId = $_GET['version_id'] ?? null;
        $planId = $_GET['plan_id'] ?? null;

        if (!$projectId || !$versionId || !$planId) {
            jsonError('project_id, version_id et plan_id requis');
        }

        $manager->delete($projectId, $versionId, $planId);
        jsonSuccess([], 'Plan supprimé');
        break;
}
```

#### 2.2 `php/api/versions.php` (MODIFIÉ)

**NOUVELLES ROUTES:**

```php
// POST /versions.php?action=create_from_previous
// Body: {
//   project_id: "xxx",
//   parent_version_id: "v001",
//   version_label: "Modification cuisine",
//   description: "...",
//   plans_to_replace: ["RDC"],  // Niveaux à remplacer
//   plans_to_keep: ["R+1", "R+2", "Combles"]  // Niveaux à copier
// }
//
// EFFET: Crée v002 en:
//   1. Copiant les plans de plans_to_keep depuis v001
//   2. Laissant plans_to_replace vides (à uploader après)
```

---

### 3. CLASSES PHP - NOUVELLES

#### 3.1 `php/classes/PlanManager.php` (NOUVEAU)

```php
<?php

class PlanManager {
    private $basePath;

    public function __construct() {
        $this->basePath = SAVES_PATH;
    }

    /**
     * Récupérer tous les plans d'une version
     */
    public function getAllByVersion($projectId, $versionId) {
        $versionsFile = $this->basePath . "/{$projectId}/versions/versions.json";

        if (!file_exists($versionsFile)) {
            return [];
        }

        $data = json_decode(file_get_contents($versionsFile), true);
        $version = $this->findVersion($data['versions'], $versionId);

        return $version ? $version['plans'] : [];
    }

    /**
     * Ajouter un plan à une version
     */
    public function create($data) {
        $projectId = $data['project_id'];
        $versionId = $data['version_id'];
        $floorLevel = $data['floor_level'];

        // Générer plan_id
        $planId = 'plan_' . substr(md5(uniqid()), 0, 8);

        $plan = [
            'plan_id' => $planId,
            'floor_level' => $floorLevel,
            'floor_order' => $data['floor_order'] ?? 0,
            'file_path' => $data['file_path'],
            'file_name' => $data['file_name'],
            'file_hash' => $data['file_hash'] ?? null,
            'file_size' => $data['file_size'],
            'mime_type' => $data['mime_type'],
            'uploaded_at' => date('Y-m-d\TH:i:s'),
            'is_modified' => false,
            'source_version_id' => null,
            'source_plan_id' => null
        ];

        // Ajouter le plan dans versions.json
        $versionsFile = $this->basePath . "/{$projectId}/versions/versions.json";
        $data = json_decode(file_get_contents($versionsFile), true);

        foreach ($data['versions'] as &$version) {
            if ($version['version_id'] === $versionId) {
                $version['plans'][] = $plan;
                break;
            }
        }

        file_put_contents($versionsFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return $plan;
    }

    /**
     * Remplacer un plan (avec backup automatique)
     */
    public function replace($data) {
        $projectId = $data['project_id'];
        $versionId = $data['version_id'];
        $planId = $data['plan_id'];

        // 1. Récupérer le plan actuel
        $versionsFile = $this->basePath . "/{$projectId}/versions/versions.json";
        $versionsData = json_decode(file_get_contents($versionsFile), true);

        $oldPlan = null;
        $versionIndex = null;
        $planIndex = null;

        foreach ($versionsData['versions'] as $vIdx => &$version) {
            if ($version['version_id'] === $versionId) {
                foreach ($version['plans'] as $pIdx => &$plan) {
                    if ($plan['plan_id'] === $planId) {
                        $oldPlan = $plan;
                        $versionIndex = $vIdx;
                        $planIndex = $pIdx;
                        break 2;
                    }
                }
            }
        }

        if (!$oldPlan) {
            throw new Exception("Plan non trouvé");
        }

        // 2. BACKUP du plan actuel
        $backupDir = $this->basePath . "/{$projectId}/backups/{$versionId}";
        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $timestamp = date('YmdHis');
        $backupFileName = pathinfo($oldPlan['file_name'], PATHINFO_FILENAME) .
                          "_backup_{$timestamp}." .
                          pathinfo($oldPlan['file_name'], PATHINFO_EXTENSION);

        $backupPath = $backupDir . '/' . $backupFileName;

        // Copier l'ancien fichier vers backup
        if (file_exists($oldPlan['file_path'])) {
            copy($oldPlan['file_path'], $backupPath);
        }

        // Backup des mesures aussi
        $oldMeasurementsFile = $this->basePath . "/{$projectId}/versions/{$versionId}/measurements.json";
        if (file_exists($oldMeasurementsFile)) {
            $measData = json_decode(file_get_contents($oldMeasurementsFile), true);
            $oldMeasurements = $measData['measurements_by_plan'][$planId] ?? [];

            $backupMeasFile = $backupDir . "/measurements_{$planId}_{$timestamp}.json";
            file_put_contents($backupMeasFile, json_encode($oldMeasurements, JSON_PRETTY_PRINT));
        }

        // 3. Remplacer le plan
        $newPlan = [
            'plan_id' => $planId,  // Garder le même ID
            'floor_level' => $oldPlan['floor_level'],
            'floor_order' => $oldPlan['floor_order'],
            'file_path' => $data['new_file_path'],
            'file_name' => $data['new_file_name'],
            'file_hash' => $data['new_file_hash'] ?? null,
            'file_size' => $data['new_file_size'],
            'mime_type' => $data['mime_type'],
            'uploaded_at' => date('Y-m-d\TH:i:s'),
            'is_modified' => true,
            'source_version_id' => $versionId,
            'source_plan_id' => $planId,
            'replaced_at' => date('Y-m-d\TH:i:s'),
            'backup_path' => $backupPath
        ];

        $versionsData['versions'][$versionIndex]['plans'][$planIndex] = $newPlan;

        file_put_contents($versionsFile, json_encode($versionsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return [
            'plan' => $newPlan,
            'backup' => [
                'file_path' => $backupPath,
                'measurements_path' => $backupMeasFile ?? null
            ]
        ];
    }

    /**
     * Supprimer un plan
     */
    public function delete($projectId, $versionId, $planId) {
        $versionsFile = $this->basePath . "/{$projectId}/versions/versions.json";
        $data = json_decode(file_get_contents($versionsFile), true);

        foreach ($data['versions'] as &$version) {
            if ($version['version_id'] === $versionId) {
                $version['plans'] = array_filter($version['plans'], function($p) use ($planId) {
                    return $p['plan_id'] !== $planId;
                });
                $version['plans'] = array_values($version['plans']); // Réindexer
                break;
            }
        }

        file_put_contents($versionsFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    private function findVersion($versions, $versionId) {
        foreach ($versions as $v) {
            if ($v['version_id'] === $versionId) {
                return $v;
            }
        }
        return null;
    }
}
```

---

### 4. JAVASCRIPT - NOUVEAU MODULE

#### 4.1 `js/modules/plan-manager.js` (NOUVEAU)

```javascript
/**
 * Plan Manager
 * Gère les plans multiples par version
 */

const PlanManager = (function() {
    let currentPlans = [];  // Plans de la version courante
    let currentPlanId = null;  // Plan actuellement affiché

    /**
     * Charger tous les plans d'une version
     */
    async function loadPlans(projectId, versionId) {
        try {
            const result = await StorageManager.apiRequest(
                `/plans.php?project_id=${projectId}&version_id=${versionId}`,
                'GET'
            );

            currentPlans = result.plans || [];

            // Trier par floor_order
            currentPlans.sort((a, b) => a.floor_order - b.floor_order);

            renderPlansList();

            // Charger le premier plan par défaut
            if (currentPlans.length > 0) {
                await loadPlan(currentPlans[0].plan_id);
            }

            return currentPlans;

        } catch (error) {
            console.error('Erreur chargement plans:', error);
            throw error;
        }
    }

    /**
     * Charger un plan spécifique
     */
    async function loadPlan(planId) {
        const plan = currentPlans.find(p => p.plan_id === planId);
        if (!plan) {
            throw new Error('Plan non trouvé');
        }

        try {
            // Charger le PDF
            await PDFLoader.loadPDFFromURL(plan.file_path);

            // Charger les mesures de ce plan
            const projectId = App.getCurrentProject().project_id;
            const versionId = VersionManager.getCurrentVersion().version_id;

            const measData = await StorageManager.loadMeasurements(projectId, versionId);
            const planMeasurements = measData.measurements_by_plan?.[planId] || [];

            // Afficher les mesures
            MeasurementTable.loadMeasurements(planMeasurements);
            planMeasurements.forEach(m => DrawingManager.drawMeasurement(m));

            currentPlanId = planId;

            // Mettre à jour l'UI
            updatePlanSelector();

            PubSub.publish('plan:changed', { planId, plan });

        } catch (error) {
            console.error('Erreur chargement plan:', error);
            throw error;
        }
    }

    /**
     * Ajouter un nouveau plan à la version
     */
    async function addPlan(file, floorLevel, floorOrder) {
        const project = App.getCurrentProject();
        const version = VersionManager.getCurrentVersion();

        if (!project || !version) {
            throw new Error('Aucun projet/version ouvert');
        }

        try {
            // Upload du fichier
            const uploadResult = await StorageManager.uploadFile(file, project.project_id, {
                version_id: version.version_id,
                floor_level: floorLevel,
                floor_order: floorOrder
            });

            // Créer l'entrée du plan
            const planData = {
                project_id: project.project_id,
                version_id: version.version_id,
                floor_level: floorLevel,
                floor_order: floorOrder,
                file_path: uploadResult.file_path,
                file_name: uploadResult.file_name,
                file_size: uploadResult.file_size,
                mime_type: uploadResult.mime_type
            };

            const result = await StorageManager.apiRequest('/plans.php', 'POST', planData);
            const newPlan = result.plan;

            currentPlans.push(newPlan);
            currentPlans.sort((a, b) => a.floor_order - b.floor_order);

            renderPlansList();

            // Charger ce nouveau plan
            await loadPlan(newPlan.plan_id);

            alert(`✅ Plan "${floorLevel}" ajouté avec succès`);

            return newPlan;

        } catch (error) {
            console.error('Erreur ajout plan:', error);
            throw error;
        }
    }

    /**
     * Remplacer un plan existant (avec backup auto)
     */
    async function replacePlan(planId, newFile) {
        const project = App.getCurrentProject();
        const version = VersionManager.getCurrentVersion();
        const plan = currentPlans.find(p => p.plan_id === planId);

        if (!plan) {
            throw new Error('Plan non trouvé');
        }

        const confirmMsg = `⚠️ Vous êtes sur le point de remplacer le plan "${plan.floor_level}".\n\n` +
                          `L'ancien plan sera sauvegardé automatiquement.\n\n` +
                          `Continuer ?`;

        if (!confirm(confirmMsg)) {
            return;
        }

        try {
            // Upload du nouveau fichier
            const uploadResult = await StorageManager.uploadFile(newFile, project.project_id, {
                version_id: version.version_id,
                floor_level: plan.floor_level
            });

            // Appel API de remplacement
            const replaceData = {
                project_id: project.project_id,
                version_id: version.version_id,
                plan_id: planId,
                new_file_path: uploadResult.file_path,
                new_file_name: uploadResult.file_name,
                new_file_hash: uploadResult.file_hash,
                new_file_size: uploadResult.file_size,
                mime_type: uploadResult.mime_type
            };

            const result = await StorageManager.apiRequest('/plans.php', 'PUT', replaceData);

            // Mettre à jour la liste locale
            const index = currentPlans.findIndex(p => p.plan_id === planId);
            if (index !== -1) {
                currentPlans[index] = result.plan;
            }

            renderPlansList();

            // Recharger le plan
            await loadPlan(planId);

            alert(`✅ Plan "${plan.floor_level}" remplacé avec succès\n\n` +
                  `Backup créé: ${result.backup.file_path}`);

            return result;

        } catch (error) {
            console.error('Erreur remplacement plan:', error);
            alert('❌ Erreur lors du remplacement du plan: ' + error.message);
            throw error;
        }
    }

    /**
     * Supprimer un plan
     */
    async function deletePlan(planId) {
        const plan = currentPlans.find(p => p.plan_id === planId);

        if (!plan) {
            throw new Error('Plan non trouvé');
        }

        if (!confirm(`Supprimer le plan "${plan.floor_level}" ?\n\nCette action est irréversible.`)) {
            return;
        }

        try {
            const project = App.getCurrentProject();
            const version = VersionManager.getCurrentVersion();

            await StorageManager.apiRequest(
                `/plans.php?project_id=${project.project_id}&version_id=${version.version_id}&plan_id=${planId}`,
                'DELETE'
            );

            // Retirer de la liste
            currentPlans = currentPlans.filter(p => p.plan_id !== planId);

            renderPlansList();

            // Charger un autre plan si disponible
            if (currentPlans.length > 0) {
                await loadPlan(currentPlans[0].plan_id);
            } else {
                // Plus de plans
                PDFLoader.clear();
                MeasurementTable.clear();
            }

            alert(`Plan "${plan.floor_level}" supprimé`);

        } catch (error) {
            console.error('Erreur suppression plan:', error);
            throw error;
        }
    }

    /**
     * Afficher la liste des plans (dans un sélecteur)
     */
    function renderPlansList() {
        const container = document.getElementById('plans-selector');
        if (!container) return;

        if (currentPlans.length === 0) {
            container.innerHTML = '<option value="">Aucun plan</option>';
            return;
        }

        container.innerHTML = currentPlans.map(plan => {
            const badge = plan.is_modified ? ' 🔄' : '';
            const inherited = plan.inherited_from ? ' (hérité)' : '';
            return `<option value="${plan.plan_id}" ${plan.plan_id === currentPlanId ? 'selected' : ''}>
                ${plan.floor_level}${badge}${inherited}
            </option>`;
        }).join('');
    }

    /**
     * Mettre à jour le sélecteur de plan
     */
    function updatePlanSelector() {
        const selector = document.getElementById('plans-selector');
        if (selector) {
            selector.value = currentPlanId;
        }

        // Mettre à jour le badge du plan actuel
        const currentPlan = currentPlans.find(p => p.plan_id === currentPlanId);
        if (currentPlan) {
            document.getElementById('current-plan-label').textContent =
                `Plan: ${currentPlan.floor_level}`;
        }
    }

    /**
     * Obtenir le plan courant
     */
    function getCurrentPlan() {
        return currentPlans.find(p => p.plan_id === currentPlanId);
    }

    /**
     * Obtenir tous les plans
     */
    function getAllPlans() {
        return currentPlans;
    }

    // API publique
    return {
        loadPlans,
        loadPlan,
        addPlan,
        replacePlan,
        deletePlan,
        getCurrentPlan,
        getAllPlans
    };
})();
```

---

### 5. INTERFACE UTILISATEUR - MODIFICATIONS

#### 5.1 Nouveau sélecteur de plans dans le header

**Modifier `index.php`:**

```html
<header class="app-header">
    <div class="header-left">
        <h1>📐 Métré Pro</h1>
        <div class="project-info">
            <span id="current-project">Aucun projet</span>
            <span id="current-version"></span>
            <!-- NOUVEAU: Sélecteur de plans -->
            <select id="plans-selector" class="plan-selector">
                <option value="">Aucun plan</option>
            </select>
            <button id="btn-add-plan" class="btn-icon" title="Ajouter un plan">➕</button>
            <button id="btn-replace-plan" class="btn-icon" title="Remplacer ce plan">🔄</button>
        </div>
    </div>
    <!-- ... -->
</header>
```

#### 5.2 Modal: Ajouter un plan

```html
<!-- Modal: Add Plan -->
<div id="add-plan-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Ajouter un plan à la version</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <form id="add-plan-form">
                <label>
                    Niveau / Étage *
                    <select name="floor_level" id="floor-level-select">
                        <option value="Sous-sol">Sous-sol</option>
                        <option value="RDC" selected>RDC (Rez-de-chaussée)</option>
                        <option value="R+1">R+1 (1er étage)</option>
                        <option value="R+2">R+2 (2ème étage)</option>
                        <option value="R+3">R+3 (3ème étage)</option>
                        <option value="Combles">Combles</option>
                        <option value="Toiture">Toiture</option>
                        <option value="custom">Autre (personnalisé)...</option>
                    </select>
                </label>

                <label id="custom-level-label" style="display: none;">
                    Nom personnalisé *
                    <input type="text" name="custom_floor_level" id="custom-floor-level">
                </label>

                <label>
                    Ordre d'affichage
                    <input type="number" name="floor_order" value="0" min="-10" max="100">
                    <small>Ordre de tri (ex: Sous-sol=-1, RDC=0, R+1=1, etc.)</small>
                </label>

                <label>
                    Fichier PDF *
                    <input type="file" name="plan_file" accept=".pdf" required>
                </label>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary modal-close">Annuler</button>
            <button class="btn btn-primary" id="add-plan-confirm">Ajouter</button>
        </div>
    </div>
</div>
```

#### 5.3 Modal: Nouvelle version depuis version précédente

```html
<!-- Modal: New Version from Previous -->
<div id="new-version-modal" class="modal">
    <div class="modal-content modal-large">
        <div class="modal-header">
            <h2>Créer une nouvelle version</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <form id="new-version-form">
                <label>
                    Version de base
                    <select name="parent_version_id" id="parent-version-select">
                        <!-- Populated by JS -->
                    </select>
                </label>

                <label>
                    Nom de la nouvelle version *
                    <input type="text" name="version_label" required placeholder="Ex: Modification cuisine">
                </label>

                <label>
                    Description
                    <textarea name="description" rows="3" placeholder="Décrivez les changements..."></textarea>
                </label>

                <h4>Plans à conserver (copiés de la version précédente):</h4>
                <div id="plans-to-keep-list">
                    <!-- Checkboxes populated by JS -->
                </div>

                <h4>Plans à remplacer (à uploader après création):</h4>
                <div id="plans-to-replace-list">
                    <!-- Checkboxes populated by JS -->
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary modal-close">Annuler</button>
            <button class="btn btn-primary" id="create-version-confirm">Créer la version</button>
        </div>
    </div>
</div>
```

---

### 6. WORKFLOW UTILISATEUR COMPLET

#### 6.1 Créer un projet avec plans multi-niveaux

```
1. User: Clic "Nouveau Projet"
2. User: Remplit formulaire (nom, client, etc.)
3. System: Crée projet → project_id

4. User: Clic "Charger Plan"
5. Modal: "Ajouter un plan"
6. User: Sélectionne "RDC", upload rdc_plan.pdf
7. System: Upload + crée version v001 avec plan RDC

8. User: Clic "➕" (Ajouter plan)
9. Modal: "Ajouter un plan"
10. User: Sélectionne "R+1", upload r1_plan.pdf
11. System: Ajoute plan R+1 à v001

12. User: Clic "➕" (Ajouter plan)
13. User: Sélectionne "R+2", upload r2_plan.pdf
14. System: Ajoute plan R+2 à v001

Résultat: Version v001 contient 3 plans (RDC, R+1, R+2)
```

#### 6.2 Créer une nouvelle version en modifiant un seul plan

```
1. User: Clic "Nouvelle Version"
2. Modal: "Créer une nouvelle version"
3. User: Sélectionne version de base = v001
4. User: Nom = "Modification cuisine RDC"
5. User: Coche plans à conserver: ☑ R+1, ☑ R+2
6. User: Coche plans à remplacer: ☑ RDC
7. User: Clic "Créer la version"

8. System:
   - Crée v002
   - Copie plans R+1 et R+2 depuis v001 (référence, pas duplication fichier)
   - Laisse RDC vide (à uploader)

9. User: Clic "🔄" (Remplacer plan) sur RDC
10. Modal: "Remplacer le plan RDC"
11. User: Upload nouveau rdc_plan_v2.pdf
12. System:
    - BACKUP automatique de l'ancien rdc_plan.pdf → backups/v001/rdc_plan_backup_20250214143000.pdf
    - BACKUP des mesures RDC → backups/v001/measurements_plan_001_20250214143000.json
    - Remplace le fichier PDF
    - Met à jour versions.json avec is_modified=true

Résultat: Version v002 avec 3 plans:
  - RDC: nouveau fichier (modifié)
  - R+1: hérité de v001
  - R+2: hérité de v001
```

---

### 7. AVANTAGES DE LA NOUVELLE ARCHITECTURE

✅ **Multi-niveaux par version:** Un projet d'immeuble peut avoir RDC, R+1, R+2, etc. dans la même version

✅ **Héritage intelligent:** Nouvelle version peut copier les plans non modifiés au lieu de les dupliquer

✅ **Backup automatique:** Tout remplacement de plan crée un backup horodaté

✅ **Traçabilité:** On sait quels plans ont été modifiés et quand

✅ **Mesures par plan:** Les mesures sont organisées par plan_id, pas mélangées

✅ **Flexibilité:** Support de niveaux personnalisés (Mezzanine, Parking, etc.)

✅ **Économie d'espace:** Plans hérités ne sont pas dupliqués physiquement

✅ **Gestion des erreurs:** Si un plan échoue à charger, les autres restent accessibles

---

### 8. MIGRATION DES DONNÉES EXISTANTES

#### Script PHP: `php/scripts/migrate_to_multiplan.php`

```php
<?php
/**
 * Migration: Ancienne structure (1 PDF par version)
 *         → Nouvelle structure (N plans par version)
 */

require_once __DIR__ . '/../config.php';

function migrateProject($projectId) {
    $versionsFile = SAVES_PATH . "/{$projectId}/versions/versions.json";

    if (!file_exists($versionsFile)) {
        echo "Projet {$projectId}: Pas de fichier versions.json\n";
        return;
    }

    $data = json_decode(file_get_contents($versionsFile), true);

    foreach ($data['versions'] as &$version) {
        // Si structure ancienne (pas de clé "plans")
        if (!isset($version['plans'])) {
            echo "Migration version {$version['version_id']}...\n";

            // Créer un plan unique "RDC" avec les données existantes
            $plan = [
                'plan_id' => 'plan_' . substr(md5($version['version_id']), 0, 8),
                'floor_level' => 'RDC',
                'floor_order' => 0,
                'file_path' => $version['file_path'],
                'file_name' => $version['file_name'],
                'file_hash' => $version['file_hash'] ?? null,
                'file_size' => $version['file_size'],
                'mime_type' => $version['mime_type'],
                'uploaded_at' => $version['upload_date'],
                'is_modified' => false,
                'source_version_id' => null,
                'source_plan_id' => null
            ];

            $version['plans'] = [$plan];

            // Migrer measurements.json aussi
            $measFile = SAVES_PATH . "/{$projectId}/versions/{$version['version_id']}/measurements.json";
            if (file_exists($measFile)) {
                $meas = json_decode(file_get_contents($measFile), true);

                // Si structure ancienne (array direct)
                if (isset($meas[0])) {
                    // Transformer en structure par plan
                    $newMeas = [
                        'measurements_by_plan' => [
                            $plan['plan_id'] => $meas
                        ]
                    ];

                    file_put_contents($measFile, json_encode($newMeas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                    echo "  → Measurements migrés\n";
                }
            }
        }
    }

    file_put_contents($versionsFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "✅ Projet {$projectId} migré\n\n";
}

// Migrer tous les projets
$projectDirs = glob(SAVES_PATH . '/projet_*', GLOB_ONLYDIR);

foreach ($projectDirs as $dir) {
    $projectId = basename($dir);
    migrateProject($projectId);
}

echo "Migration terminée.\n";
```

---

### 9. TESTS À EFFECTUER

#### Test 1: Créer version avec 3 plans
- [ ] Créer projet
- [ ] Ajouter plan RDC
- [ ] Ajouter plan R+1
- [ ] Ajouter plan R+2
- [ ] Vérifier que tous les plans sont listés
- [ ] Vérifier qu'on peut switcher entre les plans
- [ ] Vérifier que chaque plan a son propre canvas et mesures

#### Test 2: Créer nouvelle version en modifiant 1 plan
- [ ] Créer v002 depuis v001
- [ ] Sélectionner RDC à remplacer, R+1 et R+2 à conserver
- [ ] Uploader nouveau plan RDC
- [ ] Vérifier backup créé
- [ ] Vérifier que R+1 et R+2 sont hérités (pas dupliqués)
- [ ] Vérifier mesures préservées sur R+1 et R+2

#### Test 3: Remplacement de plan avec backup
- [ ] Ouvrir une version existante
- [ ] Remplacer un plan
- [ ] Vérifier popup de confirmation
- [ ] Vérifier backup créé dans saves/{project}/backups/
- [ ] Vérifier que l'ancien PDF est sauvegardé
- [ ] Vérifier que les anciennes mesures sont sauvegardées

#### Test 4: Suppression de plan
- [ ] Supprimer un plan d'une version
- [ ] Vérifier confirmation
- [ ] Vérifier plan retiré de la liste
- [ ] Vérifier fichier non supprimé (sécurité)

#### Test 5: Migration de données
- [ ] Créer projet avec ancienne structure
- [ ] Lancer script de migration
- [ ] Vérifier que versions.json a structure "plans"
- [ ] Vérifier que measurements.json a structure "measurements_by_plan"
- [ ] Vérifier qu'aucune donnée n'est perdue

---

### 10. PLANNING D'IMPLÉMENTATION

**Phase 1: Backend (2-3 heures)**
- [ ] Créer `php/classes/PlanManager.php`
- [ ] Créer `php/api/plans.php`
- [ ] Modifier `php/api/versions.php` (nouveau endpoint)
- [ ] Modifier `php/classes/VersionManager.php` (support plans array)
- [ ] Créer script de migration

**Phase 2: Frontend (3-4 heures)**
- [ ] Créer `js/modules/plan-manager.js`
- [ ] Modifier `index.php` (nouveau sélecteur + modals)
- [ ] Modifier `css/main.css` (styles nouveaux éléments)
- [ ] Modifier `js/app.js` (intégration PlanManager)
- [ ] Modifier `js/modules/versioning.js` (support multi-plans)
- [ ] Modifier `js/modules/auto-save.js` (sauver par plan_id)

**Phase 3: Tests (1-2 heures)**
- [ ] Tests unitaires PHP (PlanManager)
- [ ] Tests end-to-end (workflow complet)
- [ ] Tests migration données
- [ ] Tests UI (tous les modals)

**TOTAL ESTIMÉ: 6-9 heures de développement**

---

## 🎯 PROCHAINE ÉTAPE

Voulez-vous que je:

**Option A:** Implémenter immédiatement toute cette architecture (backend + frontend)?

**Option B:** Commencer par le backend uniquement (API + classes PHP)?

**Option C:** Faire une implémentation minimale pour tester le concept d'abord?

**Option D:** Modifier quelque chose dans l'architecture proposée?

---

**IMPORTANT:** Cette refonte est MAJEURE mais NÉCESSAIRE pour un logiciel de métré professionnel. Les projets de bâtiment ont TOUJOURS plusieurs niveaux.
