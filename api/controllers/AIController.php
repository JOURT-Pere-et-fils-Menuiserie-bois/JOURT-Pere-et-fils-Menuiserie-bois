<?php
/**
 * AIController - Génération IA
 * Note: L'IA tourne côté client en JavaScript
 * Ce controller sert de fallback/proxy si besoin
 */

class AIController {

    /**
     * POST /api/ai/generate
     * Body: { "prompt": "...", "context": "..." }
     */
    public function generate() {
        $data = getJsonInput();

        if (empty($data['prompt'])) {
            jsonError('Prompt is required', 400);
        }

        // L'IA tourne côté client, ce endpoint retourne juste un message
        jsonResponse([
            'message' => 'AI generation is handled client-side',
            'hint' => 'Use the WebLLM engine in JavaScript for local inference',
            'prompt' => $data['prompt']
        ]);
    }

    /**
     * POST /api/ai/embed
     * Body: { "text": "..." }
     */
    public function embed() {
        $data = getJsonInput();

        if (empty($data['text'])) {
            jsonError('Text is required', 400);
        }

        // Embeddings sont générés côté client
        jsonResponse([
            'message' => 'Embeddings are generated client-side',
            'hint' => 'Use Transformers.js for local embeddings'
        ]);
    }

    /**
     * GET /api/ai/status
     */
    public function status() {
        jsonResponse([
            'ai_location' => 'client-side (browser)',
            'recommended_model' => 'Phi-2 (2.7B, quantized)',
            'embeddings_model' => 'all-MiniLM-L6-v2',
            'offline' => true
        ]);
    }
}
