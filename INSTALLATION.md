# 📦 Installation - Logiciel de Métré Pro

Installation ultra-simple en **3 minutes** (aucune base de données requise).

---

## ⚙️ Prérequis

- **PHP 7.4+**
  ```bash
  php --version
  ```

C'est tout ! ✨ **Aucune base de données nécessaire**

---

## 📥 Installation

### Étape 1 : Cloner le projet

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

**Alternative CDN** : Modifier `index.php` ligne 102 pour utiliser le CDN au lieu des fichiers locaux.

### Étape 3 : Configurer les permissions

```bash
# Linux/Mac
chmod -R 755 saves/ uploads/ logs/

# Windows PowerShell (en admin)
icacls saves /grant Users:(OI)(CI)F /T
icacls uploads /grant Users:(OI)(CI)F /T
icacls logs /grant Users:(OI)(CI)F /T
```

### Étape 4 : Lancer !

```bash
php -S localhost:8000
```

Ouvrir : **http://localhost:8000**

---

## ✅ Vérification

### Test 1 : Page d'accueil
- Ouvrir http://localhost:8000
- Interface doit s'afficher
- Console (F12) : aucune erreur

### Test 2 : Créer un projet
1. Clic "Nouveau Projet"
2. Remplir le formulaire
3. Si succès → ✅ Installation OK
4. Vérifier que le dossier a été créé : `saves/projet_xxx/`

### Test 3 : Charger un PDF
1. Charger un plan PDF de test
2. Le plan s'affiche → ✅ PDF.js OK

---

## 📁 Structure créée automatiquement

À la création du premier projet :

```
saves/
└── projet_20250115_143022_a3f8/
    ├── project.json              # Métadonnées projet
    ├── versions/
    │   ├── versions.json         # Liste versions
    │   └── v001/
    │       ├── plan.pdf          # Plan uploadé
    │       ├── measurements.json # Mesures
    │       └── metadata.json     # Infos version
    ├── avenants/
    │   └── avenants.json
    └── exports/
```

---

## 🐛 Dépannage

### PDF.js ne charge pas

**Erreur** : "ReferenceError: pdfjsLib is not defined"

**Solution** :
```bash
# Vérifier que les fichiers existent
ls js/lib/pdf.min.js
ls js/lib/pdf.worker.min.js

# Si absents, les télécharger
cd js/lib/
wget https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
wget https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
```

### Erreur : "Permission denied" sur saves/

**Solution** :
```bash
chmod -R 755 saves/ uploads/ logs/
```

### Upload de fichier échoue

**Cause** : Limites PHP trop basses

**Solution** : Augmenter dans `php.ini` :
```ini
upload_max_filesize = 200M
post_max_size = 200M
memory_limit = 512M
```

Puis redémarrer le serveur.

---

## 🚀 Déploiement Production

### Sur serveur Apache/Nginx

1. **Copier le projet** :
```bash
sudo cp -r . /var/www/html/metre-pro
sudo chown -R www-data:www-data /var/www/html/metre-pro
```

2. **Désactiver debug** dans `php/config.php` :
```php
ini_set('display_errors', 0);
```

3. **Activer HTTPS** (Let's Encrypt) :
```bash
sudo certbot --apache -d votre-domaine.com
```

4. **Configurer backups automatiques** :
```bash
# Ajouter au crontab
0 2 * * * tar -czf /backup/saves_$(date +\%Y\%m\%d).tar.gz /var/www/html/metre-pro/saves/
```

### Sécurité Production

- ✅ HTTPS obligatoire
- ✅ Permissions strictes (755 pour dossiers, 644 pour fichiers)
- ✅ Backups quotidiens automatiques
- ✅ Display errors = 0
- ✅ Protection `.htaccess` sur `saves/` (déjà en place)

---

## 💾 Backup / Restauration

### Backup complet

```bash
# Sauvegarder tout
tar -czf backup_metre_$(date +%Y%m%d).tar.gz saves/

# Ou juste copier le dossier
cp -r saves/ /votre/backup/saves_$(date +%Y%m%d)/
```

### Restauration

```bash
# Extraire
tar -xzf backup_metre_20250115.tar.gz

# Ou copier
cp -r /backup/saves_20250115/* saves/
```

**Hyper simple** : Tout est dans `saves/`, pas de dump SQL !

---

## 📊 Monitoring

### Logs à surveiller

```bash
# Erreurs PHP
tail -f logs/php_errors.log

# Erreurs serveur (si Apache)
tail -f /var/log/apache2/error.log
```

### Espace disque

Surveiller `saves/` qui grandit avec les projets :

```bash
du -sh saves/
```

---

## ❓ Questions Fréquentes

**Q : Pourquoi pas MySQL ?**
R : Simplicité ! Fichiers JSON = zéro configuration, portable, lisible.

**Q : Limite de projets ?**
R : Des centaines de projets sans problème. Un projet = un dossier.

**Q : Et les performances ?**
R : Excellentes. PHP lit/écrit JSON très vite.

**Q : Migrer vers MySQL possible ?**
R : Oui, les JSON peuvent être importés facilement si besoin futur.

---

## 📞 Support

Problème d'installation ?

- **Logs** : `logs/php_errors.log`
- **Console** : F12 → Console dans le navigateur
- **Contact** : contact@jourt.com

---

**Installation terminée !** 🎉

Créez votre premier projet et commencez à mesurer !
