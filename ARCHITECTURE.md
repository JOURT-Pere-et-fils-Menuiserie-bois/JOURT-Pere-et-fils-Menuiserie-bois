# 🎮 PIP-SURVIVAL - Architecture Complète

## 📋 Vue d'ensemble

Application PWA de survivalisme avec IA locale, style Pip-Boy de Fallout, fonctionnant 100% OFFLINE.

---

## 🏗️ Stack Technique (100% OFFLINE)

### Backend
- **PHP 8.1+** : Backend API REST
- **SQLite 3** : Base de données locale avec recherche vectorielle custom
- **Built-in PHP Server** : Serveur léger pour dev/déploiement

### Frontend
- **HTML5 + CSS3** : Interface Pip-Boy rétro-futuriste
- **Vanilla JavaScript (ES6+)** : Pas de framework lourd, performances optimales
- **IndexedDB** : Stockage local des embeddings et documents
- **Service Worker** : Cache offline-first complet

### IA Locale
- **WebLLM (TensorFlow.js)** : LLM dans le navigateur (Phi-2, Gemma-2B)
- **Alternative** : GGUF via WebAssembly (llama.cpp compilé)
- **Embeddings** : all-MiniLM-L6-v2 (lightweight, 80MB)
- **Recherche vectorielle** : Cosine similarity en JS

### Traitement PDF
- **pdf.js** : Extraction de texte côté client
- **Tesseract.js** : OCR pour PDFs scannés (optionnel)

---

## 📁 Structure de l'Application

```
pip-survival/
├── index.php                    # Point d'entrée principal
├── manifest.json                # PWA manifest
├── sw.js                        # Service Worker
│
├── api/                         # Backend PHP
│   ├── bootstrap.php            # Init app
│   ├── router.php               # Routeur API
│   ├── controllers/
│   │   ├── DocumentController.php
│   │   ├── SearchController.php
│   │   ├── AIController.php
│   │   └── ModuleController.php
│   ├── models/
│   │   ├── Database.php
│   │   ├── Document.php
│   │   ├── Vector.php
│   │   └── Module.php
│   └── services/
│       ├── PDFExtractor.php
│       ├── VectorSearch.php
│       └── AIService.php
│
├── assets/
│   ├── css/
│   │   ├── pipboy.css          # Style principal Pip-Boy
│   │   ├── modules.css         # Styles des modules
│   │   └── animations.css      # Effets CRT, scanlines
│   ├── js/
│   │   ├── app.js              # Application principale
│   │   ├── ai-engine.js        # Moteur IA local
│   │   ├── vector-search.js    # Recherche vectorielle
│   │   ├── pdf-processor.js    # Traitement PDFs
│   │   ├── modules/
│   │   │   ├── search.js       # Module recherche
│   │   │   ├── codegen.js      # Générateur code
│   │   │   ├── docs.js         # Viewer documents
│   │   │   ├── radio.js        # Module radio
│   │   │   └── map.js          # Module carte
│   │   └── utils/
│   │       ├── battery.js      # Optimisation batterie
│   │       ├── storage.js      # Gestion IndexedDB
│   │       └── offline.js      # Gestion offline
│   ├── fonts/
│   │   └── vt323.woff2         # Font monospace rétro
│   ├── sounds/
│   │   ├── click.mp3
│   │   └── startup.mp3
│   └── images/
│       ├── icons/              # Icônes PWA
│       └── scanlines.png       # Texture CRT
│
├── data/
│   ├── database.sqlite         # DB SQLite
│   ├── pdfs/                   # Documents survivalisme
│   │   ├── water-purification.pdf
│   │   ├── first-aid.pdf
│   │   ├── shelter-building.pdf
│   │   ├── food-preservation.pdf
│   │   ├── navigation.pdf
│   │   └── wild-edibles.pdf
│   └── models/                 # Modèles IA locaux
│       └── phi2-quantized.gguf # LLM quantisé (2GB)
│
└── install/
    ├── raspberry-pi.sh         # Script install RPi
    ├── android-setup.md        # Guide Android
    └── ios-setup.md            # Guide iOS
```

---

## 🎨 Interface Pip-Boy

