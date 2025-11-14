# ANALYSE COMPLÈTE DU SYSTÈME - TOUS LES APPELS ET FORMATS

## 1. APIs PHP - CONTRATS COMPLETS

### 1.1 projects.php

#### GET /projects.php
**Input:** Aucun
**Output:**
```json
{
  "success": true,
  "projects": [
    {
      "project_id": "string",
      "project_name": "string",
      "client_name": "string|null",
      "contract_reference": "string|null",
      "address": "string|null",
      "status": "active|archived",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

#### GET /projects.php?id={project_id}
**Input:**
- `id` (query param): project_id string

**Output:**
```json
{
  "success": true,
  "project": {
    "project_id": "string",
    "project_name": "string",
    "client_name": "string|null",
    "contract_reference": "string|null",
    "address": "string|null",
    "status": "active|archived",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### POST /projects.php
**Input (JSON body):**
```json
{
  "project_name": "string (required)",
  "client_name": "string (optional)",
  "contract_reference": "string (optional)",
  "address": "string (optional)"
}
```

**Output:**
```json
{
  "success": true,
  "project": {
    "project_id": "string",
    "project_name": "string",
    "client_name": "string|null",
    "contract_reference": "string|null",
    "address": "string|null",
    "status": "active",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

---

### 1.2 versions.php

#### GET /versions.php?project_id={project_id}
**Input:**
- `project_id` (query param, REQUIRED): project_id string

**Output:**
```json
{
  "success": true,
  "versions": [
    {
      "version_id": "string (v001, v002, etc)",
      "version_number": "integer",
      "version_label": "string",
      "file_path": "string",
      "file_name": "string",
      "file_hash": "string|null",
      "file_size": "integer",
      "mime_type": "string",
      "scale_factor": "float|null",
      "origin_x": "float",
      "origin_y": "float",
      "rotation_degrees": "float",
      "upload_date": "datetime",
      "uploaded_by": "integer",
      "is_current": "boolean|integer",
      "status": "draft|published"
    }
  ]
}
```

---

### 1.3 measurements.php

#### GET /measurements.php?project_id={project_id}&version_id={version_id}
**Input:**
- `project_id` (query param, REQUIRED): project_id string
- `version_id` (query param, REQUIRED): version_id string

**Output:**
```json
{
  "success": true,
  "measurements": [
    {
      "measurement_id": "string",
      "type": "line|polyline|rectangle|polygon|circle|count",
      "code": "string",
      "description": "string",
      "category": "string",
      "quantity": "float",
      "unit": "string (m, m², pcs, etc)",
      "unit_price": "float",
      "total": "float",
      "status": "draft|validated",
      "geometry": "object (coordinates, etc)",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

#### POST /measurements.php
**Input (JSON body):**
```json
{
  "project_id": "string (REQUIRED)",
  "version_id": "string (REQUIRED)",
  "measurements": [
    {
      "measurement_id": "string (optional, auto-generated if missing)",
      "type": "string",
      "code": "string",
      "description": "string",
      "category": "string",
      "quantity": "float",
      "unit": "string",
      "unit_price": "float",
      "total": "float",
      "status": "string",
      "geometry": "object"
    }
  ]
}
```

**Output:**
```json
{
  "success": true,
  "message": "Mesures sauvegardées",
  "measurements": [ /* same as input */ ]
}
```

---

### 1.4 upload.php

#### POST /upload.php (multipart/form-data)
**Input:**
- `file` (file upload, REQUIRED): PDF file
- `project_id` (form field, REQUIRED): project_id string
- `metadata` (form field, JSON string, optional): version metadata

**Output:**
```json
{
  "success": true,
  "message": "Fichier uploadé avec succès",
  "version": {
    "version_id": "string",
    "file_path": "string",
    "file_name": "string",
    "file_size": "integer",
    "mime_type": "string"
  }
}
```

---

## 2. FONCTIONS JAVASCRIPT - SIGNATURES COMPLÈTES

### 2.1 StorageManager (storage.js)

#### saveProject(project)
```javascript
/**
 * @param {Object} project
 * @param {string} project.project_name - REQUIRED
 * @param {string} [project.client_name] - Optional
 * @param {string} [project.contract_reference] - Optional
 * @param {string} [project.address] - Optional
 * @returns {Promise<Object>} API response with project object
 */
async function saveProject(project)
```

#### loadProject(projectId)
```javascript
/**
 * @param {string} projectId - REQUIRED
 * @returns {Promise<Object>} Response format: { success: true, project: {...} }
 */
async function loadProject(projectId)
```

#### saveMeasurements(projectId, versionId, measurements)
```javascript
/**
 * @param {string} projectId - REQUIRED
 * @param {string} versionId - REQUIRED
 * @param {Array<Object>} measurements - REQUIRED
 * @returns {Promise<Object>} API response
 */
async function saveMeasurements(projectId, versionId, measurements)
```

#### loadMeasurements(projectId, versionId)
```javascript
/**
 * @param {string} projectId - REQUIRED
 * @param {string} versionId - REQUIRED
 * @returns {Promise<Object>} Response format: { success: true, measurements: [...] }
 */
async function loadMeasurements(projectId, versionId)
```

#### uploadFile(file, projectId, metadata)
```javascript
/**
 * @param {File} file - REQUIRED (PDF file object)
 * @param {string} projectId - REQUIRED
 * @param {Object} [metadata] - Optional metadata
 * @returns {Promise<Object>} API response with version info
 */
async function uploadFile(file, projectId, metadata = {})
```

---

### 2.2 ProjectSelector (project-selector.js)

#### openProject(projectId)
```javascript
/**
 * @param {string} projectId - REQUIRED
 * @returns {Promise<void>}
 *
 * Flow:
 * 1. Calls StorageManager.loadProject(projectId)
 * 2. Publishes EVENTS.PROJECT_LOADED with project object
 * 3. Calls StorageManager.apiRequest('/versions.php?project_id=...')
 * 4. Finds current version (is_current=1) or most recent
 * 5. Calls PDFLoader.loadPDFFromURL(version.file_path)
 * 6. Calls StorageManager.loadMeasurements(projectId, versionId)
 * 7. Calls MeasurementTable.loadMeasurements(measurements)
 * 8. Publishes EVENTS.VERSION_CHANGED
 */
async function openProject(projectId)
```

---

### 2.3 VersionManager (versioning.js)

#### loadVersions(projectId)
```javascript
/**
 * @param {string} projectId - REQUIRED
 * @returns {Promise<void>}
 *
 * Side effects:
 * - Sets currentProjectId = projectId
 * - Calls StorageManager.apiRequest('/versions.php?project_id=...')
 * - Populates versions array
 * - Calls renderVersionsList()
 */
async function loadVersions(projectId)
```

#### loadVersion(versionId)
```javascript
/**
 * @param {string} versionId - REQUIRED
 * @returns {Promise<void>}
 *
 * Prerequisites:
 * - currentProjectId must be set (via loadVersions or PROJECT_LOADED event)
 *
 * Flow:
 * 1. Checks currentProjectId is set
 * 2. Calls PDFLoader.loadPDFFromURL(version.file_path)
 * 3. Calls StorageManager.loadMeasurements(currentProjectId, versionId)
 * 4. Calls MeasurementTable.loadMeasurements(measurements)
 * 5. Publishes EVENTS.VERSION_CHANGED
 */
async function loadVersion(versionId)
```

---

### 2.4 AutoSave (auto-save.js)

#### save()
```javascript
/**
 * @returns {Promise<void>}
 *
 * Prerequisites:
 * - currentProject must be set (via PROJECT_LOADED event)
 * - currentVersion must be set (via VERSION_CHANGED event)
 *
 * Flow:
 * 1. Checks currentProject and currentVersion are set
 * 2. Calls getMeasurementsFromTable()
 * 3. Calls StorageManager.saveMeasurements(projectId, versionId, measurements)
 * 4. Updates InfoPanel save indicator
 */
async function save()
```

---

## 3. FLUX DE DONNÉES COMPLETS

### 3.1 FLUX: Création de projet

```
USER ACTION: Click "Nouveau Projet"
  ↓
app.js: showNewProjectModal()
  ↓
USER: Fills form, clicks "Créer"
  ↓
app.js: createProject()
  ↓
StorageManager.saveProject(projectData)
  ↓
POST /projects.php
  ↓
ProjectManager.create() (PHP)
  ↓
Response: { success: true, project: {...} }
  ↓
PubSub.publish(EVENTS.PROJECT_CREATED, project)
  ↓
AutoSave: currentProject = project
VersionManager: currentProjectId = project.project_id
InfoPanel: Updates project details
```

### 3.2 FLUX: Ouverture de projet existant

```
USER ACTION: Click "Ouvrir Projet"
  ↓
ProjectSelector.showProjectSelector()
  ↓
loadProjectsList()
  ↓
GET /projects.php
  ↓
Response: { success: true, projects: [...] }
  ↓
renderProjectsList() - Display cards
  ↓
USER: Clicks "Ouvrir" on a project
  ↓
ProjectSelector.openProject(projectId)
  ↓
1. StorageManager.loadProject(projectId)
   → GET /projects.php?id={projectId}
   → Response: { success: true, project: {...} }

2. PubSub.publish(EVENTS.PROJECT_LOADED, project)
   → AutoSave: currentProject = project
   → VersionManager: currentProjectId = project.project_id
   → InfoPanel: Updates display

3. StorageManager.apiRequest('/versions.php?project_id=...')
   → GET /versions.php?project_id={projectId}
   → Response: { success: true, versions: [...] }

4. VersionManager.loadVersions(projectId)
   → Same API call
   → Populates version modal

5. Find currentVersion (is_current=1 or most recent)

6. PDFLoader.loadPDFFromURL(version.file_path)
   → Loads and renders PDF

7. StorageManager.loadMeasurements(projectId, versionId)
   → GET /measurements.php?project_id={projectId}&version_id={versionId}
   → Response: { success: true, measurements: [...] }

8. MeasurementTable.loadMeasurements(measurements)
   → Populates table

9. DrawingManager.drawMeasurement() for each measurement
   → Draws on canvas

10. PubSub.publish(EVENTS.VERSION_CHANGED, {versionId, version})
    → AutoSave: currentVersion = versionId
```

### 3.3 FLUX: Upload de plan PDF

```
USER ACTION: Click "Charger Plan" or drag-drop file
  ↓
app.js: handleFileSelect() / handleFiles()
  ↓
Checks currentProject exists
  ↓
StorageManager.uploadFile(file, projectId, metadata)
  ↓
POST /upload.php (multipart)
  FormData:
    - file: PDF file
    - project_id: string
    - metadata: JSON string
  ↓
upload.php: Saves file to saves/{projectId}/uploads/
  ↓
VersionManager.create() (PHP)
  ↓
Response: { success: true, version: {...} }
  ↓
PubSub.publish(EVENTS.PLAN_UPLOADED, version)
  ↓
AutoSave: currentVersion = version.version_id
  ↓
PDFLoader.loadPDFFromURL(version.file_path)
  ↓
Displays PDF on canvas
```

### 3.4 FLUX: Auto-save des mesures

```
TRIGGER: Every 30 seconds (if isDirty)
  ↓
AutoSave.save()
  ↓
Checks currentProject and currentVersion exist
  ↓
getMeasurementsFromTable()
  → Reads from DOM table
  → Extracts all measurement rows
  → Returns array of measurement objects
  ↓
StorageManager.saveMeasurements(projectId, versionId, measurements)
  ↓
POST /measurements.php
  Body: {
    project_id: string,
    version_id: string,
    measurements: array
  }
  ↓
MeasurementManager.save() (PHP)
  ↓
Response: { success: true, measurements: [...] }
  ↓
InfoPanel.updateSaveIndicator('saved')
```

---

## 4. INCOHÉRENCES IDENTIFIÉES

### 4.1 Format de réponse inconsistant

**Problème:** Certaines APIs retournent `{ project: {...} }`, d'autres `{ success: true, project: {...} }`

**Fichiers affectés:**
- projects.php
- versions.php
- measurements.php

**Impact:** Code JS doit gérer `result.project || result`

### 4.2 Types de données incohérents

**Problème:** `is_current` est tantôt boolean, tantôt integer (0/1)

**Code JS doit comparer:**
```javascript
v.is_current === 1 || v.is_current === '1' || v.is_current === true
```

### 4.3 Paramètres manquants dans certains appels

**Problème CORRIGÉ:** measurements.php exigeait `project_id` + `version_id` mais certains appels ne passaient que `version_id`

**Fichiers modifiés:**
- storage.js: Ajouté projectId param
- project-selector.js: Passe project.project_id
- versioning.js: Ajouté currentProjectId tracking
- auto-save.js: Passe currentProject.project_id

---

## 5. ANALYSE EN COURS...

Analyse des modules restants:
- [ ] table.js - MeasurementTable functions
- [ ] drawing.js - DrawingManager functions
- [ ] tools.js - Tool interactions
- [ ] calibration.js - Calibration flow
- [ ] pdf-loader.js - PDF rendering flow
- [ ] app.js - Main orchestration

TO BE CONTINUED...
