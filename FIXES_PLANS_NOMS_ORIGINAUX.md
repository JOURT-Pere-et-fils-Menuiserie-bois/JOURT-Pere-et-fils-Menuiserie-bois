# ✅ CORRECTION: Conservation des noms originaux des plans

## 🔴 Problème identifié

Vous m'avez signalé que **TOUS les plans s'appelaient `plan.pdf`** au lieu de garder leur nom original d'architecte.

### Localisation du bug
```
/var/www/optiplan/saves/projet_20251114_162413_86746e81/versions/v001/plan.pdf
```

**Code problématique** (`upload.php` ligne 74):
```php
$fileName = 'plan.' . $extension;  // ❌ Tous les fichiers → "plan.pdf"
```

## ✅ Solution implémentée

### 1. Nouvelle API: `upload-plan.php`

**Caractéristiques:**
- ✅ **Conserve le nom original** du fichier
- ✅ Sécurise le nom (caractères spéciaux → `_`)
- ✅ Ajoute timestamp pour éviter collisions
- ✅ Utilise `PlanManager` (multi-plans)
- ✅ Crée le plan en **une seule opération**

**Exemple:**
```
Fichier uploadé: "Pont L'Abbé - DCE - 01 Plan Rdc.pdf"
Nom sauvegardé: "Pont_L_Abbe_-_DCE_-_01_Plan_Rdc_20251117123045.pdf"
Nom affiché: "Pont L'Abbé - DCE - 01 Plan Rdc.pdf" (original)
```

### 2. Frontend JavaScript modifié

**storage.js:**
- Nouvelle fonction `uploadPlan()` qui appelle `upload-plan.php`
- Ancienne fonction `uploadFile()` marquée `@deprecated`

**plan-manager.js:**
- `addPlan()` utilise `uploadPlan()` au lieu de 2 appels
- Affiche le nom original dans les logs et alerts
- `replacePlan()` utilise aussi le nom original

## 📊 Comparaison AVANT / APRÈS

| Aspect | AVANT (upload.php) | APRÈS (upload-plan.php) |
|--------|-------------------|------------------------|
| **Nom fichier** | `plan.pdf` | `nom_original_timestamp.pdf` |
| **Nom affiché** | `plan.pdf` | Nom original de l'architecte |
| **API utilisée** | VersionManager | PlanManager |
| **Multi-plans** | ❌ Non supporté | ✅ Supporté |
| **Collisions** | ❌ Écrase | ✅ Timestamp unique |

## 🧪 Test à effectuer

1. **Ouvrir un projet existant**
2. **Ajouter un nouveau plan** via l'interface
3. **Vérifier que le nom original apparaît** dans la liste déroulante
4. **Vérifier dans** `/var/www/optiplan/saves/[projet]/versions/[version]/`
   - Le fichier physique contient le nom + timestamp
   - La base de données (`versions.json`) contient le nom original

## 🔧 Architecture

```
Ancienne architecture (upload.php):
User → uploadFile() → upload.php → VersionManager → "plan.pdf" ❌

Nouvelle architecture (upload-plan.php):
User → uploadPlan() → upload-plan.php → PlanManager → "nom_original_timestamp.pdf" ✅
```

## ⚠️ Notes importantes

- **L'ancienne API `upload.php` existe toujours** pour compatibilité
- **Les plans existants** gardent leur nom actuel ("plan.pdf")
- **Les nouveaux plans** utiliseront la nouvelle API
- **Migration manuelle** possible si besoin (renommer les fichiers + update JSON)

## 🚀 Commits

- Commit `4a86f05`: "FIX MAJEUR: Conservation noms originaux des plans d'architecte"
- Branch: `claude/fix-missing-files-api-019ThKymB19Z7qrmBH5pFQcW`
