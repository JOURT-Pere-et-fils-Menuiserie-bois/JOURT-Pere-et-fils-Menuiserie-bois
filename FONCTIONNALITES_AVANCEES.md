# FONCTIONNALITÉS AVANCÉES - LOGICIEL DE MÉTRÉ PRO

**Version:** 2.0
**Date:** 14 Novembre 2025
**Entreprise:** JOURT Père et fils - Menuiserie Bois

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Mesures avancées](#1-mesures-avancées)
3. [Markup et annotations](#2-markup-et-annotations)
4. [Export Excel](#3-export-excel)
5. [Rapports PDF](#4-rapports-pdf)
6. [Raccourcis clavier](#raccourcis-clavier)
7. [Guide de démarrage rapide](#guide-de-démarrage-rapide)

---

## VUE D'ENSEMBLE

Cette version 2.0 introduit 4 modules professionnels essentiels pour le métré en menuiserie bois:

- ✅ **Mesures avancées**: Volume, formules personnalisées, comptage groupé
- ✅ **Markup avancé**: Annotations professionnelles (flèches, textes, symboles)
- ✅ **Export Excel**: Import/Export avec catalogues fournisseurs
- ✅ **Rapports PDF**: Génération automatique de rapports professionnels

Ces fonctionnalités complètent le workflow complet : **Métré → Export → Présentation client**.

---

## 1. MESURES AVANCÉES

Module : `js/modules/advanced-measurements.js`

### 1.1 MESURES VOLUMÉTRIQUES

**Principe:** Convertir une mesure surfacique (m²) en volume (m³) en ajoutant une épaisseur.

**Utilisation:**

```javascript
// Définir épaisseur par défaut (10cm)
AdvancedMeasurements.setVolumeThickness(0.10);

// Convertir mesure surfacique en volume
const surfaceMeasurement = { type: 'rectangle', value: 15.5, unit: 'm²' };
const volumeMeasurement = AdvancedMeasurements.convertToVolume(surfaceMeasurement, 0.10);
// Résultat: { value: 1.55, unit: 'm³', thickness: 0.10 }
```

**Cas d'usage:**
- Calcul volume bois pour plancher (surface × épaisseur)
- Estimation matériaux isolants
- Calcul béton pour dalles

### 1.2 FORMULES PERSONNALISÉES

**Principe:** Créer des calculs automatiques réutilisables basés sur vos mesures.

**Exemples:**

#### Formule "Fenêtre PVC avec pose"

```javascript
AdvancedMeasurements.createFormula({
    id: 'fenetre_pvc_pose',
    name: 'Fenêtre PVC avec pose',
    description: 'Surface + 10% joints + périmètre × 0.5m pose',
    baseType: 'rectangle',
    calculate: function(measurement) {
        const surface = measurement.value;
        const perimeter = AdvancedMeasurements.calculatePerimeter(measurement);

        return {
            surface_nette: surface,
            surface_joints: surface * 0.10,
            longueur_pose: perimeter,
            surface_pose: perimeter * 0.5,
            total: surface * 1.10 + (perimeter * 0.5)
        };
    }
});
```

#### Formule "Escalier bois"

```javascript
AdvancedMeasurements.createFormula({
    id: 'escalier_bois',
    name: 'Escalier bois - Calcul marches',
    calculate: function(measurement) {
        const hauteur = 2.70; // m
        const nbMarches = Math.ceil(hauteur / 0.18); // 18cm par marche
        const largeur = measurement.value; // largeur mesurée

        return {
            nb_marches: nbMarches,
            surface_totale: nbMarches * largeur * 0.30, // 30cm profondeur
            longueur_limon: hauteur / Math.sin(Math.atan(0.18/0.30)) * 2
        };
    }
});
```

**Appliquer formule:**

```javascript
const result = AdvancedMeasurements.applyFormula(measurement, 'fenetre_pvc_pose');
console.log(result); // { surface_nette: 2.5, surface_joints: 0.25, ... }
```

### 1.3 COMPTAGE GROUPÉ

**Principe:** Organiser les éléments comptés par catégories (fenêtres RDC, prises R+1, etc.).

**Utilisation:**

```javascript
// Créer groupe
const groupId = AdvancedMeasurements.createCountGroup(
    'Fenêtres RDC',
    'Fenêtres',
    { color: '#FF0000', description: 'Toutes fenêtres rez-de-chaussée' }
);

// Ajouter éléments au groupe
measurements.forEach(m => {
    if (m.type === 'count' && m.floor === 'RDC') {
        AdvancedMeasurements.addToCountGroup(groupId, m);
    }
});

// Obtenir total
const total = AdvancedMeasurements.getCountGroupTotal(groupId);
console.log(`Total fenêtres RDC: ${total}`);
```

**Cas d'usage:**
- Fenêtres par niveau (RDC, R+1, R+2)
- Prises électriques par type (standard, USB, etc.)
- Portes par matériau (bois, PVC, alu)

### 1.4 UTILITAIRES

#### Calculer périmètre

```javascript
const perimeter = AdvancedMeasurements.calculatePerimeter(measurement);
// Rectangle: 2×(largeur + hauteur)
// Cercle: 2πr
// Polygone: somme des côtés
```

#### Calculer dimensions

```javascript
const dims = AdvancedMeasurements.calculateDimensions(measurement);
// Rectangle: { width: 3.5, height: 2.5 }
// Cercle: { diameter: 1.2, radius: 0.6 }
// Ligne: { length: 5.2 }
```

---

## 2. MARKUP ET ANNOTATIONS

Module : `js/modules/markup.js`

**Outils disponibles:** Flèche, Texte, Dessin libre, Nuage, Symboles

### 2.1 FLÈCHES

**Utilisation:** Indiquer des zones spécifiques, directions, remarques.

1. Cliquer sur bouton "➡️ Flèche"
2. Cliquer point de départ
3. Cliquer point d'arrivée
4. Flèche avec pointe créée automatiquement

**Propriétés configurables:** Couleur, épaisseur

### 2.2 TEXTES ANNOTÉS

**Utilisation:** Ajouter notes, remarques, légendes sur le plan.

1. Cliquer sur bouton "🆎 Texte"
2. Cliquer emplacement
3. Saisir texte dans dialogue
4. Texte affiché avec fond blanc semi-transparent (lisibilité)

**Propriétés:** Couleur, taille police, police

**Programmation:**

```javascript
MarkupManager.addText({ x: 150, y: 200 }, 'Attention: mur porteur');
```

### 2.3 DESSIN LIBRE

**Utilisation:** Encercler zones, dessiner formes libres, annoter manuellement.

1. Cliquer sur bouton "✏️ Libre"
2. Maintenir clic et dessiner
3. Relâcher pour terminer

**Cas d'usage:** Encercler défaut, souligner zone problématique, annoter rapidement

### 2.4 NUAGE (CLOUD MARKUP)

**Utilisation:** Annotation professionnelle pour révisions (norme BTP).

1. Cliquer sur bouton "☁️ Nuage"
2. Tracer ellipse autour de la zone
3. Nuage en pointillés créé

**Cas d'usage:** Marquer éléments à réviser, indiquer modifications, suivi changements

### 2.5 SYMBOLES

**Bibliothèque intégrée:**

**Flèches:**
- arrow-up, arrow-down, arrow-left, arrow-right

**Construction:**
- window (🪟)
- door (🚪)
- stairs (🪜)
- wall

**Électricité:**
- power-outlet (prise)
- light (💡)
- switch (interrupteur)

**Annotations:**
- checkmark (✓)
- cross (✗)
- star (★)
- warning (⚠)
- info (ℹ)

**Utilisation:**

```javascript
// Ajouter symbole fenêtre
MarkupManager.addSymbol({ x: 300, y: 150 }, 'window');

// Créer symbole personnalisé
MarkupManager.addCustomSymbol('portail', {
    type: 'unicode',
    data: '🚧',
    category: 'custom'
});
```

**Interface:** Cliquer bouton "⭐ Symbole" → Saisir ID symbole → Positionner

---

## 3. EXPORT EXCEL

Module : `js/modules/excel-export.js`

**Dépendance:** SheetJS (cdn.sheetjs.com) - Chargé automatiquement

### 3.1 EXPORT VERS EXCEL (.xlsx)

**Accès:** Menu "💾 Exporter ▼" → "📊 Excel (.xlsx)"

**Raccourci:** `Ctrl + E`

**Contenu du fichier Excel (3 feuilles):**

#### Feuille 1: Récapitulatif
- Date export
- Nombre total mesures
- **Totaux par type** (Linéaire, Surface, Volume, Comptage)
- **Totaux par catégorie**

#### Feuille 2: Détail par plan
- Colonnes: Code | Description | Catégorie | Type | Quantité | Unité | Plan | Date création
- Triée par plan puis date
- Tous les détails de chaque mesure

#### Feuille 3: Quantitatifs (Format standard ERP)
- Colonnes: CODE | DESIGNATION | UNITE | QUANTITE | PU_HT | MONTANT_HT | CATEGORIE | PLAN | REMARQUE
- Ligne TOTAL automatique avec formule Excel
- **Compatible import ERP** (Sage, Cegid, etc.)

**Programmation:**

```javascript
// Export automatique
ExcelManager.exportMeasurements();

// Export avec nom personnalisé
ExcelManager.exportMeasurements(null, 'projet_dupont_2025.xlsx');
```

### 3.2 EXPORT CSV

**Accès:** Menu "💾 Exporter ▼" → "📄 CSV"

**Format:** CSV séparateur point-virgule (;), UTF-8 avec BOM

**Colonnes:** Code | Description | Catégorie | Type | Quantité | Unité | PU HT | Montant HT | Plan | Date

**Avantage:** Pas de dépendance externe, fonctionne toujours

**Programmation:**

```javascript
ExcelManager.exportToCSV(null, 'export_projet.csv');
```

### 3.3 IMPORT CATALOGUE FOURNISSEUR

**Accès:** Menu "💾 Exporter ▼" → "📥 Importer catalogue"

**Formats acceptés:** Excel (.xlsx, .xls), CSV (.csv)

**Structure fichier attendue:**

| CODE | DESIGNATION | UNITE | PRIX_HT | CATEGORIE |
|------|-------------|-------|---------|-----------|
| FEN001 | Fenêtre PVC 120×100 | unité | 350.00 | Menuiserie |
| POR012 | Porte bois 83×204 | unité | 280.00 | Menuiserie |

**Colonnes obligatoires:** CODE, DESIGNATION
**Colonnes optionnelles:** UNITE, PRIX_HT, CATEGORIE

**Détection automatique:** Le système détecte les variantes de noms de colonnes (ex: "Prix", "PU", "Tarif")

**Utilisation après import:**

```javascript
// Rechercher articles
const results = ExcelManager.searchInCatalogues('fenetre');
// Retourne: [{ code: 'FEN001', designation: '...', price: 350.00, ... }]

// Obtenir tous les catalogues
const catalogues = ExcelManager.getCatalogues();
```

**Stockage:** LocalStorage (persistant navigateur)

---

## 4. RAPPORTS PDF

Module : `js/modules/pdf-reports.js`

**Dépendances:** jsPDF + jsPDF-AutoTable (CDN) - Chargées automatiquement

### 4.1 GÉNÉRATION RAPPORT COMPLET

**Accès:** Menu "💾 Exporter ▼" → "📑 Rapport PDF"

**Raccourci:** `Ctrl + Shift + P`

**Contenu du rapport:**

#### Page 1: En-tête et Récapitulatif
- **Logo entreprise** (si configuré)
- Nom entreprise: JOURT Père et fils
- Coordonnées complètes
- Titre rapport: "Rapport de Métré"
- Date génération
- **Informations projet** (nom, version, date création)
- **Tableau récapitulatif** (totaux par type)

#### Page 2: Détail des Mesures
- **Tableau détaillé** de toutes les mesures
- Colonnes: N° | Code | Description | Catégorie | Type | Qté | Unité | Plan
- Mise en forme professionnelle (lignes alternées)
- Auto-pagination si > 50 mesures

#### Page 3: Totaux par Catégorie
- Tableau regroupement par catégorie
- Totaux calculés automatiquement

#### Page finale: Signatures
- Bloc "Établi par" avec date et cadre signature
- Bloc "Validé par (client)" avec date et cadre signature

**Pied de page (toutes pages):**
- Nom entreprise + date génération
- Numérotation pages (Page X / Y)

### 4.2 CONFIGURATION INFOS ENTREPRISE

**Programmation:**

```javascript
PDFReports.setCompanyInfo({
    name: 'JOURT Père et fils',
    subtitle: 'Menuiserie Bois - Artisan depuis 1985',
    address: '12 Rue du Bois, 69000 Lyon',
    phone: '04 XX XX XX XX',
    email: 'contact@jourt-menuiserie.fr',
    logo: 'data:image/png;base64,...' // Base64 ou URL
});
```

**Stockage:** LocalStorage (configuré une fois, réutilisé)

### 4.3 OPTIONS AVANCÉES

```javascript
PDFReports.generateReport(null, {
    title: 'Devis Projet Dupont - Rénovation',
    includeImages: true,           // Inclure miniatures plans
    includeSummary: true,           // Inclure récapitulatif
    includeDetails: true,           // Inclure détails
    includeSignature: true,         // Inclure blocs signature
    fileName: 'devis_dupont.pdf'
});
```

### 4.4 RAPPORT SIMPLIFIÉ (Sans AutoTable)

**Utilisation:** Si jsPDF-AutoTable non chargé

```javascript
PDFReports.generateSimpleReport(measurements, 'rapport_simple.pdf');
```

**Contenu:** En-tête + liste basique mesures (max 50)

---

## RACCOURCIS CLAVIER

| Raccourci | Action |
|-----------|--------|
| `Ctrl + E` | Export Excel |
| `Ctrl + Shift + P` | Génération rapport PDF |
| `Echap` | Annuler dessin en cours |
| `Ctrl + Z` | Annuler dernière action (à venir) |

---

## GUIDE DE DÉMARRAGE RAPIDE

### Workflow Complet

#### 1. CRÉATION PROJET

1. Clic "📂 Ouvrir Projet" ou "+ Nouveau"
2. Renseigner infos projet (nom, client, référence)
3. Valider

#### 2. CHARGEMENT PLAN

1. Clic "📄 Charger Plan"
2. Sélectionner fichier PDF ou DXF
3. Plan affiché automatiquement

#### 3. CALIBRATION

1. Clic "⚙️ Calibrer"
2. Tracer ligne sur dimension connue
3. Saisir longueur réelle (ex: 10.00 m)
4. Échelle calculée automatiquement

#### 4. MESURES

**Mesures classiques:**
- 📏 Ligne: Distance simple
- 〰️ Polyligne: Distance cumul plusieurs segments
- ▭ Rectangle: Surface rectangle
- ⬡ Polygone: Surface forme libre
- ⭕ Cercle: Surface circulaire
- 🔢 Comptage: Décompte éléments

**Mesures avancées:**

```javascript
// Volume (après mesure surfacique)
const volume = AdvancedMeasurements.convertToVolume(measurement, 0.10);

// Formule personnalisée
AdvancedMeasurements.applyFormula(measurement, 'fenetre_pvc_pose');
```

#### 5. ANNOTATIONS

- ➡️ Flèche: Indiquer zones
- 🆎 Texte: Notes et remarques
- ✏️ Libre: Encercler zones
- ☁️ Nuage: Révisions professionnelles
- ⭐ Symbole: Éléments standards

#### 6. EXPORT

**Option A: Excel**
- Menu "💾 Exporter ▼" → "📊 Excel"
- 3 feuilles générées (Récap + Détails + Quantitatifs)
- Compatible ERP

**Option B: CSV**
- Menu "💾 Exporter ▼" → "📄 CSV"
- Format simple, ouverture Excel/LibreOffice

**Option C: Rapport PDF**
- Menu "💾 Exporter ▼" → "📑 Rapport PDF"
- Rapport professionnel avec logos et signatures
- Présentation client

#### 7. IMPORT CATALOGUE (Optionnel)

1. Préparer fichier Excel/CSV avec colonnes: CODE | DESIGNATION | PRIX_HT | UNITE
2. Menu "💾 Exporter ▼" → "📥 Importer catalogue"
3. Sélectionner fichier
4. Catalogue disponible pour recherche

```javascript
// Rechercher dans catalogues
const fenêtres = ExcelManager.searchInCatalogues('fenetre');
```

---

## EXEMPLES CAS D'USAGE MENUISERIE BOIS

### CAS 1: Plancher bois (Volume)

```javascript
// 1. Mesurer surface avec Rectangle
// Result: 25.5 m²

// 2. Convertir en volume (plancher 22mm)
const volume = AdvancedMeasurements.convertToVolume(measurement, 0.022);
// Result: 0.561 m³

// 3. Calcul prix
const prixM3 = 850; // €/m³
const total = volume.value * prixM3; // 476.85 €
```

### CAS 2: Fenêtres avec formule automatique

```javascript
// Créer formule une fois
AdvancedMeasurements.createFormula({
    id: 'fenetre_standard',
    name: 'Fenêtre bois avec pose',
    calculate: function(m) {
        const surface = m.value;
        const perim = AdvancedMeasurements.calculatePerimeter(m);

        return {
            surface_fenetre: surface,
            longueur_joint: perim * 1.1, // +10% chutes
            temps_pose: 2.5, // heures
            prix_materiel: surface * 180, // €/m²
            prix_pose: 2.5 * 45 // €/h
        };
    }
});

// Appliquer à toutes les fenêtres mesurées
measurements.filter(m => m.category === 'Fenêtres').forEach(m => {
    const calc = AdvancedMeasurements.applyFormula(m, 'fenetre_standard');
    m.formulaResults = calc;
});
```

### CAS 3: Comptage portes par niveau

```javascript
// Créer groupes
const rdcId = AdvancedMeasurements.createCountGroup('Portes RDC', 'Portes', { color: '#FF0000' });
const r1Id = AdvancedMeasurements.createCountGroup('Portes R+1', 'Portes', { color: '#00FF00' });

// Assigner automatiquement
measurements.filter(m => m.type === 'count' && m.category === 'Portes').forEach(m => {
    if (m.plan_id === 'rdc') {
        AdvancedMeasurements.addToCountGroup(rdcId, m);
    } else if (m.plan_id === 'r1') {
        AdvancedMeasurements.addToCountGroup(r1Id, m);
    }
});

// Totaux
console.log('RDC:', AdvancedMeasurements.getCountGroupTotal(rdcId));
console.log('R+1:', AdvancedMeasurements.getCountGroupTotal(r1Id));
```

### CAS 4: Export complet pour devis client

```javascript
// 1. Exporter Excel pour traitement interne
ExcelManager.exportMeasurements(null, 'projet_dupont_quantitatifs.xlsx');

// 2. Générer PDF pour client
PDFReports.setCompanyInfo({
    name: 'JOURT Père et fils',
    address: '12 Rue du Bois, 69000 Lyon',
    phone: '04 XX XX XX XX',
    logo: 'data:image/png;base64,...'
});

PDFReports.generateReport(null, {
    title: 'Devis N°2025-042 - M. Dupont',
    includeSignature: true,
    fileName: 'devis_dupont_2025_042.pdf'
});
```

---

## SUPPORT ET BUGS

**Fichiers principaux:**
- `js/modules/advanced-measurements.js` - Mesures avancées
- `js/modules/markup.js` - Annotations
- `js/modules/excel-export.js` - Export Excel
- `js/modules/pdf-reports.js` - Rapports PDF
- `js/modules/ui-handlers.js` - Interface utilisateur

**Logs:** Console navigateur (F12)

**LocalStorage utilisé:**
- `customFormulas` - Formules personnalisées
- `catalogues` - Catalogues fournisseurs importés
- `companyInfo` - Informations entreprise (PDF)

**Vérifications:**

```javascript
// Vérifier dépendances
console.log('SheetJS:', typeof XLSX !== 'undefined');
console.log('jsPDF:', typeof jsPDF !== 'undefined');

// Tester modules
console.log('AdvancedMeasurements:', typeof AdvancedMeasurements);
console.log('ExcelManager:', typeof ExcelManager);
console.log('PDFReports:', typeof PDFReports);
console.log('MarkupManager:', typeof MarkupManager);
```

---

**© 2025 JOURT Père et fils - Menuiserie Bois**
**Logiciel de Métré Pro v2.0**
