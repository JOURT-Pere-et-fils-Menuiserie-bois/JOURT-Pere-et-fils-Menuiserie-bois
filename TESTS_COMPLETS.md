# TESTS COMPLETS - CHECKLIST EXHAUSTIVE

## PRÉPARATION
- [ ] Serveur PHP démarré sur port 8000
- [ ] Navigateur ouvert sur http://192.168.2.150:8000/optiplan/
- [ ] Console développeur ouverte (F12)
- [ ] Aucune erreur dans la console au chargement

---

## TEST 1: CRÉATION DE PROJET

### Étapes:
1. Cliquer sur "+ Nouveau"
2. Remplir le formulaire:
   - Nom du projet: "TEST_COMPLET_001"
   - Client: "Test Client"
   - Référence: "REF001"
   - Adresse: "123 Test Street"
3. Cliquer "Créer"

### Vérifications:
- [ ] Modal se ferme
- [ ] Aucune erreur dans la console
- [ ] Panneau droit affiche "TEST_COMPLET_001"
- [ ] Panneau droit affiche "Test Client"
- [ ] Panneau droit affiche "REF001"

### Console logs attendus:
```
Projet créé: {project_id: "projet_...", project_name: "TEST_COMPLET_001", ...}
Projet chargé: {...}
```

### API calls attendus:
```
POST /php/api/projects.php
Response: { success: true, project: {...} }
```

### Variables globales modifiées:
- `currentProject` dans app.js
- `currentProject` dans AutoSave
- `currentProjectId` dans VersionManager

---

## TEST 2: UPLOAD DE PLAN PDF

### Étapes:
1. Cliquer sur "📄 Charger Plan"
2. Sélectionner un fichier PDF

### Vérifications:
- [ ] Modal upload se ferme
- [ ] PDF s'affiche dans le canvas
- [ ] Drop zone disparaît
- [ ] Aucune erreur dans la console
- [ ] Page info affiche "Page 1/X"

### Console logs attendus:
```
Chargement PDF: [nom_fichier].pdf
Upload réussi: {version_id: "v001", ...}
PDF chargé: [nom_fichier].pdf
Page 1 rendue
```

### API calls attendus:
```
POST /php/api/upload.php (multipart/form-data)
Response: { success: true, version: {...} }
```

### Variables globales modifiées:
- `currentVersion` dans app.js
- `currentVersion` dans AutoSave
- `pdfDoc` dans PDFLoader

### Fichiers créés sur le serveur:
- `saves/{project_id}/uploads/{hash}/{file}.pdf`
- `saves/{project_id}/versions/versions.json` (updated)
- `saves/{project_id}/versions/v001/measurements.json` (empty array)
- `saves/{project_id}/versions/v001/metadata.json`

---

## TEST 3: CALIBRATION

### Étapes:
1. Cliquer sur "⚙️ Calibrer"
2. Tracer une ligne sur le PDF (connue: ex. 10m)
3. Entrer "10" dans le champ longueur réelle
4. Sélectionner "mètres"
5. Cliquer "Confirmer"

### Vérifications:
- [ ] Modal se ferme
- [ ] Échelle calculée affichée (ex: "1:100")
- [ ] Footer affiche "Échelle: 1:XX"
- [ ] Aucune erreur dans la console

### Console logs attendus:
```
Calibration: {pixelLength: XXX, realLength: 10, unit: "m", scale: "1:XX"}
```

### Variables globales modifiées:
- `scaleFactor` dans CalibrationManager

---

## TEST 4: MESURE LIGNE

### Étapes:
1. Cliquer sur outil "Ligne" (raccourci: L)
2. Tracer une ligne sur le PDF
3. Double-cliquer pour terminer

### Vérifications:
- [ ] Ligne apparaît sur le canvas (SVG overlay)
- [ ] Ligne ajoutée au tableau en bas
- [ ] Longueur calculée correctement (en mètres)
- [ ] Code auto-généré (ex: "LIN001")
- [ ] Statistiques mises à jour (panneau droit)
- [ ] Indicateur sauvegarde passe à "⏳ Sauvegarde..." puis "💾 Sauvegardé"

