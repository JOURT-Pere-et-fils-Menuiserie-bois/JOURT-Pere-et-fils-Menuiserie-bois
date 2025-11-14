<?php
/**
 * Document Model
 */

class Document {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un document
     */
    public function create($title, $filename, $category, $content, $metadata = []) {
        $data = [
            'title' => $title,
            'filename' => $filename,
            'category' => $category,
            'content' => $content,
            'metadata' => json_encode($metadata)
        ];

        return $this->db->insert('documents', $data);
    }

    /**
     * Récupérer un document
     */
    public function get($id) {
        $doc = $this->db->fetchOne('SELECT * FROM documents WHERE id = ?', [$id]);
        if ($doc) {
            $doc['metadata'] = json_decode($doc['metadata'], true);
        }
        return $doc;
    }

    /**
     * Récupérer tous les documents
     */
    public function getAll($filters = []) {
        $sql = 'SELECT * FROM documents';
        $params = [];
        $conditions = [];

        if (!empty($filters['category'])) {
            $conditions[] = 'category = :category';
            $params['category'] = $filters['category'];
        }

        if (!empty($filters['search'])) {
            $conditions[] = '(title LIKE :search OR content LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        if ($conditions) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' ORDER BY created_at DESC';

        if (!empty($filters['limit'])) {
            $sql .= ' LIMIT ' . (int)$filters['limit'];
        }

        $docs = $this->db->fetchAll($sql, $params);
        foreach ($docs as &$doc) {
            $doc['metadata'] = json_decode($doc['metadata'], true);
        }

        return $docs;
    }

    /**
     * Mettre à jour un document
     */
    public function update($id, $data) {
        if (isset($data['metadata'])) {
            $data['metadata'] = json_encode($data['metadata']);
        }
        $data['updated_at'] = date('Y-m-d H:i:s');

        return $this->db->update('documents', $data, 'id = :id', ['id' => $id]);
    }

    /**
     * Supprimer un document
     */
    public function delete($id) {
        return $this->db->delete('documents', 'id = ?', [$id]);
    }

    /**
     * Créer un chunk
     */
    public function createChunk($docId, $content, $page = null, $chunkIndex = null) {
        $data = [
            'doc_id' => $docId,
            'content' => $content,
            'page' => $page,
            'chunk_index' => $chunkIndex
        ];

        return $this->db->insert('chunks', $data);
    }

    /**
     * Récupérer les chunks d'un document
     */
    public function getChunks($docId) {
        return $this->db->fetchAll(
            'SELECT * FROM chunks WHERE doc_id = ? ORDER BY chunk_index',
            [$docId]
        );
    }

    /**
     * Créer un vecteur (embedding)
     */
    public function createVector($chunkId, $embedding) {
        // Sérialiser l'embedding (array de floats)
        $embeddingBlob = $this->serializeEmbedding($embedding);

        $data = [
            'chunk_id' => $chunkId,
            'embedding' => $embeddingBlob
        ];

        return $this->db->insert('vectors', $data);
    }

    /**
     * Récupérer tous les vecteurs
     */
    public function getAllVectors() {
        $vectors = $this->db->fetchAll('SELECT * FROM vectors');
        foreach ($vectors as &$vector) {
            $vector['embedding'] = $this->unserializeEmbedding($vector['embedding']);
        }
        return $vectors;
    }

    /**
     * Sérialiser un embedding pour SQLite
     */
    private function serializeEmbedding($embedding) {
        // Convertir array de floats en blob binaire
        return pack('f*', ...$embedding);
    }

    /**
     * Désérialiser un embedding depuis SQLite
     */
    private function unserializeEmbedding($blob) {
        // Convertir blob binaire en array de floats
        return unpack('f*', $blob);
    }

    /**
     * Statistiques
     */
    public function getStats() {
        return [
            'total' => $this->db->count('documents'),
            'chunks' => $this->db->count('chunks'),
            'vectors' => $this->db->count('vectors'),
            'categories' => $this->db->fetchAll(
                'SELECT category, COUNT(*) as count FROM documents GROUP BY category'
            )
        ];
    }
}
