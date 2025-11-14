# BIBLIOTHÈQUES REQUISES

⚠️ **Ce dossier doit contenir les bibliothèques JavaScript pour que l'application fonctionne.**

## Installation Automatique

```bash
# Depuis la racine du projet
./setup-libraries.sh
```

Ce script télécharge automatiquement tous les fichiers nécessaires dans ce dossier.

## Fichiers Requis

| Fichier | Taille | Description |
|---------|--------|-------------|
| `pdf.min.mjs` | ~500 KB | PDF.js core - Lecture PDF |
| `pdf.worker.min.mjs` | ~900 KB | PDF.js worker |
| `xlsx.full.min.js` | ~1.1 MB | SheetJS - Export/Import Excel |
| `jspdf.umd.min.js` | ~400 KB | jsPDF - Génération PDF |
| `jspdf.plugin.autotable.min.js` | ~400 KB | jsPDF AutoTable |

**Total:** ~3.3 MB

## Téléchargement Manuel

Si le script ne fonctionne pas, téléchargez manuellement:

1. **PDF.js** (Mozilla)
   - https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs
   - https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs

2. **SheetJS**
   - https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js

3. **jsPDF + AutoTable**
   - https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
   - https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js

Placez tous les fichiers dans ce dossier `js/lib/`.

## Vérification

```bash
ls -lh
```

Vous devez voir 5 fichiers.

## Alternative Sans Bibliothèques

Si vous ne pouvez pas télécharger les bibliothèques, certaines fonctionnalités de base fonctionneront toujours:
- ❌ Lecture PDF (nécessite PDF.js)
- ✅ Lecture DXF (parser natif)
- ❌ Export Excel .xlsx (nécessite SheetJS)
- ✅ Export CSV (version simplifiée sans bibliothèque)
- ❌ Rapport PDF (nécessite jsPDF)
- ✅ Export HTML imprimable (alternative au PDF)
