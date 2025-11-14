# 📐 Logiciel de Métré Pro - JOURT Père et Fils

**JOURT Père et fils - Menuiserie Bois**
50 Chemin de la Butte, 29200 BREST
📞 +33 (0)2 98 45 01 41
📧 contact@jourt.com
🌐 https://www.jourt.com

---

**Logiciel de métré professionnel pour le secteur du bâtiment**

Solution complète pour charger des plans PDF/DXF, calibrer l'échelle, effectuer des mesures précises (longueurs, surfaces, volumes), et générer des tableaux récapitulatifs avec versioning intégré et gestion des avenants.

---

## 🎯 Fonctionnalités principales

### ✅ Gestion de plans
- **Chargement PDF** : Import de plans au format PDF avec rendu haute qualité (PDF.js)
- **Chargement DXF** : Support des fichiers CAO/DXF *(en développement)*
- **Zoom & Navigation** : Zoom avant/arrière, ajustement automatique, déplacement
- **Drag & Drop** : Glisser-déposer directement les fichiers

### ✅ Calibration d'échelle
- **Calibration interactive** : Tracer une ligne sur une cote connue du plan
- **Saisie dimension réelle** : Entrer la longueur réelle (m, cm, mm)
- **Calcul automatique** : Échelle calculée automatiquement (m/pixel)
- **Sauvegarde** : Échelle enregistrée avec chaque version de plan

### ✅ Outils de mesure
- **Mesures linéaires** : Ligne simple, Polyligne (plusieurs segments)
- **Mesures de surface** : Rectangle, Polygone, Cercle avec couleurs et opacité
- **Comptage** : Placement de points numérotés

### ✅ Tableau récapitulatif
- Tableau dynamique avec édition inline
- Code article, Description, Catégorie, Quantité, Prix unitaire
- Total automatique en temps réel
- Export CSV, Excel, PDF

### ✅ Système de versioning
- Gestion multi-versions de plans
- Historique complet
- Comparaison entre versions
- Migration automatique des mesures

### ✅ Gestion des avenants
- Création automatique depuis delta de versions
- Workflow complet (Brouillon → Envoyé → Approuvé → Facturé → Payé)
- Traçabilité complète

---

## 🚀 Installation rapide

### 1. Prérequis
- **PHP 7.4+** seulement !
- ✨ **Aucune base de données requise** (système de fichiers JSON)
- Apache ou Nginx (optionnel, serveur PHP intégré suffit)

### 2. Installation

```bash
# Cloner le projet
git clone <repository-url>
cd JOURT-Pere-et-fils-Menuiserie-bois

# Télécharger PDF.js (obligatoire)
cd js/lib/
wget https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
wget https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
cd ../..

# Configurer permissions
chmod -R 755 saves/ uploads/ logs/

# C'est tout ! Lancer le serveur
php -S localhost:8000
```

### 3. Premier démarrage

1. Ouvrir **http://localhost:8000**
2. Créer un nouveau projet
3. Charger un plan PDF
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
    │       ├── plan.pdf          # Plan uploadé
    │       ├── measurements.json # Mesures
    │       └── metadata.json     # Infos version
    ├── avenants/
    │   └── avenants.json         # Avenants
    └── exports/                  # Exports CSV/Excel
```

---

## 📖 Guide d'utilisation

### Démarrage rapide

#### 1. Créer un projet
Cliquer sur **"Nouveau Projet"** et renseigner les informations

#### 2. Charger un plan
Glisser-déposer un fichier PDF ou cliquer sur **"Charger Plan"**

#### 3. Calibrer l'échelle
1. Cliquer sur **"Calibrer"** (⚙️)
2. Tracer une ligne sur une cote connue
3. Entrer la longueur réelle
4. Confirmer

#### 4. Effectuer des mesures
- **Ligne** : Cliquer point de départ → point d'arrivée
- **Polyligne** : Cliquer points successifs, double-clic pour terminer
- **Rectangle** : Cliquer et glisser
- **Polygone** : Cliquer sommets, double-clic pour fermer
- **Comptage** : Cliquer pour placer points numérotés

#### 5. Exporter
Cliquer sur **"Exporter"** et choisir le format (CSV, Excel, PDF)

---

## 🔧 Architecture technique

### Stack
- **Frontend** : Vanilla JavaScript (ES6+), HTML5 Canvas + SVG, CSS3
- **Backend** : PHP 7.4+ (Standalone), REST API
- **Base de données** : ✨ **Fichiers JSON** (FlatFile - aucun serveur DB requis)
- **Bibliothèques** : PDF.js (Mozilla)

### Avantages du système FlatFile
- ✅ **Installation instantanée** : Aucune configuration DB
- ✅ **Portabilité totale** : Copiez le dossier `saves/` = backup complet
- ✅ **Lisible** : Fichiers JSON éditables manuellement
- ✅ **Backup simple** : Copie de fichiers, pas de dump SQL
- ✅ **Un projet = Un dossier** : Organisation claire

### Structure projet
```
metre-pro/
├── index.php              # Point d'entrée
├── css/                   # Styles
├── js/
│   ├── app.js            # Initialisation
│   ├── modules/          # Modules JS
│   └── lib/              # PDF.js
├── php/
│   ├── config.php        # Configuration (aucun mot de passe DB !)
│   ├── api/              # API REST
│   └── classes/          # Classes métier
│       ├── FlatFileDB.php         # Gestion fichiers JSON
│       ├── ProjectManager.php     # Gestion projets
│       ├── VersionManager.php     # Gestion versions
│       └── MeasurementManager.php # Gestion mesures
└── saves/                # Données persistées (JSON)
    └── projet_xxx/       # Un dossier par projet
```

---

## 📊 Roadmap

### Phase actuelle : MVP (v1.0) ✅
- Chargement PDF
- Calibration
- Outils mesure de base
- Tableau récapitulatif
- Export CSV

### Phase 2 (Q2 2025)
- Support DXF complet
- Comparaison visuelle versions
- Export Excel/PDF avancé

### Phase 3 (Q3 2025)
- Gestion complète avenants
- Documents DPGF/CCTP
- Templates personnalisables

### Phase 4 (Q4 2025)
- Multi-utilisateurs
- Application mobile
- API publique

---

## 📄 Licence

Copyright © 2025 JOURT Père et Fils - Menuiserie Bois
Tous droits réservés.

---

**Version** : 1.0.0 (MVP)
**Dernière mise à jour** : Janvier 2025
