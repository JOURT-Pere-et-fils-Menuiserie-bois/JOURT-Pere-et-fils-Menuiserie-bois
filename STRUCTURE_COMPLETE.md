# STRUCTURE COMPLÈTE DU PROJET - Logiciel de Métré Professionnel

## 📁 ARBORESCENCE COMPLÈTE

```
JOURT-Pere-et-fils-Menuiserie-bois/
│
├── 📄 index.php                    # Point d'entrée HTML principal
├── 📄 README.md                    # Ce fichier
├── 📄 ARCHITECTURE_REFONTE_VERSIONS.md  # Doc architecture multi-plans
├── 📄 CORRECTIONS_CRITIQUES.md     # Doc corrections intégration
├── 📄 ANALYSE_COMPLETE.md          # Analyse complète API/fonctions
├── 📄 TESTS_COMPLETS.md            # Tests end-to-end
│
├── 📂 css/                         # Styles CSS
│   ├── reset.css                   # Reset CSS
│   ├── main.css                    # Styles principaux + plan selector
│   ├── viewer.css                  # Styles viewer PDF/DXF
│   ├── table.css                   # Styles tableau mesures
│   ├── modal.css                   # Styles modales
│   └── versioning.css              # Styles gestion versions
│
├── 📂 js/                          # JavaScript
│   ├── app.js                      # Application principale
│   │
│   ├── 📂 modules/                 # Modules JS (Revealing Module Pattern)
│   │   ├── pubsub.js              # Système événements Pub/Sub
│   │   ├── storage.js             # Gestion stockage (API + localStorage)
│   │   ├── pdf-loader.js          # Chargement PDF (PDF.js)
│   │   ├── dxf-loader.js          # Chargement DXF
│   │   ├── calibration.js         # Calibration échelle
│   │   ├── drawing.js             # Dessin mesures sur canvas
│   │   ├── tools.js               # Outils de dessin
│   │   ├── layers.js              # Gestion calques
│   │   ├── table.js               # Tableau mesures
│   │   ├── versioning.js          # Gestion versions
│   │   ├── plan-manager.js        # ✨ NOUVEAU: Gestion multi-plans
│   │   ├── project-selector.js    # Sélection/ouverture projets
│   │   ├── info-panel.js          # Panneau infos projet
│   │   ├── auto-save.js           # Sauvegarde auto 30s
│   │   ├── shortcuts.js           # Raccourcis clavier
│   │   └── export.js              # Export Excel/PDF
│   │
│   └── 📂 lib/                     # Bibliothèques externes
│       └── .gitkeep                # (PDF.js chargé depuis CDN)
│
├── 📂 php/                         # Backend PHP
│   │
│   ├── config.php                  # Configuration
│   │
│   ├── 📂 api/                     # API REST
│   │   ├── projects.php            # CRUD projets
│   │   ├── versions.php            # CRUD versions
│   │   ├── plans.php               # ✨ NOUVEAU: CRUD plans
│   │   ├── measurements.php        # CRUD mesures
│   │   └── upload.php              # Upload fichiers
│   │
│   ├── 📂 classes/                 # Classes PHP
│   │   ├── FlatFileDB.php          # Base de données JSON
│   │   ├── ProjectManager.php      # Gestion projets
│   │   ├── VersionManager.php      # Gestion versions (modifié multi-plans)
│   │   ├── PlanManager.php         # ✨ NOUVEAU: Gestion plans
│   │   ├── MeasurementManager.php  # Gestion mesures
│   │   └── UploadManager.php       # Upload fichiers
│   │
│   └── 📂 scripts/                 # Scripts utilitaires
│       └── migrate_to_multiplan.php # ✨ Migration vers multi-plans
│
├── 📂 saves/                       # Données projets (FlatFile)
│   ├── .gitkeep
│   ├── .htaccess                   # Protection accès direct
│   │
│   └── projet_xxx/                 # Structure projet
│       ├── project.json            # Métadonnées projet
│       │
│       ├── 📂 versions/
│       │   ├── versions.json       # Liste versions + plans[]
│       │   │
│       │   ├── 📂 v001/
│       │   │   ├── metadata.json
│       │   │   └── measurements.json  # { measurements_by_plan: {} }
│       │   │
│       │   └── 📂 v002/
│       │       └── ...
│       │
│       ├── 📂 uploads/             # Fichiers uploadés (PDF/DXF)
│       │   ├── hash_abc/rdc.pdf
│       │   ├── hash_def/r1.pdf
│       │   └── hash_ghi/r2.pdf
│       │
│       └── 📂 backups/             # ✨ NOUVEAU: Backups plans remplacés
│           └── v001/
│               ├── rdc_backup_20250115143000.pdf
│               └── measurements_plan_xxx_20250115143000.json
│
├── 📂 uploads/                     # Upload temporaire
│   └── .gitkeep
│
└── 📂 logs/                        # Logs PHP
    └── .gitkeep
```

