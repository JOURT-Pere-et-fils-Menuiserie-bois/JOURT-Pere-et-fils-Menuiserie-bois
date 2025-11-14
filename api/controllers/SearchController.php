<?php
/**
 * SearchController - Recherche vectorielle sémantique
 */

class SearchController {
    private $vectorSearch;

    public function __construct() {
        require_once __DIR__ . '/../services/VectorSearch.php';
        $this->vectorSearch = new VectorSearch();
    }

    /**
     * POST /api/search
     * Body: { "query": "Comment purifier l'eau?", "limit": 5 }
     */
    public function search() {
        $data = getJsonInput();

        if (empty($data['query'])) {
            jsonError('Query is required', 400);
        }

        $query = $data['query'];
        $limit = isset($data['limit']) ? (int)$data['limit'] : 5;

        try {
            // Note: Pour l'instant, on fait une recherche BM25 simple
            // L'embeddings sera fait côté client avec JS
            // Cette fonction servira de fallback

            $results = $this->vectorSearch->searchBM25($query, $limit);

            jsonResponse([
                'query' => $query,
                'results' => $results,
                'count' => count($results)
            ]);

        } catch (Exception $e) {
            jsonError('Search failed', 500, $e->getMessage());
        }
    }
}
