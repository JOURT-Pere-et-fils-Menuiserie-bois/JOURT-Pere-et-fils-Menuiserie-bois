<h2>🔒 PERMISSIONS & SÉCURITÉ</h2>

<div class="stat-card">
    <h3>Configuration des permissions</h3>

    <label style="display: block; margin: 15px 0;">
        <input type="checkbox" checked disabled style="margin-right: 10px;">
        <strong>Stockage local</strong> (IndexedDB, LocalStorage)
        <p style="margin-left: 30px; opacity: 0.7;">Requis pour le fonctionnement offline</p>
    </label>

    <label style="display: block; margin: 15px 0;">
        <input type="checkbox" id="perm-geolocation" style="margin-right: 10px;">
        <strong>Géolocalisation</strong> (optionnel)
        <p style="margin-left: 30px; opacity: 0.7;">Pour le module carte et météo</p>
    </label>

    <label style="display: block; margin: 15px 0;">
        <input type="checkbox" id="perm-notifications" style="margin-right: 10px;">
        <strong>Notifications</strong> (optionnel)
        <p style="margin-left: 30px; opacity: 0.7;">Alertes et rappels</p>
    </label>
</div>

<div class="stat-card" style="margin-top: 20px;">
    <h3>⚠️ Rappel Sécurité</h3>
    <ul style="line-height: 2;">
        <li>✅ Toutes les données restent locales</li>
        <li>✅ Aucune télémétrie ou tracking</li>
        <li>✅ Fonctionne 100% offline</li>
        <li>✅ Chiffrement recommandé (BitLocker, FileVault, LUKS)</li>
    </ul>
</div>

<button class="pip-btn" style="margin-top: 20px; width: 100%; padding: 15px;" onclick="requestPermissions()">
    CONFIGURER ET TERMINER
</button>

<script>
async function requestPermissions() {
    // Géolocalisation
    if (document.getElementById('perm-geolocation').checked) {
        try {
            await navigator.geolocation.getCurrentPosition(() => {});
        } catch (e) {
            console.log('Geolocation denied');
        }
    }

    // Notifications
    if (document.getElementById('perm-notifications').checked && 'Notification' in window) {
        try {
            await Notification.requestPermission();
        } catch (e) {
            console.log('Notifications denied');
        }
    }

    // Finaliser setup
    await setupAPI('complete_setup');

    // Rediriger vers complete
    window.location.href = '?step=complete';
}
</script>
