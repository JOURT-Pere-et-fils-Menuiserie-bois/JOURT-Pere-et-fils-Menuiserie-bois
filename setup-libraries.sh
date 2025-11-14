#!/bin/bash
#
# Script complet pour télécharger TOUTES les bibliothèques JavaScript
# Usage: bash setup-libraries.sh
#

echo "📦 Installation des bibliothèques JavaScript locales..."
echo ""

# Créer le dossier js/lib s'il n'existe pas
mkdir -p js/lib

# Compteur de succès
SUCCESS=0
TOTAL=5

# ============================================
# 1. PDF.js (Mozilla) - Lecture PDF
# ============================================
echo "📥 [1/5] Téléchargement PDF.js 3.11.174..."
curl -L "https://mozilla.github.io/pdf.js/build/pdf.min.mjs" -o js/lib/pdf.min.mjs
if [ -f "js/lib/pdf.min.mjs" ] && [ -s "js/lib/pdf.min.mjs" ]; then
    SIZE=$(wc -c < js/lib/pdf.min.mjs)
    if [ "$SIZE" -gt 100000 ]; then
        echo "   ✅ pdf.min.mjs téléchargé ($(numfmt --to=iec-i --suffix=B $SIZE))"
        ((SUCCESS++))
    else
        echo "   ❌ pdf.min.mjs trop petit (${SIZE} bytes)"
    fi
else
    echo "   ❌ Échec téléchargement pdf.min.mjs"
fi

echo ""
echo "📥 [2/5] Téléchargement PDF.js Worker..."
curl -L "https://mozilla.github.io/pdf.js/build/pdf.worker.min.mjs" -o js/lib/pdf.worker.min.mjs
if [ -f "js/lib/pdf.worker.min.mjs" ] && [ -s "js/lib/pdf.worker.min.mjs" ]; then
    SIZE=$(wc -c < js/lib/pdf.worker.min.mjs)
    if [ "$SIZE" -gt 100000 ]; then
        echo "   ✅ pdf.worker.min.mjs téléchargé ($(numfmt --to=iec-i --suffix=B $SIZE))"
        ((SUCCESS++))
    else
        echo "   ❌ pdf.worker.min.mjs trop petit (${SIZE} bytes)"
    fi
else
    echo "   ❌ Échec téléchargement pdf.worker.min.mjs"
fi

# ============================================
# 2. SheetJS - Export/Import Excel
# ============================================
echo ""
echo "📥 [3/5] Téléchargement SheetJS (xlsx)..."
curl -L "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js" -o js/lib/xlsx.full.min.js
if [ -f "js/lib/xlsx.full.min.js" ] && [ -s "js/lib/xlsx.full.min.js" ]; then
    SIZE=$(wc -c < js/lib/xlsx.full.min.js)
    if [ "$SIZE" -gt 100000 ]; then
        echo "   ✅ xlsx.full.min.js téléchargé ($(numfmt --to=iec-i --suffix=B $SIZE))"
        ((SUCCESS++))
    else
        echo "   ❌ xlsx.full.min.js trop petit (${SIZE} bytes)"
    fi
else
    echo "   ❌ Échec téléchargement xlsx.full.min.js"
fi

# ============================================
# 3. jsPDF - Génération PDF
# ============================================
echo ""
echo "📥 [4/5] Téléchargement jsPDF..."
curl -L "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" -o js/lib/jspdf.umd.min.js
if [ -f "js/lib/jspdf.umd.min.js" ] && [ -s "js/lib/jspdf.umd.min.js" ]; then
    SIZE=$(wc -c < js/lib/jspdf.umd.min.js)
    if [ "$SIZE" -gt 100000 ]; then
        echo "   ✅ jspdf.umd.min.js téléchargé ($(numfmt --to=iec-i --suffix=B $SIZE))"
        ((SUCCESS++))
    else
        echo "   ❌ jspdf.umd.min.js trop petit (${SIZE} bytes)"
    fi
else
    echo "   ❌ Échec téléchargement jspdf.umd.min.js"
fi

# ============================================
# 4. jsPDF AutoTable - Tableaux PDF
# ============================================
echo ""
echo "📥 [5/5] Téléchargement jsPDF AutoTable..."
curl -L "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js" -o js/lib/jspdf.plugin.autotable.min.js
if [ -f "js/lib/jspdf.plugin.autotable.min.js" ] && [ -s "js/lib/jspdf.plugin.autotable.min.js" ]; then
    SIZE=$(wc -c < js/lib/jspdf.plugin.autotable.min.js)
    if [ "$SIZE" -gt 10000 ]; then
        echo "   ✅ jspdf.plugin.autotable.min.js téléchargé ($(numfmt --to=iec-i --suffix=B $SIZE))"
        ((SUCCESS++))
    else
        echo "   ❌ jspdf.plugin.autotable.min.js trop petit (${SIZE} bytes)"
    fi
else
    echo "   ❌ Échec téléchargement jspdf.plugin.autotable.min.js"
fi

# ============================================
# Résumé
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$SUCCESS" -eq "$TOTAL" ]; then
    echo "✅ Installation réussie ! ($SUCCESS/$TOTAL bibliothèques)"
    echo ""
    echo "Taille totale installée:"
    du -sh js/lib | awk '{print "   " $1}'
    echo ""
    echo "Vous pouvez maintenant lancer l'application:"
    echo "   php -S localhost:8000"
    echo ""
    exit 0
else
    echo "⚠️  Installation partielle ($SUCCESS/$TOTAL bibliothèques)"
    echo ""
    echo "Fichiers manquants ou invalides. Vérifiez votre connexion internet."
    echo "Vous pouvez réessayer ou télécharger manuellement (voir js/lib/README.md)"
    echo ""
    exit 1
fi
