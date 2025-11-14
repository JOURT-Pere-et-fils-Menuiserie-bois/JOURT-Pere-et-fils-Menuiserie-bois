#!/bin/bash
#
# Script pour télécharger PDF.js
# Usage: bash download-pdfjs.sh
#

echo "📥 Téléchargement de PDF.js 3.11.174..."

# Créer le dossier js/lib s'il n'existe pas
mkdir -p js/lib

# Télécharger depuis Mozilla CDN
echo "Téléchargement de pdf.min.mjs..."
curl -L "https://mozilla.github.io/pdf.js/build/pdf.min.mjs" -o js/lib/pdf.min.mjs

echo "Téléchargement de pdf.worker.min.mjs..."
curl -L "https://mozilla.github.io/pdf.js/build/pdf.worker.min.mjs" -o js/lib/pdf.worker.min.mjs

# Vérifier les fichiers
if [ -f "js/lib/pdf.min.mjs" ] && [ -s "js/lib/pdf.min.mjs" ]; then
    SIZE=$(wc -c < js/lib/pdf.min.mjs)
    if [ "$SIZE" -gt 100000 ]; then
        echo "✅ pdf.min.mjs téléchargé avec succès (${SIZE} bytes)"
    else
        echo "❌ Erreur: pdf.min.mjs trop petit (${SIZE} bytes)"
        exit 1
    fi
else
    echo "❌ Erreur lors du téléchargement de pdf.min.mjs"
    exit 1
fi

if [ -f "js/lib/pdf.worker.min.mjs" ] && [ -s "js/lib/pdf.worker.min.mjs" ]; then
    SIZE=$(wc -c < js/lib/pdf.worker.min.mjs)
    if [ "$SIZE" -gt 100000 ]; then
        echo "✅ pdf.worker.min.mjs téléchargé avec succès (${SIZE} bytes)"
    else
        echo "❌ Erreur: pdf.worker.min.mjs trop petit (${SIZE} bytes)"
        exit 1
    fi
else
    echo "❌ Erreur lors du téléchargement de pdf.worker.min.mjs"
    exit 1
fi

echo ""
echo "✅ PDF.js téléchargé avec succès !"
echo "Vous pouvez maintenant lancer le serveur avec: php -S localhost:8000"
