/**
 * Code Generator Module - Génération de code avec IA
 */

const CodeGenModule = {
    currentCode: '',
    currentLanguage: 'python',

    /**
     * Render le module
     */
    render() {
        return `
            <div class="module">
                <div class="module-header">
                    <h2 class="module-title">CODE GENERATOR</h2>
                </div>

                <div class="codegen-container">
                    <label style="margin-bottom: 8px; display: block;">PROMPT:</label>
                    <textarea class="code-prompt" id="code-prompt" placeholder="Describe what code you want to generate...
Example: Create a Python script to purify water data"></textarea>

                    <div style="display: flex; gap: 10px; align-items: center;">
                        <label>LANGUAGE:</label>
                        <select class="pip-input" id="code-language" style="width: 150px;">
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="bash">Bash</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                        </select>
                        <button class="pip-btn" onclick="CodeGenModule.generate()">GENERATE</button>
                    </div>

                    <div id="code-output-container"></div>
                </div>
            </div>
        `;
    },

    /**
     * Générer le code
     */
    async generate() {
        const prompt = document.getElementById('code-prompt').value.trim();
        const language = document.getElementById('code-language').value;

        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }

        const container = document.getElementById('code-output-container');
        container.innerHTML = `
            <div class="loading" style="margin-top: 20px;">
                <div class="loading-spinner"></div>
                <div class="loading-text">GENERATING CODE...</div>
            </div>
        `;

        try {
            // Générer le code avec l'IA
            const code = await AIEngine.generateCode(prompt, language);

            this.currentCode = code;
            this.currentLanguage = language;

            this.displayCode(code, language);

        } catch (error) {
            console.error('Code generation failed:', error);
            container.innerHTML = `
                <div class="error-message">
                    Code generation failed: ${error.message}
                </div>
            `;
        }
    },

    /**
     * Afficher le code généré
     */
    displayCode(code, language) {
        const container = document.getElementById('code-output-container');

        container.innerHTML = `
            <div class="code-output" style="margin-top: 20px;">
                <div class="code-header">
                    <span class="code-language">${language.toUpperCase()}</span>
                    <button class="code-copy-btn" onclick="CodeGenModule.copyCode()">COPY</button>
                </div>
                <pre class="code-block">${this.escapeHtml(code)}</pre>
            </div>
        `;
    },

    /**
     * Copier le code
     */
    async copyCode() {
        try {
            await navigator.clipboard.writeText(this.currentCode);
            alert('Code copied to clipboard!');
        } catch (error) {
            console.error('Copy failed:', error);
            // Fallback
            this.fallbackCopy(this.currentCode);
        }
    },

    /**
     * Fallback copy
     */
    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Code copied!');
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.CodeGenModule = CodeGenModule;
