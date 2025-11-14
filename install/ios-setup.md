# 🍎 Installation iOS (iPhone/iPad)

Guide pour installer Pip-Boy Survival AI sur iOS.

## Prérequis

- iOS 16.4+ (support PWA complet)
- Safari (obligatoire pour les PWA iOS)
- Serveur accessible (Raspberry Pi, ordinateur, etc.)

## Installation

### 1. Démarrer le serveur

Sur votre Raspberry Pi ou ordinateur :
```bash
cd pip-survival
php -S 0.0.0.0:8080
```

### 2. Trouver l'adresse IP du serveur

```bash
hostname -I
# Exemple: 192.168.1.100
```

### 3. Accéder depuis iOS

1. Ouvrir **Safari** (pas Chrome!)
2. Aller à `http://192.168.1.100:8080`
3. Attendre le chargement complet de l'app

### 4. Ajouter à l'écran d'accueil

1. Appuyer sur le bouton Partager (□↑)
2. Scroller et sélectionner "Sur l'écran d'accueil"
3. Nommer "Pip-Boy Survival"
4. Appuyer sur "Ajouter"

### 5. Première utilisation

1. Lancer l'app depuis l'écran d'accueil
2. L'app charge et met en cache toutes les ressources
3. Une fois chargé, mettre en mode Avion
4. Vérifier que tout fonctionne offline!

## ⚠️ Limitations iOS

### Différences avec Android

iOS a quelques restrictions sur les PWA :

1. **Stockage limité**
   - Maximum ~50-500MB selon iOS
   - iOS peut purger le cache si mémoire faible
   - Recommandé : moins de 10-15 PDFs

2. **Pas de notifications push**
   - iOS bloque les notifications pour les PWA
   - Contournement : alertes in-app uniquement

3. **Pas de background sync**
   - Sync manuelle requise
   - L'app doit être ouverte

4. **WebLLM limitations**
   - Les gros modèles peuvent ne pas fonctionner
   - Recommandé : mode lite (BM25 search)

### Solutions

**Pour contourner les limites :**

1. **Stocker moins de données**
   - Sélectionner seulement les PDFs essentiels
   - ~5-10 PDFs maximum

2. **Mode lite automatique**
   - L'app détecte iOS
   - Désactive le LLM lourd automatiquement
   - Utilise recherche BM25 (plus rapide, moins de RAM)

3. **Relancer périodiquement**
   - Ouvrir l'app 1x par semaine
   - Évite que iOS purge le cache

## Optimisations iOS

### Batterie

L'app détecte le niveau de batterie iOS :

- < 20% : Mode économie auto
- < 10% : Mode e-ink ultra économe
- Désactivation animations CRT
- Refresh rate réduit

### Stockage

**Vérifier l'espace utilisé :**
1. Réglages > Général > Stockage iPhone
2. Chercher "Safari"
3. Données de sites web

**Libérer de l'espace :**
- Supprimer les PDFs non essentiels via l'app
- Ou : Réglages > Safari > Effacer historique et données

### Mode Hors-ligne

**Préparation :**
1. Avec connexion, ouvrir l'app
2. Naviguer dans tous les modules
3. Faire quelques recherches test
4. Upload tous les PDFs nécessaires

**Utilisation offline :**
1. Activer mode Avion
2. Lancer l'app
3. Tout fonctionne!

## Spécifications iOS

**Minimum :**
- iOS 16.4+
- iPhone 8 / iPad (6th gen)
- 2GB RAM
- 500MB stockage libre
- Safari

**Optimal :**
- iOS 17+
- iPhone 12+ / iPad Pro
- 4GB+ RAM
- 2GB stockage libre

## Troubleshooting iOS

### L'app ne s'installe pas

**Solution 1 :**
- Utiliser Safari (pas Chrome/Firefox)
- Chrome iOS ne supporte pas les PWA

**Solution 2 :**
- Vérifier iOS 16.4+
- Older iOS : pas de support PWA complet

### L'app ne marche pas offline

**Solution :**
1. Supprimer l'app de l'écran d'accueil
2. Safari > Effacer historique
3. Réinstaller
4. Avec connexion, ouvrir toutes les pages
5. Essayer offline

