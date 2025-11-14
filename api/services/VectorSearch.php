<?php
/**
 * VectorSearch - Recherche vectorielle et BM25
 * Note: Les embeddings vectoriels sont gérés côté client (JS)
 * Ce service fournit une recherche BM25 comme fallback
 */

class VectorSearch {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Recherche BM25 (keyword-based avec ranking)
     */
    public function searchBM25($query, $limit = 5) {
        // Tokenizer la requête
        $queryTerms = $this->tokenize($query);

        if (empty($queryTerms)) {
            return [];
        }

        // Récupérer tous les chunks avec leurs documents
        $sql = "
            SELECT
                c.*,
                d.title,
                d.category,
                d.filename
            FROM chunks c
            JOIN documents d ON c.doc_id = d.id
        ";
        $chunks = $this->db->fetchAll($sql);

        // Calculer le score BM25 pour chaque chunk
        $scored = [];
        $totalDocs = count($chunks);

        foreach ($chunks as $chunk) {
            $score = $this->calculateBM25($queryTerms, $chunk['content'], $totalDocs);

            if ($score > 0) {
                $scored[] = array_merge($chunk, ['score' => $score]);
            }
        }

        // Trier par score décroissant
        usort($scored, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        // Limiter les résultats
        return array_slice($scored, 0, $limit);
    }

    /**
     * Calculer le score BM25
     * k1 = 1.5, b = 0.75 (valeurs standard)
     */
    private function calculateBM25($queryTerms, $document, $totalDocs, $k1 = 1.5, $b = 0.75) {
        $docTerms = $this->tokenize($document);
        $docLength = count($docTerms);
        $avgDocLength = 100; // Approximation

        $termFreq = array_count_values($docTerms);
        $score = 0;

        foreach ($queryTerms as $term) {
            if (!isset($termFreq[$term])) {
                continue;
            }

            $tf = $termFreq[$term];
            $idf = log(($totalDocs - 1 + 0.5) / (1 + 0.5)); // Approximation simplifiée

            $numerator = $tf * ($k1 + 1);
            $denominator = $tf + $k1 * (1 - $b + $b * ($docLength / $avgDocLength));

            $score += $idf * ($numerator / $denominator);
        }

        return $score;
    }

    /**
     * Tokenizer simple
     */
    private function tokenize($text) {
        // Convertir en minuscules
        $text = mb_strtolower($text, 'UTF-8');

        // Supprimer la ponctuation
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);

        // Split en mots
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        // Supprimer les stop words (français)
        $stopWords = ['le', 'la', 'les', 'de', 'un', 'une', 'et', 'est', 'pour', 'que', 'qui', 'dans', 'a', 'en'];
        $words = array_filter($words, function($word) use ($stopWords) {
            return !in_array($word, $stopWords) && strlen($word) > 2;
        });

        return array_values($words);
    }

    /**
     * Recherche hybride (BM25 + cosine similarity)
     * Cette méthode sera appelée depuis le JS avec des embeddings
     */
    public function hybridSearch($query, $queryEmbedding, $limit = 5) {
        // 1. Recherche BM25
        $bm25Results = $this->searchBM25($query, $limit * 2);

        // 2. Récupérer les vecteurs correspondants (si disponibles)
        // Cette partie sera complétée par le JS

        return $bm25Results;
    }
}