### Console logs attendus:
```
Measurement created: {type: "line", points: [...], value: X.XX}
Mesure ajoutée au tableau: {...}
AutoSave: Sauvegarde réussie, 1 mesures
```

### Events PubSub:
- `EVENTS.MEASUREMENT_CREATED`
- Auto-save triggered (après 30s ou Ctrl+S)

### Variables globales modifiées:
- `measurements` array dans MeasurementTable
- `isDirty = true` dans AutoSave

---

## TEST 5: AUTO-SAVE

### Étapes:
1. Attendre 30 secondes OU appuyer Ctrl+S

### Vérifications:
- [ ] Indicateur sauvegarde passe à "⏳ Sauvegarde..."
- [ ] Puis passe à "💾 Sauvegardé" (vert)
- [ ] Aucune erreur dans la console

### Console logs attendus:
```
AutoSave: Sauvegarde réussie, 1 mesures
```

### API calls attendus:
```
POST /php/api/measurements.php
Body: {
  project_id: "projet_...",
  version_id: "v001",
  measurements: [...]
}
Response: { success: true, measurements: [...] }
```

### Fichiers modifiés sur le serveur:
- `saves/{project_id}/versions/v001/measurements.json` (updated with array)

---

## TEST 6: FERMER ET ROUVRIR PROJET

### Étapes:
1. Rafraîchir la page (F5)
2. Cliquer sur "📂 Ouvrir Projet"
3. Cliquer sur "Ouvrir" sur le projet "TEST_COMPLET_001"

### Vérifications:
- [ ] Modal se ferme
- [ ] Projet chargé dans panneau droit
- [ ] PDF affiché automatiquement
- [ ] Mesures affichées dans le tableau
- [ ] Mesures dessinées sur le canvas
- [ ] Statistiques correctes

### Console logs attendus:
```
Ouverture du projet: projet_...
Projet chargé: {...}
Versions trouvées: 1
Chargement de la version: v001
PDF chargé: [filename].pdf
Mesures chargées: 1
✅ Projet "TEST_COMPLET_001" ouvert avec 1 version(s)
```

### API calls attendus (dans l'ordre):
```
1. GET /php/api/projects.php?id={project_id}
   Response: { success: true, project: {...} }

2. GET /php/api/versions.php?project_id={project_id}
   Response: { success: true, versions: [{...}] }

3. GET /php/api/measurements.php?project_id={project_id}&version_id=v001
   Response: { success: true, measurements: [{...}] }
```

### Variables globales restaurées:
- `currentProject`
- `currentVersion`
- `currentProjectId`
- `measurements` array
- `pdfDoc`

---

## TEST 7: NAVIGATION PDF (si multi-pages)

### Étapes:
1. Cliquer sur "▶" (page suivante)
2. Cliquer sur "◀" (page précédente)

### Vérifications:
- [ ] Page change dans le canvas
- [ ] Footer affiche "Page X/Y" correctement
- [ ] Boutons disabled/enabled selon la page
- [ ] Annotations restent visibles

### Console logs attendus:
```
Page 2 rendue
pdf:page:changed {currentPage: 2, totalPages: X}
```

---

## TEST 8: RACCOURCIS CLAVIER

### Tests:
- [ ] **Ctrl+O** : Ouvre modal projets
- [ ] **Ctrl+N** : Ouvre modal nouveau projet
- [ ] **Ctrl+S** : Sauvegarde immédiatement
- [ ] **Ctrl+P** : Ouvre sélection fichier
- [ ] **V** : Active outil sélection
- [ ] **L** : Active outil ligne
- [ ] **+** : Zoom avant
- [ ] **-** : Zoom arrière
- [ ] **0** : Ajuster zoom
- [ ] **Escape** : Annule/Désélectionne
- [ ] **F1** : Affiche aide raccourcis