---

## 🚀 ARCHITECTURE MULTI-PLANS

### **Nouvelle structure (depuis commit f9c8212)**

#### **1 Version = N Plans**

```json
{
  "version_id": "v001",
  "version_label": "Plans initiaux",
  "plans": [
    {
      "plan_id": "plan_abc123",
      "floor_level": "RDC",
      "floor_order": 0,
      "file_path": "saves/projet_xxx/uploads/hash/rdc.pdf",
      "is_modified": false
    },
    {
      "plan_id": "plan_def456",
      "floor_level": "R+1",
      "floor_order": 1,
      "file_path": "saves/projet_xxx/uploads/hash/r1.pdf",
      "is_modified": false
    }
  ]
}
```

#### **Mesures par plan**

```json
{
  "measurements_by_plan": {
    "plan_abc123": [
      { "measurement_id": "m001", "type": "line", "value": 12.5 }
    ],
    "plan_def456": [
      { "measurement_id": "m002", "type": "rectangle", "value": 25.3 }
    ]
  }
}
```

---

## 📦 MODULES JAVASCRIPT

### **Modules principaux**

| Module | Responsabilité | Fichier |
|--------|---------------|---------|
| **App** | Point d'entrée, initialisation | `js/app.js` |
| **PubSub** | Système événements | `js/modules/pubsub.js` |
| **StorageManager** | API + localStorage | `js/modules/storage.js` |
| **PlanManager** | ✨ Gestion multi-plans | `js/modules/plan-manager.js` |
| **VersionManager** | Gestion versions | `js/modules/versioning.js` |
| **AutoSave** | Sauvegarde auto 30s | `js/modules/auto-save.js` |
| **PDFLoader** | Chargement PDF | `js/modules/pdf-loader.js` |
| **DXFLoader** | Chargement DXF | `js/modules/dxf-loader.js` |

### **Événements clés**

```javascript
// Événements projet
EVENTS.PROJECT_CREATED
EVENTS.PROJECT_LOADED

// Événements version
EVENTS.VERSION_CHANGED  → PlanManager.loadPlans()

// Événements plan
'plan:changed'  → AutoSave.save() + loadPlan()

// Événements mesures
EVENTS.MEASUREMENT_CREATED
'measurement:updated'
'measurement:deleted'
```

---

## 🔄 WORKFLOW COMPLET

### **1. Créer projet + Upload PDF**

```
User: Créer projet "Immeuble Victor Hugo"
↓
User: Drag & Drop PDF
↓
System: Prompt "Niveau du plan: RDC"
↓
System: Crée version v001 si n'existe pas
↓
System: PlanManager.addPlan(file, "RDC", 0)
↓
System: Upload PDF → API upload.php
↓
System: Crée plan dans versions.json
↓
System: Charge plan (PDF + mesures vides)
↓
System: Affiche dans sélecteur
```

### **2. Ajouter 2ème plan**

```
User: Clic ➕ "Ajouter plan"
↓
Modal: Sélection niveau "R+1"
↓
User: Upload PDF
↓
System: PlanManager.addPlan(file, "R+1", 1)
↓
System: Ajoute plan à v001.plans[]
↓
System: Charge nouveau plan
↓
Sélecteur: Affiche "RDC" + "R+1"
```

### **3. Mesures par plan**

```
User: Sélectionne plan RDC
↓
User: Ajoute mesure (ligne 12.5m)
↓
AutoSave: markAsDirty()
↓
(30 secondes plus tard)
↓
AutoSave: save()
  → saveMeasurements(projectId, versionId, "plan_rdc", measurements)
  → Sauvegarde dans measurements_by_plan["plan_rdc"]
```

### **4. Changement de plan**

```
User: Sélectionne plan R+1 dans sélecteur
↓
PlanManager: Publie 'plan:changed'
↓
AutoSave: Sauvegarde mesures plan RDC (si dirty)
↓
PlanManager: loadPlan("plan_r1")
  → Charge PDF R+1
  → Charge measurements_by_plan["plan_r1"]
  → Affiche dans table
  → Dessine sur canvas
```

---

## 🛠️ API PHP

### **Routes disponibles**

```
GET    /api/projects.php              Liste projets
POST   /api/projects.php              Créer projet
GET    /api/projects.php?id=xxx       Charger projet

GET    /api/versions.php?project_id   Liste versions
POST   /api/versions.php              Créer version
POST   /api/versions.php?action=create_from_previous  Nouvelle version avec héritage

GET    /api/plans.php?project_id&version_id  Liste plans
POST   /api/plans.php                 Créer plan
PUT    /api/plans.php                 Remplacer plan (backup auto)
DELETE /api/plans.php                 Supprimer plan

GET    /api/measurements.php?project_id&version_id  Charger mesures
POST   /api/measurements.php          Sauvegarder mesures

POST   /api/upload.php                Upload fichier
```