### Recherche lente/crashs

**Solution :**
- Mode lite recommandé sur iPhone < 12
- Réduire nombre de PDFs
- Redémarrer l'iPhone

### Cache supprimé par iOS

**Symptôme :**
- App demande de recharger
- Données disparues

**Solution :**
- iOS purge le cache si mémoire faible
- Garder au moins 2GB libre
- Ouvrir l'app régulièrement (1x/semaine)

### Pas d'icône visible

**Solution :**
- L'icône peut être sur une autre page
- Chercher "Pip" dans Spotlight
- Ou réinstaller

## Mode Lite iOS (Recommandé)

Pour éviter les problèmes, l'app peut tourner en mode allégé :

### Activer le mode lite

Le mode lite est **activé automatiquement** sur iOS, mais vous pouvez le forcer :

**Désactive :**
- LLM lourd (Phi-2)
- Embeddings complexes
- Animations lourdes

**Active :**
- Recherche BM25 (keywords)
- Réponses prédéfinies
- Interface simplifiée

**Avantages :**
- Consommation RAM : ~100MB au lieu de 1.5GB
- Batterie : 50% meilleure autonomie
- Stabilité : pas de crashs
- Cache : seulement 50MB

### Performances

Mode Normal (Android/Desktop) :
- Recherche sémantique IA
- Génération de réponses contextuelles
- Génération de code

Mode Lite (iOS) :
- Recherche keywords (rapide!)
- Réponses prédéfinies (utiles!)
- Templates de code

> 💡 Le mode lite est largement suffisant pour la survie!

## Utilisation en Survie Extrême

### Scénario Apocalypse 🧟

**Préparation (24h avant) :**
1. iPhone chargé 100%
2. App installée + tous PDFs uploadés
3. Test offline complet
4. Backup de la DB sur iCloud (optionnel)

**Pendant (mode survie) :**
1. Mode Avion permanent
2. Luminosité 10-20%
3. Mode économie d'énergie iOS activé
4. App en mode e-ink auto

**Autonomie estimée :**
- iPhone 13/14 : ~3-5 jours (usage modéré)
- iPhone SE 2022 : ~2-3 jours
- iPad Pro : ~7-10 jours

**Usage modéré = 10-15 recherches/jour**

## Tips iOS

1. **Raccourcis Siri**
   - "Hey Siri, ouvre Pip-Boy"
   - Accès rapide sans unlock

2. **Widget (future)**
   - Recherche rapide depuis écran d'accueil
   - Statistiques batterie/stockage

3. **AirDrop**
   - Partager des PDFs entre iPhones
   - Pas besoin de serveur

4. **iCloud Backup**
   - Exporter `database.sqlite`
   - Upload sur iCloud Drive
   - Restaurer sur autre device

5. **Mode Focus**
   - Créer mode "Survie"
   - Autorise uniquement Pip-Boy
   - Économise encore plus de batterie

## Sécurité & Confidentialité

- ✅ Aucune donnée envoyée à Apple
- ✅ Pas de tracking
- ✅ Pas de cookies tiers
- ✅ 100% local
- ✅ Open source

iOS peut voir :
- Que vous visitez l'URL du serveur
- L'espace de cache utilisé

iOS **ne peut pas** voir :
- Le contenu de vos PDFs
- Vos recherches
- Vos notes

## Comparaison iOS vs Android

| Feature | iOS | Android |
|---------|-----|---------|
| Installation PWA | ✅ (16.4+) | ✅ |
| Offline complet | ✅ | ✅ |
| LLM local | ⚠️ Limité | ✅ Full |
| Stockage | ~500MB max | Illimité |
| Notifications | ❌ | ✅ |
| Background sync | ❌ | ✅ |
| Batterie | 🔋🔋🔋 | 🔋🔋 |
| Stabilité | ✅✅ | ✅ |

**Verdict :**
- iOS : Meilleur pour stabilité & batterie (mode lite)
- Android : Meilleur pour features complètes

---

**Stay safe out there, Vault Dweller! 🎮☢️**