### Vérifications:
- [ ] Tous les raccourcis fonctionnent
- [ ] Aucune erreur dans la console
- [ ] F1 affiche un alert avec la liste complète

---

## TEST 9: GESTION VERSIONS

### Étapes:
1. Upload un nouveau PDF (même projet)
2. Cliquer sur "📋 Versions"
3. Vérifier que 2 versions sont listées
4. Cliquer "Charger" sur la version v001

### Vérifications:
- [ ] Modal versions affiche 2 versions
- [ ] Version v002 marquée "Actuelle"
- [ ] Chargement v001 fonctionne
- [ ] PDF et mesures de v001 restaurés
- [ ] Modal se ferme

### Console logs attendus:
```
Mesures chargées pour version: v001, 1
Version v001 chargée
```

### API calls attendus:
```
GET /php/api/measurements.php?project_id={project_id}&version_id=v001
Response: { success: true, measurements: [...] }
```

---

## TEST 10: ERREURS ET CAS LIMITES

### Test 10.1: Pas de projet ouvert + Upload
**Étape:** Rafraîchir, cliquer "Charger Plan" sans créer de projet
**Attendu:** Alert "Aucun projet ouvert"

### Test 10.2: Projet sans versions + Ouvrir
**Étape:** Ouvrir un projet qui n'a jamais eu de PDF
**Attendu:**
- [ ] Projet se charge
- [ ] Message "✅ Projet ouvert (aucun plan)"
- [ ] Aucune erreur

### Test 10.3: Serveur PHP arrêté
**Étape:** Arrêter serveur, cliquer "Ouvrir Projet"
**Attendu:**
- [ ] Modal affiche erreur réseau
- [ ] Bouton "Réessayer" présent
- [ ] Pas de crash JavaScript

### Test 10.4: Upload fichier non-PDF
**Étape:** Essayer d'uploader un .jpg
**Attendu:** Erreur avant envoi au serveur

---

## RÉSUMÉ DES VÉRIFICATIONS GLOBALES

### Console (onglet Console):
- [ ] Aucune erreur rouge
- [ ] Logs cohérents et dans le bon ordre
- [ ] Pas de "undefined" ou "null" inattendus

### Réseau (onglet Network):
- [ ] Tous les appels API retournent 200 OK
- [ ] Aucun 400/404/500
- [ ] Réponses JSON valides

### Application:
- [ ] Interface réactive
- [ ] Pas de freeze/lag
- [ ] Modales s'ouvrent/ferment correctement
- [ ] Données persistées après rafraîchissement

### Fichiers serveur:
- [ ] Structure correcte dans `saves/{project_id}/`
- [ ] JSON valides et bien formatés
- [ ] PDF uploadés présents
- [ ] Pas de fichiers corrompus

---

## CHECKLIST FINALE

- [ ] Tous les tests 1-10 passés
- [ ] Aucune erreur console
- [ ] Aucune erreur API
- [ ] Données sauvegardées et restaurées correctement
- [ ] Raccourcis clavier fonctionnels
- [ ] Auto-save fonctionne
- [ ] Multi-versions fonctionne
- [ ] PDF.js charge depuis CDN
- [ ] Interface fluide et responsive

---

## BUGS CONNUS À SURVEILLER

1. **PDF.js Worker**: Vérifier que pas d'erreur "fake worker"
2. **API paths**: Vérifier chemins relatifs OK en sous-dossier
3. **Measurements format**: Vérifier extraction correcte `measurements` vs objet complet
4. **project_id + version_id**: Vérifier TOUS les appels passent les 2 paramètres
5. **currentProjectId**: Vérifier initialisé avant utilisation dans VersionManager

---

## PROCHAINES ÉTAPES SI TOUT FONCTIONNE

1. Implémenter outils de dessin restants (polygone, cercle, comptage)
2. Ajouter export Excel/PDF
3. Ajouter comparaison visuelle entre versions
4. Améliorer calibration (multi-unités, rotation)
5. Ajouter gestion utilisateurs et permissions
