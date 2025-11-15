# 📐 Logiciel de Métré Pro - JOURT Père et Fils

**JOURT Père et fils - Menuiserie Bois**
50 Chemin de la Butte, 29200 BREST
📞 +33 (0)2 98 45 01 41
📧 contact@jourt.com
🌐 https://www.jourt.com

---

**Logiciel de métré professionnel pour le secteur du bâtiment**

Solution 100% STANDALONE pour charger des plans PDF/DXF, calibrer l'échelle, effectuer des mesures précises (longueurs, surfaces, volumes), annoter les plans, et générer des exports Excel/PDF avec versioning intégré et gestion multi-plans.

✨ **Aucune connexion internet requise après installation**
✨ **Aucune base de données requise** (stockage fichiers JSON)
✨ **Bibliothèques JavaScript incluses** (versions fixes)

---

## 🎯 Fonctionnalités principales

### ✅ Gestion de plans multi-étages
- **Multi-plans par version** : RDC, R+1, R+2, Combles, etc.
- **Chargement PDF** : Import de plans PDF avec rendu haute qualité (PDF.js 3.11.174)
- **Chargement DXF** : Support complet des fichiers CAO (LINE, CIRCLE, ARC, POLYLINE)
- **Zoom & Navigation** : Zoom avant/arrière, ajustement automatique, déplacement
- **Drag & Drop** : Glisser-déposer directement les fichiers

### ✅ Calibration d'échelle
- **Calibration interactive** : Tracer une ligne sur une cote connue du plan
- **Saisie dimension réelle** : Entrer la longueur réelle (m, cm, mm)
- **Calcul automatique** : Échelle calculée automatiquement (m/pixel)
- **Sauvegarde par plan** : Chaque plan a sa propre calibration

### ✅ Outils de mesure standards
- **Mesures linéaires** : Ligne simple, Polyligne (plusieurs segments)
- **Mesures de surface** : Rectangle, Polygone, Cercle avec couleurs et opacité
- **Comptage** : Placement de points numérotés

### 🆕 Outils de mesure avancés
- **Calculs volumétriques** : Surface × épaisseur pour volumes (m³)
- **Formules personnalisées** : Créer des calculs réutilisables
- **Comptage groupé** : Organiser comptages par catégories
- **Calculs utilitaires** : Périmètre, dimensions automatiques

### 🆕 Annotations professionnelles (Markup)
- **Flèches** : Annotations directionnelles avec pointes automatiques
- **Textes** : Annotations textuelles avec fond lisible
- **Dessin libre** : Tracés à main levée
- **Nuages** : Marques de révision professionnelles
- **Symboles** : Bibliothèque de symboles construction/électricité

### ✅ Exports professionnels

#### 📊 Export Excel (.xlsx)
- **Multi-feuilles** : Récapitulatif + Détails + Quantitatifs
- **Format ERP** : Compatible logiciels de gestion
- **Import catalogues** : Charger prix fournisseurs depuis Excel/CSV

#### 📑 Export PDF
- **Rapports professionnels** : En-tête entreprise avec logo
- **Tableaux formatés** : Récapitulatifs et totaux par catégorie
- **Blocs signature** : Zones pour validation client/entreprise
- **Pagination automatique** : Multi-pages avec numérotation

#### 📄 Export CSV
- **Format standard** : Compatible Excel/LibreOffice
- **Simple et léger** : Pas de dépendances

### ✅ Système de versioning
- **Multi-versions** : Historique complet des modifications
- **Multi-plans par version** : 1 version = N plans (RDC, R+1, R+2...)
- **Mesures par plan** : Organisation claire et isolée
- **Gestion des avenants** : Workflow complet (Brouillon → Envoyé → Approuvé → Facturé → Payé)

### ✅ Tableau récapitulatif
- Édition inline avec validation des données
- Code article, Description, Catégorie, Quantité, Prix unitaire
- Total automatique en temps réel (avec debounce pour performance)
- Tri et filtrage

---

## 🚀 Installation rapide

### 1. Prérequis
- **PHP 7.4+** uniquement !
- ✨ **Aucune base de données requise** (système fichiers JSON)
- Apache ou Nginx (optionnel, serveur PHP intégré suffit)

### 2. Cloner le projet

```bash
git clone <repository-url>
cd JOURT-Pere-et-fils-Menuiserie-bois
```

### 3. Vérifier les permissions

✅ **Toutes les bibliothèques JavaScript sont déjà incluses dans le repository !**

Les 5 bibliothèques (2.7 MB total) sont dans `js/lib/` :
- PDF.js 3.11.174 (core + worker)
- SheetJS 0.20.1
- jsPDF 2.5.1 + AutoTable 3.5.31

**Aucun téléchargement requis !**

### 4. Permissions

