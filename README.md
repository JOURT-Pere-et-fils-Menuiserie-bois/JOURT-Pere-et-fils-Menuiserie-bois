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
- PHP 7.4+
- MySQL 5.7+ ou MariaDB 10.3+
- Apache ou Nginx

### 2. Installation

```bash
# Cloner le projet
git clone <repository-url>
cd JOURT-Pere-et-fils-Menuiserie-bois

# Créer la base de données
mysql -u root -p < database/schema.sql

# Configurer PHP
# Éditer php/config.php avec vos paramètres MySQL

# Configurer permissions
chmod -R 755 saves/ uploads/ logs/

# Lancer serveur (développement)
php -S localhost:8000
```

### 3. Premier démarrage

1. Ouvrir http://localhost:8000
2. Créer un nouveau projet
3. Charger un plan PDF
4. Calibrer l'échelle
5. Commencer à mesurer !

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
- **Base de données** : MySQL 8.0 / MariaDB 10.3+
- **Bibliothèques** : PDF.js (Mozilla)

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
│   ├── config.php        # Configuration
│   ├── api/              # API REST
│   └── classes/          # Classes métier
├── database/
│   └── schema.sql        # Schéma BDD
└── saves/                # Données persistées
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
