<h2>📚 TÉLÉCHARGEMENT DU CONTENU SURVIVAL</h2>

<p>Sélectionnez le pack à télécharger. Tout sera stocké localement et disponible offline.</p>

<div class="stat-card">
    <h3>Packs disponibles :</h3>

    <label style="display: block; padding: 15px; margin: 10px 0; border: 2px solid var(--color-primary); cursor: pointer;">
        <input type="radio" name="pack" value="essential" checked style="margin-right: 10px;">
        <strong>ESSENTIEL</strong> (~500MB, ~30min)
        <ul style="margin-left: 40px; margin-top: 10px;">
            <li>Anarchist Cookbook</li>
            <li>US Army Survival FM 21-76</li>
            <li>TM 31-210 Improvised Munitions</li>
            <li>MIT Lock Picking Guide</li>
            <li>Where There Is No Doctor</li>
            <li>SAS Survival Handbook</li>
            <li>Nuclear War Survival Skills</li>
        </ul>
    </label>

    <label style="display: block; padding: 15px; margin: 10px 0; border: 2px solid var(--color-primary); cursor: pointer;">
        <input type="radio" name="pack" value="complete" style="margin-right: 10px;">
        <strong>COMPLET</strong> (~2GB, ~1-2h)
        <ul style="margin-left: 40px; margin-top: 10px;">
            <li>Tout le pack ESSENTIEL +</li>
            <li>Poor Man's James Bond (4 volumes)</li>
            <li>Ragnar Benson collection</li>
            <li>Medical handbooks complets</li>
            <li>Electronics & hacking guides</li>
            <li>Urban survival collection</li>
        </ul>
    </label>

    <label style="display: block; padding: 15px; margin: 10px 0; border: 2px solid var(--color-primary); cursor: pointer;">
        <input type="radio" name="pack" value="apocalypse" style="margin-right: 10px;">
        <strong>APOCALYPSE</strong> (~5GB, ~3-4h)
        <ul style="margin-left: 40px; margin-top: 10px;">
            <li>TOUT le contenu disponible</li>
            <li>Archives complètes</li>
            <li>Vidéos tutoriels</li>
            <li>Maximum de connaissances</li>
        </ul>
    </label>

    <label style="display: block; padding: 15px; margin: 10px 0; border: 2px solid #ffaa00; cursor: pointer;">
        <input type="radio" name="pack" value="skip" style="margin-right: 10px;">
        <strong>PASSER</strong> (télécharger plus tard)
        <p style="margin-left: 40px; margin-top: 10px;">
            Vous pourrez télécharger du contenu manuellement depuis l'interface.
        </p>
    </label>
</div>

<div style="margin: 20px 0;">
    <button class="pip-btn" id="start-download" onclick="startDownload()" style="width: 100%; font-size: 20px; padding: 15px;">
        🔽 LANCER LE TÉLÉCHARGEMENT
    </button>
</div>

<div id="download-status" style="display: none;">
    <h3>📥 Téléchargement en cours...</h3>

    <div class="progress-bar">
        <div class="progress-fill" id="download-progress" style="width: 0%"></div>
    </div>

    <div id="download-info" style="text-align: center; margin: 10px 0; font-size: 18px;">
        Initialisation...
    </div>

    <div class="log-output" id="download-log"></div>

    <div class="stat-card" style="margin-top: 20px;">
        <strong>⚠️ NE PAS FERMER CETTE PAGE</strong>
        <p>Le téléchargement peut prendre du temps. Vous pouvez minimiser la fenêtre mais ne la fermez pas.</p>
    </div>
</div>

<script>
async function startDownload() {
    const selectedPack = document.querySelector('input[name="pack"]:checked').value;

    if (selectedPack === 'skip') {
        // Passer directement à l'étape suivante
        window.location.href = '?step=permissions';
        return;
    }

    // Afficher interface de téléchargement
    document.getElementById('start-download').style.display = 'none';
    document.getElementById('download-status').style.display = 'block';
    document.getElementById('next-btn').style.display = 'none';

    log(`Démarrage du téléchargement du pack: ${selectedPack.toUpperCase()}`, 'info');

    try {
        // Appeler l'API de téléchargement
        const response = await fetch('/setup-api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'download_pack',
                pack: selectedPack
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Erreur téléchargement');
        }

        // ID de tâche de téléchargement
        const taskId = data.taskId;

        // Poll le statut du téléchargement
        await pollDownloadStatus(taskId);

    } catch (error) {
        log(`ERREUR: ${error.message}`, 'error');
        alert('Erreur lors du téléchargement. Vérifiez votre connexion.');
    }
}

async function pollDownloadStatus(taskId) {
    const pollInterval = 2000; // 2 secondes

    const poll = async () => {
        try {
            const response = await fetch('/setup-api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'download_status',
                    taskId: taskId
                })
            });

            const data = await response.json();

            if (data.success) {
                const status = data.status;

                // Update progress bar
                setProgress(status.progress);

                // Update info
                document.getElementById('download-info').textContent =
                    `${status.currentFile || 'Téléchargement...'} - ${status.downloaded}/${status.total} fichiers`;

                // Log messages
                if (status.log && status.log.length > 0) {
                    status.log.forEach(msg => log(msg.message, msg.type));
                }

                // Check if complete
                if (status.complete) {
                    log('✅ TÉLÉCHARGEMENT TERMINÉ !', 'success');
                    document.getElementById('download-info').innerHTML = '<strong style="color: var(--color-primary);">TÉLÉCHARGEMENT TERMINÉ !</strong>';
                    document.getElementById('next-btn').style.display = 'block';
                    return; // Stop polling
                }

                // Check if error
                if (status.error) {
                    log(`❌ ERREUR: ${status.error}`, 'error');
                    alert('Erreur lors du téléchargement. Consultez les logs.');
                    return;
                }

                // Continue polling
                setTimeout(poll, pollInterval);
            }

        } catch (error) {
            log(`Erreur poll: ${error.message}`, 'error');
            setTimeout(poll, pollInterval);
        }
    };

    // Start polling
    poll();
}

// Override log function for download
function log(message, type = 'info') {
    const output = document.getElementById('download-log');
    if (output) {
        const line = document.createElement('div');
        line.style.color = type === 'error' ? '#ff0000' :
                          type === 'warning' ? '#ffaa00' :
                          type === 'success' ? '#00ff00' : '#ffffff';
        line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }
}

function setProgress(percent) {
    const bar = document.getElementById('download-progress');
    if (bar) {
        bar.style.width = percent + '%';
    }
}
</script>
