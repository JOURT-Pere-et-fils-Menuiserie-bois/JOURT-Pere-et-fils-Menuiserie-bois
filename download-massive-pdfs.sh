#!/bin/bash
# MASSIVE PDF DOWNLOADER from The-Eye.eu
# Target: 5-10GB of hardcore survival content

DOWNLOAD_DIR="/home/user/JOURT-Pere-et-fils-Menuiserie-bois/data/pdfs"
cd "$DOWNLOAD_DIR"

echo "🔥 STARTING MASSIVE DOWNLOAD from The-Eye.eu"
echo "Target: Multiple GB of hardcore content"

# Anarchist Cookbook & Related
echo "📚 Downloading Anarchist Cookbook collection..."
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Anarchist%20Cookbook/Anarchist%20Cookbook.pdf" -O anarchist-cookbook.pdf

# Poor Man's James Bond series
echo "💣 Downloading Poor Man's James Bond series..."
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Improvised%20Munitions/Poor%20Mans%20James%20Bond%20Vol%201.pdf" -O poor-mans-james-bond-v1.pdf
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Improvised%20Munitions/Poor%20Mans%20James%20Bond%20Vol%202.pdf" -O poor-mans-james-bond-v2.pdf
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Improvised%20Munitions/Poor%20Mans%20James%20Bond%20Vol%203.pdf" -O poor-mans-james-bond-v3.pdf
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Improvised%20Munitions/Poor%20Mans%20James%20Bond%20Vol%204.pdf" -O poor-mans-james-bond-v4.pdf

# US Army Manuals
echo "🎖️ Downloading US Army Field Manuals..."
wget -q --show-progress -nc "https://the-eye.eu/public/Military/Field%20Manuals/US%20Army%20FM%2021-76%20Survival.pdf" -O fm-21-76-survival.pdf
wget -q --show-progress -nc "https://the-eye.eu/public/Military/Field%20Manuals/US%20Army%20TM%2031-210%20Improvised%20Munitions%20Handbook.pdf" -O tm-31-210-improvised-munitions.pdf

# Lockpicking
echo "🔓 Downloading Lockpicking guides..."
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Lockpicking/MIT%20Guide%20to%20Lockpicking.pdf" -O mit-lockpicking-guide.pdf
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Lockpicking/Practical%20Lock%20Picking%20by%20Deviant%20Ollam.pdf" -O practical-lockpicking-deviant-ollam.pdf

# Electronics & Hacking
echo "⚡ Downloading Electronics & Hacking books..."
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Electronics/The%20Art%20of%20Electronics%203rd%20Edition.pdf" -O art-of-electronics-3rd-ed.pdf
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Hacking/Hacking%20The%20Art%20of%20Exploitation%202nd%20Ed.pdf" -O hacking-art-of-exploitation.pdf

# Medical
echo "🏥 Downloading Medical manuals..."
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Medical/Where%20There%20Is%20No%20Doctor.pdf" -O where-there-is-no-doctor.pdf
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Medical/Where%20There%20Is%20No%20Dentist.pdf" -O where-there-is-no-dentist.pdf
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Medical/Emergency%20War%20Surgery%20NATO.pdf" -O emergency-war-surgery-nato.pdf

# Chemistry
echo "⚗️ Downloading Chemistry books..."
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Chemistry/The%20Chemistry%20of%20Powder%20and%20Explosives.pdf" -O chemistry-powder-explosives-davis.pdf

# Survival
echo "🏕️ Downloading Survival manuals..."
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Survival/SAS%20Survival%20Handbook.pdf" -O sas-survival-handbook.pdf
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Survival/Bushcraft%20101.pdf" -O bushcraft-101.pdf

# Weapons
echo "🔫 Downloading Weapons manuals..."
wget -q --show-progress -nc "https://the-eye.eu/public/Military/Weapons/Home%20Workshop%20Guns%20For%20Defense%20and%20Resistance.pdf" -O home-workshop-guns.pdf

# Radio & Communications
echo "📻 Downloading Radio/Comms manuals..."
wget -q --show-progress -nc "https://the-eye.eu/public/Books/Radio/ARRL%20Handbook%202020.pdf" -O arrl-handbook-2020.pdf

echo ""
echo "✅ DOWNLOAD COMPLETE!"
echo "📊 Checking total size..."
du -sh .
ls -lh *.pdf | wc -l
echo "PDFs downloaded"
