# 📚 Bibliothèques JavaScript

✅ **Toutes les bibliothèques sont INCLUSES dans ce dossier !**

## Contenu

Ce dossier contient toutes les bibliothèques JavaScript nécessaires au bon fonctionnement de l'application. Elles sont **versionnées et commitées dans git** pour garantir la stabilité et l'autonomie complète (100% standalone).

| Fichier | Taille | Version | Description |
|---------|--------|---------|-------------|
| `pdf.min.mjs` | 416 KB | 3.11.174 | PDF.js core - Chargement et rendu PDF côté client |
| `pdf.worker.min.mjs` | 1.1 MB | 3.11.174 | PDF.js Worker - Traitement multi-thread des PDF |
| `xlsx.full.min.js` | 923 KB | 0.20.1 | SheetJS - Import/Export Excel sans backend |
| `jspdf.umd.min.js` | 356 KB | 2.5.1 | jsPDF - Génération de rapports PDF |
| `jspdf.plugin.autotable.min.js` | 37 KB | 3.5.31 | jsPDF AutoTable - Tableaux dans PDF |

**Total :** 2.7 MB

## Aucune Action Requise

🎉 **Vous n'avez RIEN à faire !**

Les bibliothèques sont déjà présentes après le clonage du repository :

```bash
git clone <repository-url>
cd JOURT-Pere-et-fils-Menuiserie-bois
php -S localhost:8000  # ← C'est tout !
```

## Pourquoi Incluses dans Git ?

Contrairement à la pratique habituelle de télécharger les dépendances via npm ou CDN, nous avons choisi d'inclure directement les bibliothèques dans le repository pour plusieurs raisons :

### ✅ Avantages

1. **100% Standalone** : Aucune connexion internet requise après clonage
2. **Versions fixes** : Pas de risque d'incompatibilité future (CDN change, versions deprecated, etc.)
3. **Installation instantanée** : Clone = application complète
4. **Environnement Docker** : Fonctionne même si CDN bloqués
5. **Pas de build** : Pas de npm install, npm run build, etc.
6. **Reproductibilité** : Même comportement sur tous les environnements

### 📦 Comparaison

**Approche traditionnelle** :
```bash
git clone <repo>
cd projet
npm install  # Télécharge 200 MB de node_modules
npm run build  # Build pendant 2 minutes
php -S localhost:8000
```

**Notre approche** :
```bash
git clone <repo>
cd projet
php -S localhost:8000  # ← C'est tout !
```

## Licences

Toutes les bibliothèques utilisées sont open-source :

- **PDF.js** : Apache License 2.0 (Mozilla)
- **SheetJS Community Edition** : Apache License 2.0
- **jsPDF** : MIT License
- **jsPDF AutoTable** : MIT License

## Versions et Sources

### PDF.js 3.11.174
- **Source** : https://github.com/mozilla/pdf.js
- **CDN d'origine** : https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/
- **Date de release** : Octobre 2023
- **Taille** : 416 KB (core) + 1.1 MB (worker)

### SheetJS 0.20.1
- **Source** : https://github.com/SheetJS/sheetjs
- **CDN d'origine** : https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/
- **Date de release** : Décembre 2023
- **Taille** : 923 KB

### jsPDF 2.5.1
- **Source** : https://github.com/parallax/jsPDF
- **CDN d'origine** : https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/
- **Date de release** : Novembre 2022
- **Taille** : 356 KB

### jsPDF AutoTable 3.5.31
- **Source** : https://github.com/simonbengtsson/jsPDF-AutoTable
- **CDN d'origine** : https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/
- **Date de release** : Février 2023
- **Taille** : 37 KB

## Mises à Jour

Les bibliothèques sont **volontairement figées** à ces versions pour garantir la stabilité. Les mises à jour sont effectuées **manuellement et testées** avant d'être commitées.

Si vous souhaitez mettre à jour une bibliothèque :

1. Télécharger la nouvelle version depuis le site officiel
2. Remplacer le fichier dans `js/lib/`
3. Tester **toutes** les fonctionnalités de l'application
4. Vérifier la compatibilité avec les autres bibliothèques
5. Mettre à jour ce README avec la nouvelle version
6. Commiter les changements

⚠️ **Ne jamais mettre à jour à la légère** - risque de régression.

---

**Dernière vérification** : 15 Novembre 2025
**Statut** : ✅ Toutes bibliothèques présentes et fonctionnelles
