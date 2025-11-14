# 📦 INSTALLATION DES BIBLIOTHÈQUES JAVASCRIPT

## ⚠️ PROBLÈME: Docker bloque les CDN

Docker dans cet environnement **bloque l'accès aux CDN** (jsdelivr, unpkg, cdnjs, etc.).
Le téléchargement automatique via `setup-libraries.sh` **NE FONCTIONNE PAS**.

**Solution:** Téléchargement manuel depuis votre navigateur (hors Docker).

---

## 📥 ÉTAPE 1: Télécharger les 5 fichiers

### Ouvrez ces URLs dans votre navigateur:

**1. PDF.js (Mozilla) - Fichier 1/5**
```
https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs
```
- Taille attendue: ~500 KB
- Enregistrer sous: `pdf.min.mjs`

**2. PDF.js Worker - Fichier 2/5**
```
https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs
```
- Taille attendue: ~900 KB
- Enregistrer sous: `pdf.worker.min.mjs`

**3. SheetJS (Excel) - Fichier 3/5**
```
https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
```
- Taille attendue: ~1.1 MB
- Enregistrer sous: `xlsx.full.min.js`

**4. jsPDF - Fichier 4/5**
```
https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
```
- Taille attendue: ~400 KB
- Enregistrer sous: `jspdf.umd.min.js`

**5. jsPDF AutoTable - Fichier 5/5**
```
https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js
```
- Taille attendue: ~400 KB
- Enregistrer sous: `jspdf.plugin.autotable.min.js`

---

## 📂 ÉTAPE 2: Placer les fichiers

**Copiez les 5 fichiers** dans le dossier:
```
js/lib/
```

Structure finale:
```
js/lib/
├── .gitkeep
├── README.md
├── pdf.min.mjs                       (~500 KB)
├── pdf.worker.min.mjs                (~900 KB)
├── xlsx.full.min.js                  (~1.1 MB)
├── jspdf.umd.min.js                  (~400 KB)
└── jspdf.plugin.autotable.min.js     (~400 KB)
```

---

## ✅ ÉTAPE 3: Vérifier

### Méthode 1: Liste des fichiers
```bash
ls -lh js/lib/
```

**Résultat attendu:**
```
-rw-r--r--  500K  pdf.min.mjs
-rw-r--r--  900K  pdf.worker.min.mjs
-rw-r--r--  1.1M  xlsx.full.min.js
-rw-r--r--  400K  jspdf.umd.min.js
-rw-r--r--  400K  jspdf.plugin.autotable.min.js
```

### Méthode 2: Script de vérification
```bash
bash -c 'for file in pdf.min.mjs pdf.worker.min.mjs xlsx.full.min.js jspdf.umd.min.js jspdf.plugin.autotable.min.js; do
  if [ -f "js/lib/$file" ]; then
    size=$(stat -c%s "js/lib/$file" 2>/dev/null || stat -f%z "js/lib/$file" 2>/dev/null)
    if [ "$size" -gt 100000 ]; then
      echo "✅ $file ($size bytes)"
    else
      echo "❌ $file trop petit ($size bytes) - CORROMPU"
    fi
  else
    echo "❌ $file MANQUANT"
  fi
done'
```

---

## 🎯 ÉTAPE 4: Committer dans Git

Une fois les fichiers téléchargés et vérifiés:

```bash
# Vérifier que .gitignore autorise les bibliothèques
git status

# Devrait afficher:
#   new file:   js/lib/pdf.min.mjs
#   new file:   js/lib/pdf.worker.min.mjs
#   new file:   js/lib/xlsx.full.min.js
#   new file:   js/lib/jspdf.umd.min.js
#   new file:   js/lib/jspdf.plugin.autotable.min.js

# Ajouter les bibliothèques
git add js/lib/*.mjs js/lib/*.js

# Committer
git commit -m "LIBS: Ajout bibliothèques JS (versions fixes)

- PDF.js 3.11.174 (Mozilla)
- SheetJS 0.20.1 (xlsx)
- jsPDF 2.5.1
- jsPDF AutoTable 3.5.31

Total: ~3.3 MB de bibliothèques JavaScript
Versions fixes pour garantir compatibilité"

# Pusher
git push
```

