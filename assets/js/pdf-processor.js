/**
 * PDF Processor - Traitement des PDFs côté client
 * Utilise PDF.js pour l'extraction de texte
 */

const PDFProcessor = {
    /**
     * Extraire le texte d'un PDF
     * Note: Nécessite PDF.js (https://mozilla.github.io/pdf.js/)
     */
    async extractText(file) {
        console.log('📄 Processing PDF:', file.name);

        // TODO: Charger PDF.js
        // Pour l'instant, retourne un placeholder
        console.warn('PDF.js not loaded, using placeholder');

        return {
            text: `Contenu du PDF: ${file.name}\n\nPour activer l'extraction réelle, installez PDF.js:\n<script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"></script>`,
            pages: 1,
            filename: file.name
        };

        // TODO: Implémentation réelle avec PDF.js
        /*
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }

        return {
            text: fullText,
            pages: pdf.numPages,
            filename: file.name
        };
        */
    },

    /**
     * Chunker le texte en morceaux
     */
    chunkText(text, chunkSize = 500) {
        // Approximation: 1 token ≈ 4 caractères
        const charLimit = chunkSize * 4;
        const chunks = [];

        // Split par paragraphes
        const paragraphs = text.split(/\n\n+/);
        let currentChunk = '';

        for (const para of paragraphs) {
            if (currentChunk.length + para.length > charLimit) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = para;
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + para;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    },

    /**
     * Traiter et uploader un PDF
     */
    async processAndUpload(file, category = 'survival') {
        try {
            // 1. Extraire le texte
            const extracted = await this.extractText(file);

            // 2. Chunker le texte
            const chunks = this.chunkText(extracted.text);

            console.log(`📄 Extracted ${chunks.length} chunks from ${file.name}`);

            // 3. Upload via FormData (le backend s'occupera du reste)
            const formData = new FormData();
            formData.append('pdf', file);
            formData.append('category', category);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // 4. Optionnel: Générer les embeddings côté client
                // await this.generateEmbeddings(data.data.id, chunks);

                return {
                    success: true,
                    docId: data.data.id,
                    chunks: chunks.length
                };
            } else {
                throw new Error(data.error);
            }

        } catch (error) {
            console.error('PDF processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Générer les embeddings pour les chunks
     */
    async generateEmbeddings(docId, chunks) {
        console.log(`🧠 Generating embeddings for document ${docId}...`);

        for (let i = 0; i < chunks.length; i++) {
            const embedding = await AIEngine.embed(chunks[i]);

            // Sauvegarder dans IndexedDB
            await StorageManager.addVector(i, embedding);

            if ((i + 1) % 10 === 0) {
                console.log(`  Progress: ${i + 1}/${chunks.length}`);
            }
        }

        console.log('✓ Embeddings generated');
    }
};

window.PDFProcessor = PDFProcessor;
