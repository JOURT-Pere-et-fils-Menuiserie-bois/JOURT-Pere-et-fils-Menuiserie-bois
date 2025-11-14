<h2>💾 INITIALISATION BASE DE DONNÉES</h2>

<div class="stat-card">
    <p>Création de la base de données SQLite locale...</p>
</div>

<div class="log-output" id="db-log"></div>

<script>
(async function() {
    log('Création de la base de données...', 'info');

    try {
        const response = await setupAPI('init_database');

        if (response.success) {
            log('✅ Base de données créée avec succès', 'success');
            log('  • Tables documents, chunks, vectors créées', 'info');
            log('  • Index optimisés', 'info');
            log('  • Modules par défaut enregistrés', 'info');

            // Auto-passer à l'étape suivante après 2 sec
            setTimeout(() => {
                window.location.href = '?step=models';
            }, 2000);
        } else {
            throw new Error(response.error || 'Erreur inconnue');
        }

    } catch (error) {
        log('❌ ERREUR: ' + error.message, 'error');
        alert('Échec initialisation base de données. Vérifiez les permissions.');
    }
})();
</script>
