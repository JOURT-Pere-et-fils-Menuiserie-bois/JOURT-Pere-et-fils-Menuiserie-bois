#!/bin/bash
#
# Script d'installation des bibliothèques en local
# À exécuter UNE FOIS pour rendre l'application 100% standalone
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/js/lib"

echo "═══════════════════════════════════════════════════"
echo "  Installation bibliothèques locales"
echo "  Logiciel de Métré Pro - JOURT Père et fils"
echo "═══════════════════════════════════════════════════"
echo ""

# Créer dossier lib si nécessaire
mkdir -p "$LIB_DIR"
cd "$LIB_DIR"

echo "📁 Dossier: $LIB_DIR"
echo ""

# Fonction de téléchargement avec retry
download_file() {
    local url="$1"
    local output="$2"
    local description="$3"

    echo "⏳ Téléchargement: $description..."

    if command -v curl &> /dev/null; then
        curl -L --retry 3 --retry-delay 2 -o "$output" "$url" || {
            echo "❌ Erreur téléchargement $description"
            return 1
        }
    elif command -v wget &> /dev/null; then
        wget -O "$output" "$url" || {
            echo "❌ Erreur téléchargement $description"
            return 1
        }
    else
        echo "❌ curl ou wget requis pour télécharger"
        return 1
    fi

    echo "✅ $description téléchargé ($(du -h "$output" | cut -f1))"
}

echo "1️⃣  PDF.js (Mozilla) - Lecture PDF"
echo "─────────────────────────────────────────────────"
download_file \
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs" \
    "pdf.min.mjs" \
    "PDF.js core"

download_file \
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs" \
    "pdf.worker.min.mjs" \
    "PDF.js worker"

echo ""
echo "2️⃣  SheetJS (xlsx.js) - Export/Import Excel"
echo "─────────────────────────────────────────────────"
download_file \
    "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js" \
    "xlsx.full.min.js" \
    "SheetJS"

echo ""
echo "3️⃣  jsPDF - Génération PDF"
echo "─────────────────────────────────────────────────"
download_file \
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" \
    "jspdf.umd.min.js" \
    "jsPDF core"

download_file \
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js" \
    "jspdf.plugin.autotable.min.js" \
    "jsPDF AutoTable"

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Installation terminée !"
echo ""
echo "Fichiers installés:"
ls -lh "$LIB_DIR"
echo ""
echo "Taille totale:"
du -sh "$LIB_DIR"
echo ""
echo "➡️  Prochaine étape: Ouvrir index.php dans un navigateur"
echo "═══════════════════════════════════════════════════"