### Design
- **Couleur principale** : Phosphorescent green (#00ff00, #33ff33)
- **Background** : Dark gray/black (#0a0a0a, #1a1a1a)
- **Font** : VT323 (monospace rétro)
- **Effets** :
  - Scanlines CRT
  - Text glow/shadow
  - Flicker animation subtil
  - Noise texture

### Modules (Navigation Tab)
1. **STAT** (Status)
   - Statistiques système
   - Batterie, stockage
   - Statut offline

2. **DATA** (Database)
   - Recherche IA dans documents
   - Viewer PDFs
   - Générateur de code

3. **MAP** (Carte)
   - Cartes offline
   - GPS si disponible
   - Points d'intérêt

4. **INV** (Inventory)
   - Gestion documents
   - Upload nouveaux PDFs
   - Organisation

5. **RADIO**
   - Communication (si réseau)
   - Notes personnelles
   - Journal de bord

---

## 🧠 Système IA Local

### LLM Local
**Option 1 : WebLLM (Recommandé)**
```javascript
// Phi-2 (2.7B params, quantisé 4-bit = ~1.5GB)
// Fonctionne dans le navigateur via WebGPU/WebGL
import { ChatModule } from '@mlc-ai/web-llm';

const model = new ChatModule();
await model.reload("Phi2-q4f32_1");
```

**Option 2 : GGUF via WASM**
```javascript
// llama.cpp compilé en WebAssembly
// Plus léger mais moins performant
```

### Embeddings Local
```javascript
// all-MiniLM-L6-v2 via Transformers.js
import { pipeline } from '@xenova/transformers';
const embedder = await pipeline('feature-extraction',
  'Xenova/all-MiniLM-L6-v2');
```

### Recherche Vectorielle
```javascript
// Cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}
```

---

## 💾 Stockage Offline

### IndexedDB Structure
```javascript
const db = {
  documents: {
    keyPath: 'id',
    indexes: ['title', 'category', 'date']
  },
  vectors: {
    keyPath: 'id',
    indexes: ['doc_id', 'chunk_id']
  },
  chunks: {
    keyPath: 'id',
    indexes: ['doc_id', 'page']
  },
  cache: {
    keyPath: 'key',
    indexes: ['timestamp']
  }
};
```

### Service Worker Cache Strategy
```javascript
// Cache-first pour assets statiques
// Network-first pour API avec fallback
// Background sync pour uploads
```

---

## 🔌 Système de Modules Extensibles

### API Module
```javascript
class PipBoyModule {
  constructor(id, name, icon) {
    this.id = id;
    this.name = name;
    this.icon = icon;
  }

  async init() {}
  async render() {}
  async onActivate() {}
  async onDeactivate() {}
}
```

### Modules Inclus
1. **SearchModule** : Recherche IA vectorielle
2. **CodeGenModule** : Génération code
3. **DocViewerModule** : Visualisation PDFs
4. **MapModule** : Cartes offline
5. **RadioModule** : Communication/Notes
6. **StatsModule** : Statistiques système

---

## ⚡ Optimisation Batterie

### Stratégies
1. **E-Ink Mode** : Désactive animations, réduit refresh
2. **Dark Mode** : OLED power saving
3. **Sleep Mode** : Arrêt processus background après inactivité
4. **Lazy Loading** : Charge modules à la demande
5. **Throttle Animations** : 30fps max au lieu de 60fps
6. **Wake Lock** : Évite sleep pendant opérations critiques

### Code Exemple
```javascript
// Battery API
const battery = await navigator.getBattery();
if (battery.level < 0.2) {
  enablePowerSaveMode();
}
```

---

## 📱 PWA Configuration

### Manifest.json
```json
{
  "name": "Pip-Boy Survival AI",
  "short_name": "PipSurvival",
  "description": "IA de survivalisme offline",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#0a0a0a",
  "theme_color": "#00ff00",
  "icons": [...]
}
```

### Service Worker Features
- Offline-first
- Background sync
- Push notifications (optionnel)
- Periodic sync (mises à jour)

---

## 🎯 Fonctionnalités Principales

### 1. Recherche IA Vectorielle
- Input : Question survivalisme
- Embeddings de la question
- Recherche cosine similarity top-K chunks
- Contexte envoyé au LLM local
- Réponse générée avec sources

### 2. Générateur de Code
- Prompt de code
- LLM génère code (Python, Bash, JS, etc.)
- Syntax highlighting
- Copie clipboard
- Exécution sandbox (optionnel)

### 3. Traitement PDFs
- Upload PDF
- Extraction texte (pdf.js)
- OCR si nécessaire (tesseract.js)
- Chunking intelligent (500 tokens)
- Génération embeddings
- Stockage IndexedDB

### 4. Recherche Sémantique
- Pas de keywords, recherche par sens
- "Comment purifier l'eau ?" → trouve sections pertinentes
- Multi-documents
- Ranking par pertinence

---

## 🐧 Déploiement

### Raspberry Pi
```bash
# Installation
sudo apt install php8.1 sqlite3 nginx
git clone [repo]
cd pip-survival
php -S 0.0.0.0:8080

# Accès depuis réseau local
# http://raspberrypi.local:8080
```

### Android
- Accès via navigateur (Chrome/Firefox)
- "Ajouter à l'écran d'accueil"
- Fonctionne comme app native

### iOS
- Accès via Safari
- "Ajouter à l'écran d'accueil"
- Support PWA complet iOS 16.4+

---

## 📊 Base de Données SQLite

### Tables
```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY,
  title TEXT,
  filename TEXT,
  category TEXT,
  content TEXT,
  metadata TEXT,
  created_at DATETIME
);

CREATE TABLE chunks (
  id INTEGER PRIMARY KEY,
  doc_id INTEGER,
  content TEXT,
  page INTEGER,
  chunk_index INTEGER,
  FOREIGN KEY(doc_id) REFERENCES documents(id)
);

CREATE TABLE vectors (
  id INTEGER PRIMARY KEY,
  chunk_id INTEGER,
  embedding BLOB,
  FOREIGN KEY(chunk_id) REFERENCES chunks(id)
);

CREATE TABLE modules (
  id INTEGER PRIMARY KEY,
  name TEXT,
  enabled BOOLEAN,
  config TEXT
);
```

---

## 🎮 UX/UI Pip-Boy

### Écrans
- Écran principal : Menu radial
- Transitions : Slide + static effet
- Sons : Clicks mécaniques
- Feedback : Glow sur hover
- Responsive : 320px → 2560px

### Mini-écrans (< 480px)
- Menu simplifié
- Pas d'animations lourdes
- Texte plus gros
- Boutons tactiles agrandis

---

## 🔒 Sécurité & Vie Privée

- **100% Local** : Aucune donnée envoyée
- **Pas de tracking**
- **Pas de cookies tiers**
- **Chiffrement SQLite** (optionnel)
- **Sanitization** des inputs

---

## 📚 PDFs Survivalisme Suggérés

### Catégories
1. **Eau** : Purification, conservation, sources
2. **Nourriture** : Préservation, chasse, plantes comestibles
3. **Abri** : Construction, isolation, camouflage
4. **Premiers soins** : Médecine d'urgence, plantes médicinales
5. **Navigation** : Orientation, cartes, astres
6. **Feu** : Techniques allumage, conservation
7. **Outils** : Fabrication, maintenance
8. **Défense** : Sécurité, pièges (légal)
9. **Communication** : Radio, signaux
10. **Électronique** : Réparations, DIY, énergie

### Sources
- Manuels militaires déclassifiés (US Army FM)
- Guides bushcraft
- Encyclopédies botaniques
- Manuels premiers secours
- Documentation technique DIY

---

## 🚀 Roadmap

### Phase 1 (MVP)
- [x] Architecture complète
- [ ] Backend PHP + SQLite
- [ ] Interface Pip-Boy basique
- [ ] PWA manifest + service worker
- [ ] Module recherche simple

### Phase 2
- [ ] Intégration LLM local
- [ ] Vectorisation + recherche sémantique
- [ ] Traitement PDFs automatique
- [ ] Modules additionnels (map, radio)

### Phase 3
- [ ] Générateur code
- [ ] Optimisations batterie avancées
- [ ] Mode e-ink
- [ ] Tests multi-plateformes

### Phase 4
- [ ] Modules community
- [ ] Sync P2P (mesh network)
- [ ] Mode survie extrême (ultra low power)

---

## 💡 Innovations Techniques

1. **Hybrid Vector Search** : Combine BM25 (keywords) + cosine similarity (semantic)
2. **Progressive Model Loading** : Charge LLM par chunks selon RAM disponible
3. **Lazy Embeddings** : Génère embeddings à la demande, pas tous d'un coup
4. **Smart Caching** : Cache résultats recherche fréquents
5. **Adaptive UI** : Ajuste complexité selon batterie/performance
6. **Offline-first Architecture** : App fonctionne AVANT d'avoir connexion

---

## 🛠️ Technologies Alternatives

Si contraintes matérielles :

### LLM Ultra-léger
- **TinyLlama** (1.1B, 637MB quantisé)
- **GPT-2 Small** (124M params, ~500MB)
- **DistilGPT-2** (82M params, ~350MB)

### Embeddings Ultra-légers
- **all-MiniLM-L12-v2** (33MB)
- **paraphrase-MiniLM-L3-v2** (17MB)

### Sans LLM
- Recherche BM25 pure
- Extraction keywords + matching
- Templates de réponses pré-écrites

---

## 📏 Tailles Estimées

- **App Core** : ~5MB
- **LLM Phi-2 quantisé** : ~1.5GB
- **Embeddings model** : ~80MB
- **PDFs (10 docs)** : ~50MB
- **Vectors DB** : ~200MB
- **Total** : ~1.8GB

**Raspberry Pi 4 (4GB RAM)** : ✅ Largement suffisant
**Smartphone moderne (4GB+)** : ✅ OK
**Smartphone ancien (2GB)** : ⚠️ Version lite sans LLM

---

C'est parti pour le code ! 🚀
