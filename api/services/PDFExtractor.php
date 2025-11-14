<?php
/**
 * PDFExtractor - Extraction de texte depuis PDF
 * Utilise pdftotext (poppler-utils) comme backend
 */

class PDFExtractor {

    /**
     * Extraire le texte d'un PDF
     */
    public function extract($pdfPath) {
        if (!file_exists($pdfPath)) {
            throw new Exception('PDF file not found: ' . $pdfPath);
        }

        // Méthode 1: pdftotext (command line)
        if ($this->commandExists('pdftotext')) {
            return $this->extractWithPdftotext($pdfPath);
        }

        // Méthode 2: Fallback - lecture basique (limité)
        return $this->extractBasic($pdfPath);
    }

    /**
     * Extraction avec pdftotext (poppler-utils)
     */
    private function extractWithPdftotext($pdfPath) {
        $outputPath = $pdfPath . '.txt';

        // Exécuter pdftotext
        $command = sprintf(
            'pdftotext -layout -enc UTF-8 %s %s 2>&1',
            escapeshellarg($pdfPath),
            escapeshellarg($outputPath)
        );

        exec($command, $output, $returnCode);

        if ($returnCode !== 0 || !file_exists($outputPath)) {
            throw new Exception('pdftotext extraction failed: ' . implode("\n", $output));
        }

        $text = file_get_contents($outputPath);
        unlink($outputPath); // Nettoyer

        return $this->cleanText($text);
    }

    /**
     * Extraction basique (fallback)
     * Note: Très limité, recommande d'installer poppler-utils
     */
    private function extractBasic($pdfPath) {
        // Lire le contenu brut du PDF
        $content = file_get_contents($pdfPath);

        // Extraire le texte de manière très basique (pas fiable à 100%)
        // Cherche les objets texte dans le PDF
        if (preg_match_all('/\((.*?)\)/s', $content, $matches)) {
            $text = implode("\n", $matches[1]);
            return $this->cleanText($text);
        }

        // Si ça ne marche pas, retourner un message
        return "⚠️  PDF extraction failed. Please install poppler-utils:\n" .
               "  sudo apt-get install poppler-utils (Debian/Ubuntu)\n" .
               "  brew install poppler (macOS)\n\n" .
               "Filename: " . basename($pdfPath);
    }

    /**
     * Nettoyer le texte extrait
     */
    private function cleanText($text) {
        // Supprimer les caractères de contrôle
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $text);

        // Normaliser les sauts de ligne
        $text = preg_replace('/\r\n|\r/', "\n", $text);

        // Supprimer les lignes vides multiples
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        // Trim
        $text = trim($text);

        return $text;
    }

    /**
     * Vérifier si une commande existe
     */
    private function commandExists($command) {
        $which = stripos(PHP_OS, 'WIN') === 0 ? 'where' : 'which';
        $output = shell_exec("$which $command 2>&1");
        return !empty($output);
    }

    /**
     * Extraire par pages
     */
    public function extractByPages($pdfPath) {
        // TODO: Implémenter extraction page par page
        // Pour l'instant, retourne tout le contenu
        $fullText = $this->extract($pdfPath);
        return [['page' => 1, 'text' => $fullText]];
    }
}
