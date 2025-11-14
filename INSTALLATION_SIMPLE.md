# ⚡ Installation Rapide - Système FlatFile

## 🎯 Installation en 3 minutes (sans MySQL !)

### Étape 1 : Télécharger

```bash
git clone https://github.com/JOURT-Pere-et-fils-Menuiserie-bois/JOURT-Pere-et-fils-Menuiserie-bois.git
cd JOURT-Pere-et-fils-Menuiserie-bois
```

### Étape 2 : Télécharger PDF.js

```bash
cd js/lib/
wget https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
wget https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
cd ../..
```

### Étape 3 : Permissions

```bash
chmod -R 755 saves/ uploads/ logs/
```

### Étape 4 : Lancer !

```bash
php -S localhost:8000
```

Ouvrir : **http://localhost:8000**

---

## ✅ C'est tout !

**Aucune configuration supplémentaire nécessaire !**

- ✅ Pas de MySQL à installer
- ✅ Pas de mots de passe à configurer
- ✅ Pas de fichiers SQL à importer

Le système utilise des **fichiers JSON** stockés dans `saves/`

---

## 📁 Structure créée automatiquement

Quand vous créez votre premier projet, le système génère :

```
saves/
└── projet_20250115_143022_a3f8/
    ├── project.json              # Infos projet
    ├── versions/
    │   ├── versions.json
    │   └── v001/
    │       ├── plan.pdf
    │       ├── measurements.json
    │       └── metadata.json
    ├── avenants/
    │   └── avenants.json
    └── exports/
```

---

## 💾 Backup

Pour sauvegarder tout :

```bash
# Copier le dossier saves/
cp -r saves/ /votre/backup/
```

Pour restaurer :

```bash
# Copier le backup dans saves/
cp -r /votre/backup/* saves/
```

**Hyper simple !** Aucun dump SQL complexe.

---

## 🚀 Déploiement Production

Pour passer en production sur serveur :

1. **Désactiver les erreurs** dans `php/config.php` :
```php
ini_set('display_errors', 0);
```

2. **Configurer Apache/Nginx** (ou utiliser serveur PHP)

3. **Activer HTTPS** (Let's Encrypt recommandé)

4. **Backups automatiques** :
```bash
# Crontab quotidien
0 2 * * * tar -czf /backup/saves_$(date +\%Y\%m\%d).tar.gz /path/to/saves/
```

---

## ❓ Questions Fréquentes

**Q: Pourquoi pas MySQL ?**
R: Simplicité ! Pour 99% des usages, des fichiers JSON suffisent. Pas de serveur DB = Zéro configuration.

**Q: Et si j'ai beaucoup de projets ?**
R: Le système FlatFile gère facilement des centaines de projets. Chaque projet = un dossier indépendant.

**Q: Peut-on migrer vers MySQL plus tard ?**
R: Oui ! Les données JSON peuvent être facilement importées dans MySQL si besoin.

**Q: Comment sauvegarder ?**
R: Copiez le dossier `saves/`. C'est tout !

**Q: Et les performances ?**
R: Excellentes pour des usages normaux. PHP lit/écrit les JSON très rapidement.

---

**Installation terminée !** 🎉

Commencez à créer votre premier projet !