```bash
chmod -R 755 saves/ uploads/ logs/
```

### 5. Lancer le serveur

```bash
php -S localhost:8000
```

### 6. Premier démarrage

1. Ouvrir **http://localhost:8000**
2. Créer un nouveau projet
3. Ajouter un plan (RDC, R+1, etc.)
4. Calibrer l'échelle
5. Commencer à mesurer !

**Structure automatique créée :**
```
saves/
└── projet_20250115_143022_a3f8/
    ├── project.json              # Métadonnées projet
    ├── versions/
    │   ├── versions.json         # Liste versions
    │   └── v001/
    │       ├── plans/            # Plans de cette version
    │       │   ├── plan_rdc_xxx.pdf
    │       │   ├── plan_r1_xxx.pdf
    │       │   └── plan_r2_xxx.pdf
    │       ├── measurements.json # Mesures par plan
    │       └── metadata.json     # Infos version
    ├── avenants/
    │   └── avenants.json         # Avenants
    └── exports/                  # Exports CSV/Excel/PDF
```

---

## 📖 Guide d'utilisation

### Démarrage rapide

#### 1. Créer un projet
Cliquer sur **"+ Nouveau Projet"** et renseigner :
- Nom du projet
- Nom du client
- Référence contrat
- Adresse

#### 2. Ajouter un plan
1. Cliquer sur **"➕"** à côté du sélecteur de plans
2. Choisir le niveau (RDC, R+1, R+2, Combles, ou personnalisé)
3. Sélectionner le fichier PDF ou DXF
4. Confirmer

#### 3. Calibrer l'échelle
1. Sélectionner le plan dans le dropdown
2. Cliquer sur **"⚙️ Calibrer"**
3. Tracer une ligne sur une cote connue
4. Entrer la longueur réelle (ex: 10.50 m)
5. Confirmer

#### 4. Effectuer des mesures
- **Ligne** : Cliquer point départ → point arrivée
- **Polyligne** : Cliquer points successifs, double-clic pour terminer
- **Rectangle** : Cliquer et glisser
- **Polygone** : Cliquer sommets, double-clic pour fermer
- **Cercle** : Cliquer centre, puis rayon
- **Comptage** : Cliquer pour placer points numérotés

#### 5. Annoter (Markup)
- **Flèche** : Pointer éléments importants
- **Texte** : Ajouter notes textuelles
- **Libre** : Dessiner à main levée
- **Nuage** : Marquer zones de révision
- **Symbole** : Insérer symboles standards

#### 6. Éditer le tableau
- Double-cliquer cellules pour éditer
- Ajouter code article, description, prix
- Totaux calculés automatiquement

#### 7. Exporter
1. Cliquer sur **"💾 Exporter ▼"**
2. Choisir le format :
   - **📊 Excel** : Multi-feuilles avec récapitulatif
   - **📄 CSV** : Format simple et universel
   - **📑 PDF** : Rapport professionnel avec tableaux

---

## 🔧 Architecture technique

### Stack
- **Frontend** : Vanilla JavaScript (ES6+), HTML5 Canvas + SVG, CSS3
- **Backend** : PHP 7.4+ (Standalone), REST API
- **Stockage** : ✨ **Fichiers JSON** (FlatFile - aucun serveur DB requis)
- **Bibliothèques** :
  - PDF.js 3.11.174 (Mozilla)
  - SheetJS 0.20.1 (Community Edition)
  - jsPDF 2.5.1 + AutoTable 3.5.31

### Avantages du système FlatFile
- ✅ **Installation instantanée** : Aucune configuration DB
- ✅ **Portabilité totale** : Copiez `saves/` = backup complet
- ✅ **Lisible** : Fichiers JSON éditables manuellement
- ✅ **Backup simple** : Copie de fichiers, pas de dump SQL
- ✅ **Un projet = Un dossier** : Organisation claire
- ✅ **100% Standalone** : Pas de connexion internet requise

### Architecture modulaire (Revealing Module Pattern + PubSub)
```
js/
├── app.js                          # Point d'entrée
├── modules/
│   ├── pubsub.js                   # Système événements
│   ├── storage.js                  # API REST
│   ├── pdf-loader.js               # Chargement PDF
│   ├── dxf-loader.js               # Chargement DXF (parser natif)
│   ├── calibration.js              # Calibration échelle
│   ├── drawing.js                  # Rendu mesures SVG
│   ├── tools.js                    # Outils de mesure
│   ├── layers.js                   # Gestion calques
│   ├── table.js                    # Tableau récapitulatif
│   ├── versioning.js               # Versions
│   ├── plan-manager.js             # Multi-plans
│   ├── export.js                   # Export CSV
│   ├── project-selector.js         # Sélection projets
│   ├── info-panel.js               # Panneau infos
│   ├── auto-save.js                # Sauvegarde auto
│   ├── shortcuts.js                # Raccourcis clavier
│   ├── advanced-measurements.js    # Mesures avancées (volume, formules)
│   ├── markup.js                   # Annotations professionnelles
│   ├── excel-export.js             # Export Excel multi-feuilles
│   ├── pdf-reports.js              # Rapports PDF
│   └── ui-handlers.js              # Gestion UI avancée
└── lib/                            # Bibliothèques locales (2.7 MB)
    ├── pdf.min.mjs
    ├── pdf.worker.min.mjs
    ├── xlsx.full.min.js
    ├── jspdf.umd.min.js
    └── jspdf.plugin.autotable.min.js
```

