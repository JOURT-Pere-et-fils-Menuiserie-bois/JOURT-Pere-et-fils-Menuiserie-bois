/**
 * Vector Search - Recherche vectorielle sémantique
 */

const VectorSearch = {
    vectors: [],
    chunks: [],

    /**
     * Initialiser avec les vecteurs depuis IndexedDB
     */
    async init() {
        console.log('🔍 Initializing Vector Search...');

        try {
            // Charger les vecteurs depuis IndexedDB
            this.vectors = await StorageManager.getAllVectors();
            console.log(`✓ Loaded ${this.vectors.length} vectors`);
        } catch (error) {
            console.error('Failed to load vectors:', error);
        }
    },

    /**
     * Recherche sémantique
     */
    async search(query, limit = 5) {
        // 1. Générer l'embedding de la requête
        const queryEmbedding = await AIEngine.embed(query);

        // 2. Si pas de vecteurs en local, fallback sur recherche API
        if (this.vectors.length === 0) {
            console.log('No local vectors, using API fallback');
            return await this.searchAPI(query, limit);
        }

        // 3. Calculer la similarité avec tous les chunks
        const scores = this.vectors.map(vector => {
            const similarity = this.cosineSimilarity(queryEmbedding, vector.embedding);
            return {
                ...vector,
                score: similarity
            };
        });

        // 4. Trier par score décroissant
        scores.sort((a, b) => b.score - a.score);

        // 5. Prendre les top-K résultats
        const topResults = scores.slice(0, limit);

        // 6. Récupérer les chunks et documents correspondants
        const results = await Promise.all(
            topResults.map(async result => {
                try {
                    const response = await fetch(`/api/documents`);
                    const data = await response.json();
                    // Trouver le document correspondant
                    // TODO: Améliorer cette partie
                    return {
                        score: result.score,
                        chunk_id: result.chunk_id,
                        content: 'Content from chunk...'
                    };
                } catch (error) {
                    return null;
                }
            })
        );

        return results.filter(r => r !== null);
    },

    /**
     * Calcul de similarité cosinus
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have same length');
        }

        let dotProduct = 0;
        let magA = 0;
        let magB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            magA += vecA[i] * vecA[i];
            magB += vecB[i] * vecB[i];
        }

        magA = Math.sqrt(magA);
        magB = Math.sqrt(magB);

        if (magA === 0 || magB === 0) {
            return 0;
        }

        return dotProduct / (magA * magB);
    },

    /**
     * Recherche hybride (BM25 + Vectorielle)
     */
    async hybridSearch(query, limit = 5) {
        // 1. Recherche vectorielle
        const vectorResults = await this.search(query, limit * 2);

        // 2. Recherche BM25 (via API)
        const bm25Results = await this.searchAPI(query, limit * 2);

        // 3. Fusionner et re-ranker
        const combined = this.mergeResults(vectorResults, bm25Results, 0.7, 0.3);

        // 4. Prendre les top-K
        return combined.slice(0, limit);
    },

    /**
     * Fusionner les résultats de plusieurs sources
     */
    mergeResults(results1, results2, weight1 = 0.5, weight2 = 0.5) {
        const merged = new Map();

        // Ajouter results1
        results1.forEach(result => {
            merged.set(result.id || result.chunk_id, {
                ...result,
                combined_score: result.score * weight1
            });
        });

        // Ajouter/fusionner results2
        results2.forEach(result => {
            const id = result.id || result.chunk_id;
            if (merged.has(id)) {
                const existing = merged.get(id);
                existing.combined_score += result.score * weight2;
            } else {
                merged.set(id, {
                    ...result,
                    combined_score: result.score * weight2
                });
            }
        });

        // Convertir en array et trier
        const results = Array.from(merged.values());
        results.sort((a, b) => b.combined_score - a.combined_score);

        return results;
    },

    /**
     * Fallback: recherche via API (BM25)
     */
    async searchAPI(query, limit = 5) {
        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, limit })
            });

            const data = await response.json();
            return data.success ? data.data.results : [];
        } catch (error) {
            console.error('API search failed:', error);
            return [];
        }
    },

    /**
     * Indexer un nouveau document (générer embeddings)
     */
    async indexDocument(docId, chunks) {
        console.log(`Indexing document ${docId} with ${chunks.length} chunks...`);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            // Générer l'embedding
            const embedding = await AIEngine.embed(chunk.content);

            // Sauvegarder dans IndexedDB
            await StorageManager.addVector(chunk.id, embedding);

            // Ajouter au cache local
            this.vectors.push({
                chunk_id: chunk.id,
                embedding: embedding
            });

            // Progress
            if ((i + 1) % 10 === 0) {
                console.log(`  Progress: ${i + 1}/${chunks.length}`);
            }
        }

        console.log(`✓ Document ${docId} indexed`);
    },

    /**
     * Recherche multi-requêtes (pour RAG)
     */
    async multiQuerySearch(queries, limit = 5) {
        const allResults = await Promise.all(
            queries.map(q => this.search(q, limit))
        );

        // Fusionner et dédupliquer
        const merged = new Map();
        allResults.flat().forEach(result => {
            const id = result.id || result.chunk_id;
            if (!merged.has(id)) {
                merged.set(id, result);
            } else {
                // Augmenter le score si trouvé plusieurs fois
                const existing = merged.get(id);
                existing.score = Math.max(existing.score, result.score);
            }
        });

        const results = Array.from(merged.values());
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, limit);
    }
};

window.VectorSearch = VectorSearch;
