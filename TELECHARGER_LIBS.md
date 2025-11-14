# TÉLÉCHARGER LES BIBLIOTHÈQUES

⚠️ **L'environnement Docker bloque l'accès aux CDN.**

Tu dois télécharger manuellement les 5 fichiers suivants dans `js/lib/` :

## 1. PDF.js (Mozilla) - Version 3.11.174

```bash
cd js/lib/

# PDF.js core
curl -L "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs" -o pdf.min.mjs

# PDF.js worker
curl -L "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs" -o pdf.worker.min.mjs
```

**Ou télécharge depuis ton navigateur:**
- https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs
- https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs

## 2. SheetJS - Version 0.20.1

```bash
curl -L "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js" -o xlsx.full.min.js
```

**Ou depuis navigateur:**
- https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js

## 3. jsPDF - Version 2.5.1

```bash
# jsPDF core
curl -L "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" -o jspdf.umd.min.js

# jsPDF AutoTable plugin
curl -L "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js" -o jspdf.plugin.autotable.min.js
```

**Ou depuis navigateur:**
- https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
- https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js

## Vérification

Après téléchargement :

```bash
ls -lh js/lib/
```

Tu dois voir 5 fichiers :
- pdf.min.mjs (~500 KB)
- pdf.worker.min.mjs (~900 KB)
- xlsx.full.min.js (~1.1 MB)
- jspdf.umd.min.js (~400 KB)
- jspdf.plugin.autotable.min.js (~400 KB)

## Ensuite

```bash
git add js/lib/*.js js/lib/*.mjs
git commit -m "Ajout bibliothèques JavaScript locales"
git push
```

**C'est tout !** L'application fonctionnera 100% hors ligne.
