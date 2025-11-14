/**
 * Search Module - Module de recherche IA
 */

const SearchModule = {
    isSearching: false,

    /**
     * Initialiser le module
     */
    init() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput && searchBtn) {
            // Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });

            // Click button
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });

            console.log('✓ Search Module initialized');
        }
    },

    /**
     * Effectuer une recherche
     */
    async performSearch() {
        if (this.isSearching) return;

        const input = document.getElementById('search-input');
        const query = input.value.trim();

        if (!query) {
            alert('Please enter a search query');
            return;
        }

        this.isSearching = true;
        this.showLoading();

        try {
            // 1. Recherche vectorielle
            console.log('🔍 Searching for:', query);
            const results = await VectorSearch.searchAPI(query, 5);

            // 2. Construire le contexte pour l'IA
            const context = results.map(r => r.content).join('\n\n');

            // 3. Générer la réponse IA
            console.log('🤖 Generating AI response...');
            const aiResponse = await AIEngine.generate(query, { context });

            // 4. Afficher les résultats
            this.displayResults(query, results, aiResponse);

        } catch (error) {
            console.error('Search failed:', error);
            this.showError('Search failed: ' + error.message);
        } finally {
            this.isSearching = false;
        }
    },

    /**
     * Afficher loading
     */
    showLoading() {
        const container = document.getElementById('search-results');
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">SEARCHING DATABASE...</div>
            </div>
        `;
    },

    /**
     * Afficher une erreur
     */
    showError(message) {
        const container = document.getElementById('search-results');
        container.innerHTML = `
            <div class="error-message">
                ⚠️ ${message}
            </div>
        `;
    },

    /**
     * Afficher les résultats
     */
    displayResults(query, results, aiResponse) {
        const container = document.getElementById('search-results');

        let html = '';

        // Réponse de l'IA
        html += `
            <div class="ai-response">
                <div class="ai-response-header">
                    <span>🤖 AI RESPONSE</span>
                </div>
                <div class="ai-response-content">
                    ${this.formatText(aiResponse)}
                </div>
                ${results.length > 0 ? `
                    <div class="ai-sources">
                        📚 Sources: ${results.length} document(s) found
                    </div>
                ` : ''}
            </div>
        `;

        // Résultats de recherche
        if (results.length > 0) {
            html += '<h3 style="margin-top: 20px; margin-bottom: 10px;">SEARCH RESULTS</h3>';

            results.forEach((result, index) => {
                const score = (result.score * 100).toFixed(1);
                html += `
                    <div class="result-item">
                        <div class="result-header">
                            <div class="result-title">${result.title || 'Document #' + result.doc_id}</div>
                            <div class="result-score">${score}%</div>
                        </div>
                        ${result.category ? `
                            <span class="result-category">${result.category}</span>
                        ` : ''}
                        <div class="result-content">
                            ${this.highlightQuery(result.content, query)}
                        </div>
                    </div>
                `;
            });
        } else {
            html += `
                <div class="stat-card" style="margin-top: 20px;">
                    No results found. Try adding more survival PDFs to the database.
                </div>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Formatter le texte (markdown-like)
     */
    formatText(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    },

    /**
     * Surligner les termes de la requête
     */
    highlightQuery(text, query) {
        if (!text) return '';

        const words = query.toLowerCase().split(/\s+/);
        let highlighted = text;

        words.forEach(word => {
            if (word.length > 2) {
                const regex = new RegExp(`(${word})`, 'gi');
                highlighted = highlighted.replace(regex, '<span class="result-highlight">$1</span>');
            }
        });

        // Limiter la longueur
        if (highlighted.length > 500) {
            highlighted = highlighted.substring(0, 500) + '...';
        }

        return highlighted;
    }
};

window.SearchModule = SearchModule;
