# 📦 Guide d'Installation - Logiciel de Métré Pro

Guide complet d'installation étape par étape.

---

## ⚙️ Prérequis

Avant de commencer, assurez-vous d'avoir :

- **PHP** : Version 7.4 ou supérieure
  ```bash
  php --version
  ```

- **MySQL/MariaDB** : Version 5.7+ / 10.3+
  ```bash
  mysql --version
  ```

- **Composer** (optionnel) : Pour les dépendances PHP futures
- **Git** : Pour cloner le projet

---

## 📥 Installation

### Étape 1 : Cloner le projet

```bash
git clone https://github.com/JOURT-Pere-et-fils-Menuiserie-bois/JOURT-Pere-et-fils-Menuiserie-bois.git
cd JOURT-Pere-et-fils-Menuiserie-bois
```

### Étape 2 : Configurer la base de données

#### Option A : Ligne de commande

```bash
# Se connecter à MySQL
mysql -u root -p

# Dans le prompt MySQL
CREATE DATABASE metre_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE metre_pro;
SOURCE database/schema.sql;
EXIT;
```

#### Option B : phpMyAdmin

1. Ouvrir phpMyAdmin
2. Créer une nouvelle base de données : `metre_pro`
3. Charset : `utf8mb4_unicode_ci`
4. Importer le fichier `database/schema.sql`

### Étape 3 : Configurer PHP

Éditer le fichier `php/config.php` :

```php
// Configuration base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'metre_pro');
define('DB_USER', 'votre_utilisateur');
define('DB_PASS', 'votre_mot_de_passe');
```

### Étape 4 : Télécharger PDF.js

**Important** : PDF.js est requis pour afficher les PDF.

#### Option A : Téléchargement manuel (Recommandé)

1. Aller sur https://mozilla.github.io/pdf.js/getting_started/
2. Télécharger la version stable (Prebuilt)
3. Extraire l'archive
4. Copier les fichiers suivants dans `js/lib/` :
   - `build/pdf.mjs`
   - `build/pdf.worker.mjs`

```bash
# Exemple avec wget
cd js/lib/
wget https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
wget https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
```

#### Option B : CDN (Alternative)

Modifier `index.php` ligne 102 :

```html
<!-- Remplacer -->
<script src="js/lib/pdf.mjs" type="module"></script>

<!-- Par -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
```

### Étape 5 : Configurer les permissions

```bash
# Linux/Mac
chmod -R 755 saves/
chmod -R 755 uploads/
chmod -R 755 logs/

# Windows (PowerShell en admin)
icacls saves /grant Users:(OI)(CI)F /T
icacls uploads /grant Users:(OI)(CI)F /T
icacls logs /grant Users:(OI)(CI)F /T
```

### Étape 6 : Lancer le serveur

#### Option A : Serveur PHP intégré (Développement)

```bash
php -S localhost:8000
```

Puis ouvrir : http://localhost:8000

#### Option B : Apache/Nginx

**Apache** :

Placer le projet dans `/var/www/html/` :

```bash
sudo cp -r . /var/www/html/metre-pro
sudo chown -R www-data:www-data /var/www/html/metre-pro
```

Accéder via : http://localhost/metre-pro

**Configuration VirtualHost Apache** (optionnel) :

```apache
<VirtualHost *:80>
    ServerName metre-pro.local
    DocumentRoot /var/www/html/metre-pro

    <Directory /var/www/html/metre-pro>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/metre-pro-error.log
    CustomLog ${APACHE_LOG_DIR}/metre-pro-access.log combined
</VirtualHost>
```

Activer le site :
```bash
sudo a2ensite metre-pro
sudo systemctl reload apache2
```

Ajouter à `/etc/hosts` :
```
127.0.0.1   metre-pro.local
```

---

## ✅ Vérification de l'installation

### Test 1 : Page d'accueil

1. Ouvrir http://localhost:8000 (ou votre URL)
2. Vérifier que l'interface s'affiche correctement
3. Console navigateur (F12) : Aucune erreur

### Test 2 : Base de données

1. Créer un nouveau projet
2. Si succès → BDD OK ✅
3. Si erreur → Vérifier `php/config.php`

### Test 3 : Upload

1. Charger un plan PDF de test
2. Le plan doit s'afficher
3. Si erreur PDF.js :
   - Vérifier que `js/lib/pdf.mjs` existe
   - Ou utiliser CDN (voir Étape 4)

### Test 4 : Calibration

1. Cliquer sur "Calibrer"
2. Tracer une ligne
3. Entrer longueur réelle
4. Si succès → Tout fonctionne ✅

---

## 🐛 Résolution de problèmes

### Erreur : "Call to undefined function mysqli_connect"

**Cause** : Extension PHP MySQL manquante

**Solution** :
```bash
# Ubuntu/Debian
sudo apt install php-mysql
sudo systemctl restart apache2

# CentOS/RHEL
sudo yum install php-mysqlnd
sudo systemctl restart httpd
```

### Erreur : "Cannot modify header information"

**Cause** : Output avant headers PHP

**Solution** : Vérifier qu'il n'y a pas d'espaces avant `<?php` dans les fichiers PHP

### Erreur : "Permission denied" sur saves/

**Cause** : Permissions insuffisantes

**Solution** :
```bash
sudo chown -R www-data:www-data saves/ uploads/ logs/
chmod -R 755 saves/ uploads/ logs/
```

### PDF.js ne charge pas

**Erreur** : "ReferenceError: pdfjsLib is not defined"

**Solution** :
1. Vérifier `js/lib/pdf.mjs` existe
2. Ou utiliser CDN :
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
```

### Base de données : "Access denied"

**Solution** :
```bash
# Créer utilisateur MySQL
mysql -u root -p

CREATE USER 'metre_user'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';
GRANT ALL PRIVILEGES ON metre_pro.* TO 'metre_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Puis modifier `php/config.php` avec ces identifiants.

---

## 🚀 Configuration Production

### Sécurité

1. **Désactiver affichage erreurs** dans `php/config.php` :
```php
ini_set('display_errors', 0);
```

2. **Activer HTTPS** :
```bash
# Certbot (Let's Encrypt)
sudo certbot --apache -d votre-domaine.com
```

3. **Mots de passe forts** :
- Changer mot de passe MySQL par défaut
- Hash fort pour utilisateurs

4. **Backups automatiques** :
```bash
# Ajouter au crontab
0 2 * * * mysqldump -u user -p metre_pro > /backup/metre_$(date +\%Y\%m\%d).sql
```

### Performance

1. **Activer OPcache** dans `php.ini` :
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
```

2. **Compression Apache** :
```apache
# .htaccess
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>
```

3. **Cache navigateur** :
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

---

## 📞 Support

En cas de problème :

1. **Vérifier logs** : `logs/php_errors.log`
2. **Console navigateur** : F12 → Console
3. **Logs Apache** : `/var/log/apache2/error.log`

Contact : contact@jourt.com

---

**Installation complétée avec succès !** 🎉

Vous pouvez maintenant créer votre premier projet et commencer à mesurer !
