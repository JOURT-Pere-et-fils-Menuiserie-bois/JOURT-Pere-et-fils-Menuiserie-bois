# 🎮 PIP-BOY SURVIVAL AI

> *"War. War never changes. But your survival knowledge base can."*

Application PWA complète de survivalisme avec IA locale, style **Pip-Boy de Fallout**. Fonctionne 100% **OFFLINE** - parfaite pour l'apocalypse! 🧟☢️

![Version](https://img.shields.io/badge/version-3.0.0-green.svg)
![PHP](https://img.shields.io/badge/PHP-8.1%2B-777BB4.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg)
![Offline](https://img.shields.io/badge/Offline-100%25-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Technologies](#-technologies)
- [Modules](#-modules)
- [IA Locale](#-ia-locale)
- [PWA & Offline](#-pwa--offline)

---

## ✨ Fonctionnalités

### 🤖 IA 100% Locale

- **LLM local** (Phi-2 2.7B quantisé) qui tourne dans le navigateur
- **Recherche vectorielle sémantique** avec embeddings
- **Génération de code** (Python, JavaScript, Bash, etc.)
- **Réponses contextuelles** basées sur vos PDFs
- **Pas de cloud, pas de connexion nécessaire**

### 📄 Base de Documents

- Upload et indexation automatique de **PDFs**
- Extraction de texte avec **OCR** (Tesseract.js)
- **Chunking intelligent** pour meilleure recherche
- Génération automatique d'**embeddings vectoriels**
- Organisation par **catégories** (eau, nourriture, abri, médical, etc.)

### 🎨 Interface Pip-Boy

- Design **rétro-futuriste** inspiré de Fallout
- Couleur **phosphorescent green** (#00ff00)
- Effets **CRT** : scanlines, flicker, glow
- **Responsive** : du smartphone au desktop
- **Mode économie batterie** automatique
- **Mode e-ink** pour mini-écrans

### 🔌 Modules Extensibles

1. **STAT** - Statistiques système (batterie, stockage, etc.)
2. **DATA** - Recherche IA dans la base de connaissances
3. **MAP** - Cartes offline et géolocalisation
4. **INV** - Gestion des documents et PDFs
5. **RADIO** - Notes personnelles et journal de bord

### 📱 PWA Complète

- **Installable** sur iOS, Android, Raspberry Pi
- **Offline-first** avec Service Worker
- **Cache intelligent** des ressources
- **Background sync** (optionnel)
- **Fonctionne sans connexion** après installation

### ⚡ Optimisations Batterie

- Détection automatique du niveau de batterie
- **Power Save Mode** (< 20%)
- **E-Ink Mode** (< 10%)
- Désactivation progressive des animations

---

## 🏗️ Architecture

```
pip-survival/
├── index.php                 # Point d'entrée
├── manifest.json            # PWA manifest
├── sw.js                    # Service Worker
│
├── api/                     # Backend PHP
│   ├── bootstrap.php
│   ├── router.php
│   ├── controllers/
│   ├── models/
│   └── services/
│
├── assets/
│   ├── css/                 # Styles Pip-Boy
│   ├── js/
│   │   ├── app.js           # Application principale
│   │   ├── ai-engine.js     # Moteur IA local
│   │   ├── vector-search.js # Recherche vectorielle
│   │   └── modules/         # Search, CodeGen, Docs, Radio, Map
│   └── images/icons/
│
├── data/
│   ├── database.sqlite      # Base de données locale
│   ├── pdfs/                # Documents de survie
│   └── models/              # Modèles IA
│
└── install/                 # Scripts d'installation
    ├── raspberry-pi.sh
    ├── android-setup.md
    └── ios-setup.md
```

### Stack Technique

**Backend :**
- PHP 8.1+ (serveur léger intégré)
- SQLite 3 (base de données locale)
- Poppler-utils (extraction PDF)

**Frontend :**
- HTML5 + CSS3 (Pip-Boy design)
- Vanilla JavaScript ES6+
- IndexedDB (stockage local)
- Service Worker (cache offline)

**IA :**
- WebLLM / Transformers.js
- Phi-2 (2.7B params, ~1.5GB)
- all-MiniLM-L6-v2 (embeddings, ~80MB)
- Cosine similarity

---

## 🚀 Installation

### Raspberry Pi

```bash
# Cloner le repo
git clone https://github.com/votre-username/pip-survival.git
cd pip-survival

# Exécuter le script d'installation
chmod +x install/raspberry-pi.sh
./install/raspberry-pi.sh

# Démarrer le serveur
php -S 0.0.0.0:8080
```

### Linux / macOS

```bash
# Installer PHP et SQLite
sudo apt install php8.1 php8.1-sqlite3 sqlite3 poppler-utils  # Debian/Ubuntu
brew install php sqlite poppler                                 # macOS

# Cloner et démarrer
git clone https://github.com/votre-username/pip-survival.git
cd pip-survival
php -S localhost:8080
```

---

## 📖 Utilisation

### 1. Démarrer le serveur

```bash
php -S 0.0.0.0:8080
```

### 2. Accéder depuis un navigateur

```
http://localhost:8080
```

### 3. Installer la PWA

**Sur mobile :**
1. Ouvrir l'URL dans le navigateur
2. Menu > "Ajouter à l'écran d'accueil"
3. L'app s'installe et fonctionne offline!

### 4. Uploader des PDFs

1. Aller dans **INV** (Inventory)
2. Cliquer **UPLOAD PDF**
3. Sélectionner un PDF de survie
4. Attendre l'indexation automatique

### 5. Rechercher

1. Aller dans **DATA**
2. Taper une question : *"Comment purifier l'eau?"*
3. Appuyer **SEARCH**
4. L'IA analyse et répond!

---

## 🛠️ Technologies

| Tech | Version | Usage |
|------|---------|-------|
| PHP | 8.1+ | API REST |
| SQLite | 3.x | Base de données |
| JavaScript ES6+ | - | Application logique |
| IndexedDB | - | Stockage local |
| Service Worker | - | Cache offline |
| Phi-2 | q4 (~1.5GB) | LLM local |
| all-MiniLM-L6-v2 | ~80MB | Embeddings |

---

## 🎛️ Modules

### STAT - Statistiques
- Nombre de documents
- Espace stockage
- Niveau batterie
- Statut offline

### DATA - Recherche IA
- Recherche sémantique
- Génération de code
- Réponses contextuelles

### MAP - Carte
- Position GPS
- Cartes offline

### INV - Inventaire
- Upload PDFs
- Gestion documents

### RADIO - Notes
- Journal de bord
- Notes personnelles

---

## 🤖 IA Locale

### Architecture

```
User Query → Embedding → Vector Search → Context → LLM → Response
```

### Modèles

**LLM : Phi-2**
- 2.7B paramètres
- Quantisé 4-bit → ~1.5GB
- Tourne dans le navigateur

**Embeddings : all-MiniLM-L6-v2**
- 384 dimensions
- ~80MB
- Rapide et efficace

---

## 📱 PWA & Offline

### Service Worker

- **Cache-First** pour assets statiques
- **Network-First** pour API
- Fonctionne 100% offline après installation

### Stockage (~2GB total)

- Cache : ~20MB
- Documents : ~50-200MB
- Vectors : ~100-500MB
- Modèles IA : ~1.5GB

---

## 🔋 Économie d'Énergie

**Modes automatiques :**
- Normal (> 20%)
- Power Save (< 20%)
- E-Ink (< 10%)

---

## 🛡️ Sécurité

✅ 100% Local
✅ Pas de tracking
✅ Pas de cloud
✅ Open Source

---

## 📄 License

MIT License - Copyright (c) 2024

---

<div align="center">

**🎮 Stay Safe, Vault Dweller! ☢️**

Made with 💚 for the Post-Apocalypse

</div>