### Système d'événements (PubSub)
Communication découplée entre modules :
```javascript
// Publier
PubSub.publish(EVENTS.MEASUREMENT_CREATED, { measurement });

// S'abonner
PubSub.subscribe(EVENTS.MEASUREMENT_CREATED, function(data) {
    // Réagir à l'événement
});
```

---

## 🐛 Bugs corrigés (v1.1)

### Bugs critiques
- ✅ **#1** : Formules localStorage avec functions non sérialisables
- ✅ **#2** : getBBox() appelé avant insertion DOM (crash Firefox)
- ✅ **#3** : onclick inline (violation CSP)
- ✅ **#4** : CalibrationManager appelé sans vérification
- ✅ **#5** : PDFLoader/DXFLoader sans typeof check
- ✅ **#8** : Curseur reste en croix après annulation calibration
- ✅ **#10** : Collision IDs mesures/markups

### Bugs moyens
- ✅ **#12** : Export CSV utilisait point-virgule au lieu de virgule
- ✅ **#13** : Validation données utilisateur absente (inputs numériques)
- ✅ **#14** : updateTotal() appelé trop souvent (debounce 300ms)

Voir **[BUGS_CORRIGES.md](BUGS_CORRIGES.md)** pour détails complets.

---

## 📊 Roadmap

### ✅ Phase 1 : MVP (v1.0)
- Chargement PDF/DXF
- Calibration
- Outils mesure de base
- Tableau récapitulatif
- Export CSV
- Versioning
- Multi-plans

### ✅ Phase 1.1 : Fonctionnalités avancées (ACTUEL)
- ✅ Mesures volumétriques
- ✅ Annotations markup (flèches, texte, nuages, symboles)
- ✅ Export Excel multi-feuilles
- ✅ Rapports PDF professionnels
- ✅ Import catalogues fournisseurs
- ✅ 100% Standalone (pas de CDN)
- ✅ 10 bugs critiques/moyens corrigés

### Phase 2 : Optimisations (Q1 2025)
- Système de notifications toast (remplacer alerts)
- Undo/Redo
- Pagination tableau (>100 mesures)
- Comparaison visuelle versions
- Templates personnalisables

### Phase 3 : Avancé (Q2-Q3 2025)
- Gestion complète avenants avec workflow
- Documents DPGF/CCTP automatiques
- Accessibilité (WCAG AA)
- Mode hors-ligne complet (PWA)

### Phase 4 : Entreprise (Q4 2025)
- Multi-utilisateurs
- Application mobile
- API publique
- Intégration ERP

---

## 🔐 Sécurité

- ✅ Validation données côté serveur ET client
- ✅ Pas d'exécution de code arbitraire (eval désactivé)
- ✅ Content Security Policy compatible
- ✅ Sanitization des inputs
- ✅ .htaccess sur dossiers sensibles
- ✅ Pas de fonctions inline (addEventListener uniquement)

---

## ⌨️ Raccourcis clavier

- **Ctrl + S** : Sauvegarder
- **Ctrl + E** : Export Excel
- **Ctrl + Shift + P** : Export PDF
- **Escape** : Annuler action en cours
- **Delete** : Supprimer sélection

---

## 📚 Documentation

- **[README.md](README.md)** : Ce fichier (documentation principale)
- **[CHANGELOG.md](CHANGELOG.md)** : Historique des versions et modifications
- **[BUGS_CORRIGES.md](BUGS_CORRIGES.md)** : Documentation détaillée des bugs corrigés
- **[FONCTIONNALITES_AVANCEES.md](FONCTIONNALITES_AVANCEES.md)** : Guide complet des 4 modules avancés
- **[js/lib/README.md](js/lib/README.md)** : Documentation des bibliothèques JavaScript incluses

---

## 📄 Licence

Copyright © 2025 JOURT Père et Fils - Menuiserie Bois
Tous droits réservés.

---

**Version** : 1.1.1 (Production-ready)
**Dernière mise à jour** : 15 Novembre 2025
**Bugs corrigés** : 10/20 critiques/moyens
**Taille totale** : 2.7 MB (bibliothèques incluses)
