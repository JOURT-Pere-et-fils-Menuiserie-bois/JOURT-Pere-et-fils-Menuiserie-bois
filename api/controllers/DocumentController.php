<?php
/**
 * DocumentController - Gestion des documents
 */

class DocumentController {
    private $model;

    public function __construct() {
        $this->model = new Document();
    }

    /**
     * GET /api/documents
     */
    public function getAll() {
        $filters = [];

        if (isset($_GET['category'])) {
            $filters['category'] = sanitize($_GET['category']);
        }
        if (isset($_GET['search'])) {
            $filters['search'] = sanitize($_GET['search']);
        }
        if (isset($_GET['limit'])) {
            $filters['limit'] = (int)$_GET['limit'];
        }

        $documents = $this->model->getAll($filters);
        jsonResponse($documents);
    }

    /**
     * GET /api/documents/{id}
     */
    public function get($id) {
        $doc = $this->model->get($id);
        if (!$doc) {
            jsonError('Document not found', 404);
        }

        // Ajouter les chunks
        $doc['chunks'] = $this->model->getChunks($id);

        jsonResponse($doc);
    }

    /**
     * POST /api/documents
     */
    public function create() {
        $data = getJsonInput();

        if (empty($data['title'])) {
            jsonError('Title is required', 400);
        }
        if (empty($data['content'])) {
            jsonError('Content is required', 400);
        }

        $title = sanitize($data['title']);
        $filename = sanitize($data['filename'] ?? '');
        $category = sanitize($data['category'] ?? 'general');
        $content = $data['content']; // Pas de sanitize pour le contenu brut
        $metadata = $data['metadata'] ?? [];

        try {
            $docId = $this->model->create($title, $filename, $category, $content, $metadata);

            // Chunker le contenu
            $chunks = $this->chunkContent($content);
            foreach ($chunks as $index => $chunk) {
                $this->model->createChunk($docId, $chunk, null, $index);
            }

            jsonResponse([
                'id' => $docId,
                'message' => 'Document created successfully',
                'chunks' => count($chunks)
            ], 201);

        } catch (Exception $e) {
            jsonError('Failed to create document', 500, $e->getMessage());
        }
    }

    /**
     * PUT /api/documents/{id}
     */
    public function update($id) {
        $data = getJsonInput();

        if (empty($data)) {
            jsonError('No data provided', 400);
        }

        $allowed = ['title', 'category', 'content', 'metadata'];
        $updateData = [];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $field === 'content' ? $data[$field] : sanitize($data[$field]);
            }
        }

        try {
            $updated = $this->model->update($id, $updateData);
            if ($updated === 0) {
                jsonError('Document not found', 404);
            }

            jsonResponse(['message' => 'Document updated successfully']);

        } catch (Exception $e) {
            jsonError('Failed to update document', 500, $e->getMessage());
        }
    }

    /**
     * DELETE /api/documents/{id}
     */
    public function delete($id) {
        try {
            $deleted = $this->model->delete($id);
            if ($deleted === 0) {
                jsonError('Document not found', 404);
            }

            jsonResponse(['message' => 'Document deleted successfully']);

        } catch (Exception $e) {
            jsonError('Failed to delete document', 500, $e->getMessage());
        }
    }

    /**
     * POST /api/upload (upload PDF)
     */
    public function upload() {
        if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
            jsonError('No file uploaded or upload error', 400);
        }

        $file = $_FILES['pdf'];
        $allowedTypes = ['application/pdf'];

        if (!in_array($file['type'], $allowedTypes)) {
            jsonError('Only PDF files are allowed', 400);
        }

        // Taille max 50MB
        if ($file['size'] > 50 * 1024 * 1024) {
            jsonError('File too large (max 50MB)', 400);
        }

        try {
            $filename = basename($file['name']);
            $safeName = preg_replace('/[^a-zA-Z0-9_\-.]/', '_', $filename);
            $destination = PDF_PATH . '/' . time() . '_' . $safeName;

            if (!move_uploaded_file($file['tmp_name'], $destination)) {
                throw new Exception('Failed to move uploaded file');
            }

            // Extraire le texte du PDF
            require_once __DIR__ . '/../services/PDFExtractor.php';
            $extractor = new PDFExtractor();
            $text = $extractor->extract($destination);

            if (empty($text)) {
                throw new Exception('Failed to extract text from PDF');
            }

            // Créer le document
            $category = $_POST['category'] ?? 'survival';
            $docId = $this->model->create(
                pathinfo($filename, PATHINFO_FILENAME),
                $safeName,
                $category,
                $text,
                ['original_name' => $filename, 'size' => $file['size']]
            );

            // Chunker et créer les chunks
            $chunks = $this->chunkContent($text);
            foreach ($chunks as $index => $chunk) {
                $this->model->createChunk($docId, $chunk, null, $index);
            }

            jsonResponse([
                'id' => $docId,
                'filename' => $safeName,
                'message' => 'PDF uploaded and processed successfully',
                'chunks' => count($chunks)
            ], 201);

        } catch (Exception $e) {
            jsonError('Failed to process PDF', 500, $e->getMessage());
        }
    }

    /**
     * Chunker le contenu en morceaux de ~500 tokens
     */
    private function chunkContent($content, $chunkSize = 500) {
        // Approximation : 1 token ≈ 4 caractères
        $charLimit = $chunkSize * 4;
        $chunks = [];

        // Split par paragraphes
        $paragraphs = preg_split('/\n\n+/', $content);
        $currentChunk = '';

        foreach ($paragraphs as $para) {
            if (strlen($currentChunk) + strlen($para) > $charLimit) {
                if (!empty($currentChunk)) {
                    $chunks[] = trim($currentChunk);
                }
                $currentChunk = $para;
            } else {
                $currentChunk .= ($currentChunk ? "\n\n" : '') . $para;
            }
        }

        if (!empty($currentChunk)) {
            $chunks[] = trim($currentChunk);
        }

        return $chunks;
    }
}
