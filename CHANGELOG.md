# 📋 Changelog - Logiciel de Métré Pro

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.1.0] - 2025-11-14

### ✨ Fonctionnalités ajoutées

#### 📊 Export Excel multi-feuilles
- Export Excel (.xlsx) avec 3 feuilles : Récapitulatif, Détails par plan, Quantitatifs
- Format compatible ERP avec code article, description, catégorie, quantité, P.U., total
- Import catalogues fournisseurs depuis fichiers Excel/CSV
- Fusion automatique des prix avec mesures existantes
- Nouveau module : `js/modules/excel-export.js` (508 lignes)

#### 📐 Mesures avancées
- **Calculs volumétriques** : Surface × épaisseur pour volumes (m³)
- **Formules personnalisées** : Système de calculs réutilisables (désactivé Bug #1)
- **Comptage groupé** : Organisation des comptages par catégories
- **Calculs utilitaires** : Périmètre, dimensions automatiques
- Nouveau module : `js/modules/advanced-measurements.js` (419 lignes)

#### 🖊️ Annotations professionnelles (Markup)
- **Flèches** : Annotations directionnelles avec pointes automatiques
- **Textes** : Annotations textuelles avec fond lisible
- **Dessin libre** : Tracés à main levée
- **Nuages** : Marques de révision professionnelles
- **Symboles** : Bibliothèque symboles construction/électricité
- Nouveau module : `js/modules/markup.js` (662 lignes)

#### 📑 Rapports PDF professionnels
- Export PDF avec en-tête entreprise personnalisé (logo + coordonnées)
- Tableaux formatés avec récapitulatifs et totaux par catégorie
- Blocs signature pour validation client/entreprise
- Pagination automatique multi-pages avec numérotation
- Nouveau module : `js/modules/pdf-reports.js` (461 lignes)

#### 🎨 Interface utilisateur
- Menu déroulant export avec 4 options (Excel, CSV, PDF, Import catalogue)
- Barre d'outils annotations avec 5 outils markup
- Gestionnaire d'événements UI avancé
- Nouveau module : `js/modules/ui-handlers.js` (196 lignes)
- Nouveau fichier CSS : `css/dropdown.css`

### 🔧 Améliorations

#### 100% Standalone
- **Migration complète CDN → Local** : Toutes les bibliothèques JavaScript maintenant locales
- **Aucune connexion internet requise** après installation
- **Versions fixes** : Pas de risque d'incompatibilité future
- Bibliothèques incluses dans git (2.7 MB total) :
  - PDF.js 3.11.174 (core + worker)
  - SheetJS 0.20.1 (Community Edition)
  - jsPDF 2.5.1
  - jsPDF AutoTable 3.5.31

#### Fichiers modifiés
- `index.php` : Chargement bibliothèques local, nouveaux boutons export/markup
- `js/modules/pdf-loader.js` : Worker PDF.js en local (ligne 23)
- `.gitignore` : Bibliothèques JS maintenant commitées

### 🐛 Bugs corrigés (10/20)

#### Bugs critiques
- **Bug #1** : Formules localStorage avec functions non sérialisables → Désactivé temporairement
- **Bug #2** : `getBBox()` appelé avant insertion DOM → Ordre inversé (drawing.js, markup.js)
- **Bug #3** : `onclick` inline (violation CSP) → Remplacé par `addEventListener` (table.js)
- **Bug #4** : CalibrationManager appelé sans vérification → Ajout `checkCalibration()` (tools.js)
- **Bug #5** : PDFLoader/DXFLoader sans typeof check → Ajout vérification (plan-manager.js:150)
- **Bug #8** : Curseur reste en croix après annulation calibration → Reset `cursor: default` (calibration.js:226)
- **Bug #10** : Collision IDs mesures/markups → Préfixes 'meas-' et 'mark-' (tools.js, markup.js)

#### Bugs moyens
- **Bug #12** : Export CSV utilisait point-virgule au lieu de virgule → Changé séparateur (table.js)
- **Bug #13** : Validation données utilisateur absente → Ajout parseFloat avec restoration (table.js)
- **Bug #14** : `updateTotal()` appelé trop souvent → Debounce 300ms (table.js)

Voir **[BUGS_CORRIGES.md](BUGS_CORRIGES.md)** pour détails complets avec code avant/après.

### 📚 Documentation

#### Ajoutés
- `FONCTIONNALITES_AVANCEES.md` (651 lignes) : Guide complet des 4 modules avancés
- `ANALYSE_MARCHE_CONCURRENCE.md` (610 lignes) : Analyse marché et 10+ concurrents
- `VERIFICATION-CHEMINS.md` (341 lignes) : Rapport vérification migration CDN→Local
- `INSTRUCTION_TELECHARGEMENT_LIBS.md` : Instructions téléchargement manuel bibliothèques
- `CHANGELOG.md` : Ce fichier
- `BUGS_CORRIGES.md` : Liste détaillée bugs corrigés

#### Mis à jour
- `README.md` : Réécriture complète (394 lignes)
  - Toutes fonctionnalités actuelles
  - Instructions installation avec téléchargement manuel
  - Architecture modulaire détaillée
  - Bugs corrigés
  - Roadmap Phase 1.1
  - Sécurité, raccourcis, documentation

#### Supprimés (nettoyage)
- `setup-libraries.sh` : Inutile (Docker bloque CDN)
- `TELECHARGER_LIBS.md` : Redondant avec INSTRUCTION_TELECHARGEMENT_LIBS.md
- `ANALYSE_COMPLETE.md` (539 lignes)
- `RAPPORT_ANALYSE_COMPLETE.md` (668 lignes)
- `ARCHITECTURE_REFONTE_VERSIONS.md` (1,217 lignes)
- `AUDIT_INTERFACE.md` (203 lignes)
- `CORRECTIONS_CRITIQUES.md` (446 lignes)
- `STRUCTURE_COMPLETE.md` (414 lignes)
- `TESTS_COMPLETS.md` (376 lignes)
- `INSTALLATION.md` (256 lignes)

**Total supprimé** : 4,119 lignes de documentation obsolète

### 🗂️ Structure

#### Ajoutés au git
- `logs/.gitkeep` : Dossier logs tracké
- `saves/.gitkeep` : Dossier saves tracké
- `uploads/.gitkeep` : Dossier uploads tracké
- `js/lib/*.js` et `*.mjs` : Bibliothèques JavaScript (2.7 MB)

---

## [1.0.0] - 2025-01-15

### ✨ Fonctionnalités MVP

#### Gestion de plans multi-étages
- Multi-plans par version (RDC, R+1, R+2, Combles, personnalisé)
- Chargement PDF avec rendu haute qualité (PDF.js 3.11.174)
- Chargement DXF support complet CAO (LINE, CIRCLE, ARC, POLYLINE)
- Zoom & Navigation (zoom avant/arrière, ajustement auto, déplacement)
- Drag & Drop direct des fichiers

#### Calibration d'échelle
- Calibration interactive (tracer ligne sur cote connue)
- Saisie dimension réelle (m, cm, mm)
- Calcul automatique échelle (m/pixel)
- Sauvegarde par plan

#### Outils de mesure standards
- **Mesures linéaires** : Ligne simple, Polyligne (plusieurs segments)
- **Mesures de surface** : Rectangle, Polygone, Cercle avec couleurs et opacité
- **Comptage** : Placement de points numérotés

#### Système de versioning
- Multi-versions avec historique complet des modifications
- Multi-plans par version (1 version = N plans)
- Mesures par plan (organisation claire et isolée)
- Gestion des avenants avec workflow (Brouillon → Envoyé → Approuvé → Facturé → Payé)

#### Tableau récapitulatif
- Édition inline avec validation des données
- Colonnes : Code article, Description, Catégorie, Quantité, Prix unitaire
- Total automatique en temps réel
- Tri et filtrage

#### Export CSV
- Format standard compatible Excel/LibreOffice
- Simple et léger sans dépendances

### 🏗️ Architecture

#### Backend
- PHP 7.4+ Standalone
- REST API (GET/POST/PUT/DELETE)
- **Stockage FlatFile** : Fichiers JSON (aucune base de données requise)

#### Frontend
- Vanilla JavaScript ES6+ avec Revealing Module Pattern
- HTML5 Canvas + SVG (dual-layer rendering)
- CSS3
- Système événements PubSub pour communication découplée

#### Modules créés (17)
- `app.js` : Point d'entrée
- `modules/pubsub.js` : Système événements
- `modules/storage.js` : API REST
- `modules/pdf-loader.js` : Chargement PDF
- `modules/dxf-loader.js` : Chargement DXF (parser natif)
- `modules/calibration.js` : Calibration échelle
- `modules/drawing.js` : Rendu mesures SVG
- `modules/tools.js` : Outils de mesure
- `modules/layers.js` : Gestion calques
- `modules/table.js` : Tableau récapitulatif
- `modules/versioning.js` : Versions
- `modules/plan-manager.js` : Multi-plans
- `modules/export.js` : Export CSV
- `modules/project-selector.js` : Sélection projets
- `modules/info-panel.js` : Panneau infos
- `modules/auto-save.js` : Sauvegarde auto (30s)
- `modules/shortcuts.js` : Raccourcis clavier

### 🔐 Sécurité

- Validation données côté serveur ET client
- Pas d'exécution de code arbitraire (eval désactivé)
- Content Security Policy compatible
- Sanitization des inputs
- .htaccess sur dossiers sensibles

### ⌨️ Raccourcis clavier

- **Ctrl + S** : Sauvegarder
- **Escape** : Annuler action en cours
- **Delete** : Supprimer sélection

---

## Format des versions

- **MAJOR** : Changements incompatibles de l'API
- **MINOR** : Nouvelles fonctionnalités rétrocompatibles
- **PATCH** : Corrections de bugs rétrocompatibles

---

**Légende** :
- ✨ Fonctionnalités ajoutées
- 🔧 Améliorations
- 🐛 Bugs corrigés
- 📚 Documentation
- 🗂️ Structure
- 🔐 Sécurité
- ⌨️ Interface

---

**Développé par** : JOURT Père et Fils - Menuiserie Bois
**Contact** : contact@jourt.com
**Site web** : https://www.jourt.com
