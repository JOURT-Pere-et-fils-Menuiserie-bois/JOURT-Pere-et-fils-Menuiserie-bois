# 📁 GUIDE D'UPLOAD DE VOS PDFs

## 🔥 MÉTHODE RAPIDE (Recommandée)

### 1. Copier directement dans le dossier

```bash
# Depuis TON PC, copie tous tes PDFs :
cp ~/the-eye.eu/public/Books/pssurvival.com/PS/**/*.pdf /chemin/vers/JOURT-Pere-et-fils-Menuiserie-bois/data/pdfs/

# OU copie dossier par dossier
cp ~/the-eye.eu/public/Books/pssurvival.com/PS/Medical/*.pdf data/pdfs/
cp ~/the-eye.eu/public/Books/pssurvival.com/PS/Military_FMs/*.pdf data/pdfs/
# etc...
```

### 2. Git add et push

```bash
cd /chemin/vers/JOURT-Pere-et-fils-Menuiserie-bois

# Ajoute TOUS les PDFs
git add data/pdfs/

# Commit
git commit -m "Add: Collection MASSIVE pssurvival.com PDFs"

# Push
git push -u origin claude/pwa-survival-ai-search-011nUPJnxD1vKz8VNnT344A5
```

## 📦 MÉTHODE SYSTÈME (Automatique)

Le système indexera automatiquement :
- Au premier lancement de l'app
- Via le Setup Wizard
- Via l'API `/api/upload`

## ⚙️ INDEXATION AUTOMATIQUE

Quand l'app démarre, elle :
1. ✅ Scanne `/data/pdfs/` pour tous les PDFs
2. ✅ Extrait le texte (PDFExtractor.php)
3. ✅ Découpe en chunks de 500 tokens
4. ✅ Crée embeddings (Transformers.js)
5. ✅ Stocke dans SQLite vectorielle
6. ✅ Prêt pour recherche AI !

## 📊 CAPACITÉS

- ✅ Fichiers jusqu'à 50MB
- ✅ Extraction texte automatique
- ✅ Catégorisation automatique
- ✅ Recherche sémantique
- ✅ LLM peut citer les PDFs

## 🎯 STRUCTURE RECOMMANDÉE

Tu peux organiser comme tu veux :
```
data/pdfs/
├── anarchist-cookbook.pdf
├── fm-21-76-survival.pdf
├── poor-mans-james-bond-v1.pdf
├── ...et tous les autres !
```

Le système gère TOUT automatiquement ! 🔥

## 🚀 APRÈS UPLOAD

1. Lance l'app : `php -S localhost:8000`
2. Ouvre navigateur : `http://localhost:8000`
3. Setup Wizard lance indexation automatique
4. ⏱️ Attends indexation (peut prendre 5-30min pour beaucoup de PDFs)
5. 🎉 Recherche fonctionne !

## 🔍 TEST RAPIDE

```bash
# Vérifie combien de PDFs
find data/pdfs -name "*.pdf" | wc -l

# Vérifie taille totale
du -sh data/pdfs/

# Liste tous les PDFs
ls -lh data/pdfs/*.pdf
```

## ⚠️ LIMITES GITHUB

- Fichier max: 100MB
- Si >100MB : utilise Git LFS
- Repo total <1GB recommandé

### Git LFS (si besoin)

```bash
git lfs install
git lfs track "*.pdf"
git add .gitattributes
git add data/pdfs/
git commit -m "Add: PDFs with LFS"
git push
```

---

**TON APP EST PRÊTE ! JUST COPY-PASTE TES PDFs !** 🚀
