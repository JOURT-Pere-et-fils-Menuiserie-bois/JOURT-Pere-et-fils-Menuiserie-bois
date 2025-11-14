# 📱 Installation Android

Guide pour installer Pip-Boy Survival AI sur Android.

## Méthode 1 : PWA (Recommandé)

### Prérequis
- Navigateur Chrome ou Firefox
- Serveur accessible (Raspberry Pi, ordinateur local, etc.)

### Installation

1. **Démarrer le serveur**
   ```bash
   # Sur votre Raspberry Pi ou ordinateur
   cd pip-survival
   php -S 0.0.0.0:8080
   ```

2. **Trouver l'adresse IP**
   ```bash
   hostname -I
   # Exemple: 192.168.1.100
   ```

3. **Accéder depuis Android**
   - Ouvrir Chrome
   - Aller à `http://192.168.1.100:8080`
   - Attendre le chargement complet

4. **Installer la PWA**
   - Appuyer sur le menu (⋮)
   - Sélectionner "Ajouter à l'écran d'accueil"
   - Nommer "Pip-Boy Survival"
   - Confirmer

5. **Première utilisation**
   - Lancer l'app depuis l'écran d'accueil
   - L'app télécharge les ressources en cache
   - Une fois chargé, fonctionne 100% offline!

## Méthode 2 : Serveur local Android

### Avec Termux

1. **Installer Termux**
   - Télécharger depuis F-Droid (pas Play Store)
   - https://f-droid.org/packages/com.termux/

2. **Installer PHP dans Termux**
   ```bash
   pkg update
   pkg install php
   pkg install git
   ```

3. **Cloner le projet**
   ```bash
   cd ~
   git clone [URL_DU_REPO]
   cd pip-survival
   ```

4. **Démarrer le serveur**
   ```bash
   php -S localhost:8080
   ```

5. **Accéder**
   - Ouvrir Chrome
   - Aller à `http://localhost:8080`
   - Ajouter à l'écran d'accueil

## Optimisations Android

### Économie de batterie

L'app détecte automatiquement le niveau de batterie et active le mode économie d'énergie à < 20%.

**Mode manuel :**
- Les animations CRT sont désactivées automatiquement
- Le refresh rate est réduit
- Les effets visuels lourds sont coupés

### Mode Hors-ligne

**Téléchargement des ressources :**
- Au premier lancement, tout est mis en cache
- Les PDFs sont stockés localement
- L'IA tourne dans le navigateur (pas de serveur nécessaire)

**Gestion du cache :**
- Aller dans Settings > Apps > Pip-Boy Survival
- Storage : environ 100-500MB selon les PDFs
- Pas besoin de supprimer le cache!

### Permissions

**Requises :**
- Stockage : Pour uploader des PDFs
- Réseau : Pour la première installation uniquement

**Optionnelles :**
- GPS : Pour le module Map
- Notifications : Pour les alertes (future feature)

## Utilisation en mode Survie

### Scénario Offline Complet

1. **Préparation (avec connexion)**
   - Installer l'app
   - Uploader tous vos PDFs de survie
   - Lancer une recherche test pour générer les embeddings
   - Vérifier que tout fonctionne

2. **Mode Survie (sans connexion)**
   - Désactiver le Wifi/Data
   - Lancer l'app depuis l'écran d'accueil
   - Tout fonctionne! Recherche IA, génération de code, etc.

3. **Économie batterie extrême**
   - Activer le mode Avion
   - Réduire la luminosité à 10%
   - L'app passe en mode e-ink automatiquement
   - Autonomie : plusieurs jours en usage modéré

## Troubleshooting

### L'app ne se charge pas
- Vérifier que le serveur tourne
- Vérifier l'adresse IP
- Essayer `http://` pas `https://`

### Pas d'icône après installation
- Chrome : Menu > Ajouter à l'écran d'accueil
- Firefox : Menu > Installer

### Recherche IA ne marche pas
- Vérifier que des PDFs sont uploadés
- Lancer une recherche test avec connexion
- Les embeddings se génèrent automatiquement

### Batterie se décharge vite
- Le mode économie devrait s'activer automatiquement
- Manuellement : Settings du téléphone > Battery Saver
- L'app détectera et adaptera l'interface

## Specs Recommandées

**Minimum :**
- Android 8.0+
- 2GB RAM
- 500MB stockage libre
- Chrome 90+

**Optimal :**
- Android 10+
- 4GB RAM
- 2GB stockage libre
- Chrome 100+

## Modèles IA

L'app utilise des modèles légers qui tournent dans le navigateur :

- **Phi-2** (2.7B params, quantisé) : ~1.5GB
- **all-MiniLM-L6-v2** (embeddings) : ~80MB

Sur Android 2GB RAM : Version lite sans LLM (recherche BM25 uniquement)
Sur Android 4GB+ RAM : Version complète avec IA

## Tips & Astuces

1. **Raccourci clavier (si clavier externe)**
   - Ctrl+1-5 : Switch entre modules
   - Enter : Lancer recherche

2. **Mode paysage**
   - Meilleur affichage sur tablette
   - Layout s'adapte automatiquement

3. **Upload multiple**
   - Possible d'uploader plusieurs PDFs d'affilée
   - Laisser le téléphone branché pendant l'indexation

4. **Backup**
   - Export la DB : `data/database.sqlite`
   - Sauvegarder sur SD card ou cloud
   - Restaurer en copiant le fichier

## Sécurité

- Aucune donnée envoyée sur internet
- Tout reste sur votre appareil
- Pas de tracking, pas de cookies tiers
- Open source, code auditable

---

**Enjoy your Pip-Boy! 🎮**
