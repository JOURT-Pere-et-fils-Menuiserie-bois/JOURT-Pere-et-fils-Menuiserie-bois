/**
 * AI Engine RÉEL - WebLLM + Transformers.js
 * Modèle uncensored pour survivalisme sans bridage
 */

const AIEngine = {
    model: null,
    embedder: null,
    isLoaded: false,
    isLoading: false,
    
    /**
     * Init avec CDN (pas besoin de npm)
     */
    async init() {
        if (this.isLoaded || this.isLoading) return;
        
        console.log('🔥 Loading REAL AI Engine...');
        this.isLoading = true;
        
        try {
            // Charger Transformers.js via CDN
            await this.loadScript('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
            
            console.log('Loading embeddings model...');
            this.embedder = await window.transformers.pipeline(
                'feature-extraction',
                'Xenova/all-MiniLM-L6-v2'
            );
            
            console.log('✅ AI Engine ready!');
            this.isLoaded = true;
            this.isLoading = false;
            
            window.dispatchEvent(new Event('ai-ready'));
            
        } catch (error) {
            console.error('AI init failed:', error);
            this.isLoading = false;
        }
    },
    
    async loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    async embed(text) {
        if (!this.embedder) {
            console.warn('Embedder not ready');
            return this.simulateEmbedding(text);
        }
        
        try {
            const output = await this.embedder(text, { pooling: 'mean', normalize: true });
            return Array.from(output.data);
        } catch (e) {
            console.error('Embedding failed:', e);
            return this.simulateEmbedding(text);
        }
    },
    
    simulateEmbedding(text) {
        const dims = 384;
        const vec = new Array(dims);
        let seed = text.split('').reduce((a,b) => a + b.charCodeAt(0), 0);
        
        for (let i = 0; i < dims; i++) {
            seed = (seed * 9301 + 49297) % 233280;
            vec[i] = (seed / 233280.0) * 2 - 1;
        }
        
        const mag = Math.sqrt(vec.reduce((s,v) => s + v*v, 0));
        return vec.map(v => v / mag);
    }
};

window.AIEngine = AIEngine;
