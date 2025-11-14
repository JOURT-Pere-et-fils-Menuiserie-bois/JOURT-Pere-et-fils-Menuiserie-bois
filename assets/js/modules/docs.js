/**
 * Docs Module - Gestion et visualisation des documents
 */

const DocsModule = {
    currentDoc: null,

    /**
     * Voir un document
     */
    async viewDocument(docId) {
        try {
            const response = await fetch(`/api/documents/${docId}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error('Document not found');
            }

            this.currentDoc = data.data;
            this.displayDocument(this.currentDoc);

        } catch (error) {
            console.error('Failed to load document:', error);
            alert('Failed to load document');
        }
    },

    /**
     * Afficher un document
     */
    displayDocument(doc) {
        const container = document.getElementById('module-container');

        const html = `
            <div class="module">
                <div class="module-header">
                    <h2 class="module-title">${doc.title}</h2>
                    <div class="module-actions">
                        <button class="pip-btn" onclick="app.loadModule('inv')">BACK</button>
                    </div>
                </div>

                <div class="doc-viewer">
                    <div class="doc-viewer-header">
                        <div>
                            <div style="margin-bottom: 10px;">
                                <span class="result-category">${doc.category}</span>
                            </div>
                            <div style="font-size: 14px; opacity: 0.7;">
                                ${doc.filename} • ${doc.chunks ? doc.chunks.length + ' chunks' : ''}
                            </div>
                        </div>
                    </div>

                    <div class="doc-viewer-content">
                        ${this.formatContent(doc.content)}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Formatter le contenu
     */
    formatContent(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/^#{1,6}\s+(.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
};

window.DocsModule = DocsModule;

// Export viewDocument to global scope for onclick
window.viewDocument = (docId) => DocsModule.viewDocument(docId);
