#!/bin/bash
# Installation script for Raspberry Pi
# Pip-Boy Survival AI

set -e

echo "========================================="
echo " PIP-BOY SURVIVAL AI - Raspberry Pi Setup"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Please do not run as root"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt-get update

# Install PHP 8.1+
echo "🐘 Installing PHP..."
sudo apt-get install -y php8.1 php8.1-cli php8.1-sqlite3 php8.1-mbstring php8.1-xml

# Install SQLite
echo "💾 Installing SQLite..."
sudo apt-get install -y sqlite3

# Install poppler-utils (for PDF extraction)
echo "📄 Installing PDF tools..."
sudo apt-get install -y poppler-utils

# Install optional tools
echo "🔧 Installing optional tools..."
sudo apt-get install -y tesseract-ocr # OCR for scanned PDFs
sudo apt-get install -y imagemagick   # Image processing

# Create directories
echo "📁 Creating directories..."
mkdir -p data/pdfs data/models

# Initialize database
echo "💾 Initializing database..."
php -r "
require 'api/models/Database.php';
define('DB_PATH', 'data/database.sqlite');
\$db = Database::getInstance();
\$db->init();
echo 'Database initialized!\n';
"

# Set permissions
echo "🔒 Setting permissions..."
chmod -R 755 .
chmod -R 777 data

# Download example PDFs (optional)
echo "📚 Do you want to download example survival PDFs? (y/n)"
read -r download_pdfs

if [ "$download_pdfs" = "y" ]; then
    echo "📥 Downloading example PDFs..."
    # TODO: Add URLs to free survival PDFs
    echo "⚠️  Manual PDF download required"
    echo "   Place PDFs in data/pdfs/ directory"
fi

# Start server
echo ""
echo "========================================="
echo " ✓ Installation complete!"
echo "========================================="
echo ""
echo "To start the server:"
echo "  php -S 0.0.0.0:8080"
echo ""
echo "Then access from:"
echo "  - Local: http://localhost:8080"
echo "  - Network: http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "On mobile devices (same network):"
echo "  1. Open the URL in browser"
echo "  2. Add to Home Screen"
echo "  3. Works offline!"
echo ""

# Offer to start server now
echo "Start server now? (y/n)"
read -r start_now

if [ "$start_now" = "y" ]; then
    echo "🚀 Starting server..."
    php -S 0.0.0.0:8080
fi