---

## 🧪 MIGRATION DONNÉES

### **Script de migration**

```bash
php php/scripts/migrate_to_multiplan.php
```

**Transforme:**
- Ancienne structure: `version.file_path` → Nouvelle: `version.plans[]`
- Ancienne structure: `measurements = []` → Nouvelle: `measurements_by_plan = {}`

**Rétrocompatibilité:** Toutes les fonctions détectent et gèrent l'ancienne structure automatiquement.

---

## 📝 DOCUMENTATION

- `ARCHITECTURE_REFONTE_VERSIONS.md` - Conception complète multi-plans
- `CORRECTIONS_CRITIQUES.md` - Analyse + corrections intégration
- `ANALYSE_COMPLETE.md` - API contracts + data flows
- `TESTS_COMPLETS.md` - Tests end-to-end

---

## ✅ COMMITS MAJEURS

```
7904b68 - CORRECTIONS CRITIQUES: Intégration complète architecture multi-plans
f9c8212 - IMPLÉMENTATION COMPLÈTE: Architecture multi-plans par version
bf0ddf4 - Fix: Ajout logs détaillés pour diagnostiquer erreur chargement version
463ccc7 - Documentation EXHAUSTIVE: Analyse complète + Tests complets
```

---

## 📐 SUPPORT DXF COMPLET

### **Parser DXF natif (js/modules/dxf-loader.js)**

**Entités supportées:**
- ✅ LINE - Lignes droites
- ✅ CIRCLE - Cercles complets
- ✅ ARC - Arcs de cercle
- ✅ LWPOLYLINE - Polylignes légères (2D)
- ✅ POLYLINE - Polylignes classiques
- ✅ Support des polylignes fermées (flag & 1)

**Fonctionnalités:**
- Parser DXF ASCII natif (pas de dépendance externe)
- Calcul automatique bounding box
- Transformation coordonnées DXF → Canvas
- Auto-scaling pour fit dans canvas
- Inversion axe Y (convention DXF vs Canvas)
- Rendu vectoriel sur canvas HTML5

**Codes de groupe DXF supportés:**
```
Code 8  - Layer name
Code 10 - X coordinate (start/center)
Code 20 - Y coordinate
Code 30 - Z coordinate
Code 11 - X coordinate (end point)
Code 21 - Y coordinate (end point)
Code 40 - Radius (circle/arc)
Code 50 - Start angle (arc)
Code 51 - End angle (arc)
Code 62 - Color number
Code 70 - Polyline flags
Code 90 - Vertex count (LWPOLYLINE)
Code 42 - Bulge
```

**API DXFLoader:**
```javascript
// Charger depuis File object
await DXFLoader.loadDXF(file);

// Charger depuis URL
await DXFLoader.loadDXFFromURL(url);

// Obtenir données parsées
const data = DXFLoader.getDXFData();
const entities = DXFLoader.getEntities();
const bounds = DXFLoader.getBounds();

// Rerendre (ex: après resize)
DXFLoader.rerender();
```

**Workflow DXF identique à PDF:**
1. Upload fichier .dxf via drag & drop ou modal
2. Prompt niveau du plan (RDC, R+1, etc.)
3. Upload vers serveur PHP
4. Création plan dans version.plans[]
5. Parser DXF côté client
6. Rendu sur canvas
7. Calibration échelle
8. Dessin mesures (identique PDF)
9. Auto-save par plan

**Détection automatique type fichier:**
- Extension .pdf → PDFLoader
- Extension .dxf → DXFLoader
- Mime-type application/pdf → PDFLoader
- Mime-type image/vnd.dxf → DXFLoader

---

## 🎯 PRÊT POUR PRODUCTION

✅ Architecture multi-plans complète
✅ Sauvegarde par plan (measurements_by_plan)
✅ Auto-save intelligent (30s + avant changement plan)
✅ Backup automatique remplacement plans
✅ Héritage plans entre versions
✅ Support PDF complet (PDF.js via CDN)
✅ Support DXF complet (parser natif, entités LINE/CIRCLE/ARC/POLYLINE)
✅ Détection automatique type fichier (PDF vs DXF)
✅ Rétrocompatibilité complète
✅ Logs détaillés partout
✅ Tests complets documentés
✅ Drag & drop PDF + DXF
✅ Upload modal PDF + DXF

**Le système est maintenant production-ready pour usage professionnel réel ! 🚀**