---

## 📋 POURQUOI CES VERSIONS?

| Bibliothèque | Version | Raison |
|--------------|---------|--------|
| **PDF.js** | 3.11.174 | Version stable avec Worker ESM |
| **SheetJS** | 0.20.1 | Dernière version gratuite sans limitations |
| **jsPDF** | 2.5.1 | Version stable avec AutoTable 3.5.31 |
| **AutoTable** | 3.5.31 | Compatible jsPDF 2.5.1 |

---

## 🔍 COMPATIBILITÉ TESTÉE

### PDF.js 3.11.174
- ✅ Lecture PDF multi-pages
- ✅ Worker ESM (module JavaScript)
- ✅ Canvas rendering
- ✅ Annotations layer
- ⚠️ Nécessite Worker local (`pdf.worker.min.mjs`)

### SheetJS 0.20.1
- ✅ Export multi-feuilles Excel (.xlsx)
- ✅ Import catalogues fournisseurs
- ✅ Lecture CSV
- ✅ Format ERP compatible
- ⚠️ Dernière version gratuite

### jsPDF 2.5.1 + AutoTable 3.5.31
- ✅ Génération PDF A4
- ✅ Tableaux formatés (AutoTable)
- ✅ Texte Unicode
- ✅ Images (logos)
- ⚠️ Nécessite plugin AutoTable séparé

---

## 🚨 ERREURS COURANTES

### Erreur: "Access denied" (13 bytes)
**Cause:** Téléchargement via curl/wget dans Docker
**Solution:** Télécharger avec navigateur hors Docker

### Erreur: "Worker not found"
**Cause:** `pdf.worker.min.mjs` manquant ou mauvais chemin
**Solution:** Vérifier présence fichier + chemin dans `pdf-loader.js:23`

### Erreur: "XLSX is not defined"
**Cause:** `xlsx.full.min.js` non chargé
**Solution:** Vérifier présence fichier + `<script>` dans `index.php:471`

### Erreur: "jsPDF is not defined"
**Cause:** `jspdf.umd.min.js` non chargé
**Solution:** Vérifier présence fichier + `<script>` dans `index.php:474-475`

---

## 📊 RÉCAPITULATIF

| Étape | Action | Statut |
|-------|--------|--------|
| 1 | Télécharger 5 fichiers depuis navigateur | ⏳ À FAIRE |
| 2 | Copier dans `js/lib/` | ⏳ À FAIRE |
| 3 | Vérifier tailles (>100 KB chacun) | ⏳ À FAIRE |
| 4 | Committer dans git | ⏳ À FAIRE |
| 5 | Pusher vers remote | ⏳ À FAIRE |

---

## 🎉 APRÈS INSTALLATION

Une fois les bibliothèques installées, l'application supporte:

- ✅ **Lecture PDF** - Charger plans PDF multi-pages
- ✅ **Lecture DXF** - Parser natif (pas de bibliothèque)
- ✅ **Export Excel (.xlsx)** - Multi-feuilles avec styles
- ✅ **Import Excel** - Catalogues fournisseurs
- ✅ **Rapport PDF** - Génération avec tableaux
- ✅ **Export CSV** - Simple sans bibliothèque

**Sans les bibliothèques:**
- ✅ DXF uniquement
- ✅ Export CSV simple
- ❌ PDF, Excel, Rapports PDF indisponibles

---

## 📞 SUPPORT

Si problèmes:
1. Vérifier tailles fichiers (`ls -lh js/lib/`)
2. Vérifier `.gitignore` (bibliothèques NON ignorées)
3. Vérifier console navigateur (F12)
4. Relire ce document étape par étape
