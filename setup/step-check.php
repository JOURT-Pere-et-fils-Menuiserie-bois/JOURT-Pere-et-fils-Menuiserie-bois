<h2>🔍 VÉRIFICATION DU SYSTÈME</h2>

<div id="checks">
    <div class="check-item">⏳ Vérification en cours...</div>
</div>

<script>
(async function() {
    const checksDiv = document.getElementById('checks');
    checksDiv.innerHTML = '';

    const checks = [
        {
            name: 'Version PHP',
            check: async () => {
                const resp = await setupAPI('check_php');
                return resp.success ? { ok: true, message: `PHP ${resp.version}` } :
                       { ok: false, message: 'PHP 8.1+ requis' };
            }
        },
        {
            name: 'Extension SQLite',
            check: async () => {
                const resp = await setupAPI('check_sqlite');
                return resp.success ? { ok: true, message: 'SQLite disponible' } :
                       { ok: false, message: 'Extension SQLite manquante' };
            }
        },
        {
            name: 'Permissions écriture',
            check: async () => {
                const resp = await setupAPI('check_permissions');
                return resp.success ? { ok: true, message: 'Écriture OK' } :
                       { ok: false, message: 'Permissions insuffisantes' };
            }
        },
        {
            name: 'Espace disque',
            check: async () => {
                const resp = await setupAPI('check_disk_space');
                return resp.success && resp.space > 5 ?
                       { ok: true, message: `${resp.space}GB disponible` } :
                       { ok: false, message: 'Espace insuffisant (5GB requis)' };
            }
        },
        {
            name: 'Connexion Internet',
            check: async () => {
                try {
                    await fetch('https://cdn.jsdelivr.net/ping', { mode: 'no-cors' });
                    return { ok: true, message: 'Connexion OK' };
                } catch {
                    return { ok: false, message: 'Pas de connexion (requis pour téléchargement initial)' };
                }
            }
        },
        {
            name: 'Navigateur compatible',
            check: async () => {
                const hasIndexedDB = 'indexedDB' in window;
                const hasServiceWorker = 'serviceWorker' in navigator;
                const hasWebGL = !!document.createElement('canvas').getContext('webgl2');

                return hasIndexedDB && hasServiceWorker ?
                       { ok: true, message: `${navigator.userAgent.split(' ').pop()} - Compatible` } :
                       { ok: false, message: 'Navigateur trop ancien' };
            }
        }
    ];

    let allOk = true;

    for (const check of checks) {
        const div = document.createElement('div');
        div.className = 'check-item';
        div.innerHTML = `⏳ ${check.name}...`;
        checksDiv.appendChild(div);

        try {
            const result = await check.check();

            div.className = `check-item check-${result.ok ? 'ok' : 'error'}`;
            div.innerHTML = `${result.ok ? '✓' : '✗'} ${check.name}: ${result.message}`;

            if (!result.ok) allOk = false;

        } catch (error) {
            div.className = 'check-item check-error';
            div.innerHTML = `✗ ${check.name}: Erreur - ${error.message}`;
            allOk = false;
        }
    }

    // Afficher résumé
    const summary = document.createElement('div');
    summary.className = `stat-card ${allOk ? 'check-ok' : 'check-error'}`;
    summary.style.marginTop = '20px';
    summary.style.padding = '20px';
    summary.style.fontSize = '18px';

    if (allOk) {
        summary.innerHTML = `
            <h3 style="color: var(--color-primary);">✓ SYSTÈME COMPATIBLE</h3>
            <p>Tous les prérequis sont remplis. Vous pouvez continuer l'installation.</p>
        `;
    } else {
        summary.innerHTML = `
            <h3 style="color: #ff0000;">✗ PROBLÈMES DÉTECTÉS</h3>
            <p>Certains prérequis ne sont pas remplis. Corrigez les erreurs avant de continuer.</p>
        `;
        document.getElementById('next-btn').style.display = 'none';
    }

    checksDiv.appendChild(summary);

})();
</script>
