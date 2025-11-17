# MIGRATION localStorage → Serveur

## Problème identifié
Les projets sont stockés uniquement en localStorage du navigateur, pas sur le serveur.
Résultat : Les plans ne s'affichent pas car l'API ne trouve rien dans saves/

## Solution 1 : Diagnostic
1. Ouvrir http://192.168.2.150/optiplan/php/api/diagnostic.php
2. Vérifier que SAVES_PATH pointe vers le bon dossier
3. Vérifier que saves_writable = true

## Solution 2 : Recréer les projets
Si les projets sont uniquement en localStorage :
1. Ouvrir la console du navigateur (F12)
2. Taper : `localStorage.getItem('last_project_id')`
3. Noter tous les projets
4. Les recréer via l'interface (ils seront sauvegardés sur serveur cette fois)

## Solution 3 : Vérifier que l'API fonctionne
Ouvrir la console et taper :
```javascript
fetch('./php/api/projects.php')
  .then(r => r.json())
  .then(d => console.log('Projets sur serveur:', d))
```

Si "projects": [] → Le serveur ne contient AUCUN projet
Si erreur → Problème de chemin API

## Solution 4 : Forcer la création d'un projet de test
1. Cliquer "Nouveau projet"
2. Remplir les champs
3. Ouvrir la console Network (F12)
4. Vérifier si POST /projects.php retourne 200 OK
5. Vérifier si saves/ contient un nouveau dossier

