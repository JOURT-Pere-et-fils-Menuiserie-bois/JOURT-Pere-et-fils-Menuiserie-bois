<h2>🎮 BIENVENUE DANS PIP-SURVIVAL</h2>

<div class="disclaimer">
    <h3>⚠️ AVERTISSEMENT IMPORTANT</h3>
    <p><strong>Cette application contient des informations potentiellement dangereuses.</strong></p>

    <p>Le contenu inclut :</p>
    <ul>
        <li>Fabrication d'explosifs et armes improvisées</li>
        <li>Chimie appliquée (acides, poisons, drogues)</li>
        <li>Techniques de crochetage et intrusion</li>
        <li>Médecine d'urgence et chirurgie DIY</li>
        <li>Hacking et électronique offensive</li>
    </ul>

    <p><strong>EN UTILISANT CETTE APPLICATION, VOUS ACCEPTEZ QUE :</strong></p>
    <ul>
        <li>Ce contenu est à but ÉDUCATIF et de SURVIE uniquement</li>
        <li>Vous êtes responsable de l'utilisation que vous en faites</li>
        <li>Certaines informations peuvent être ILLÉGALES dans votre juridiction</li>
        <li>L'auteur décline toute responsabilité</li>
    </ul>

    <p style="font-size: 20px; text-align: center; margin-top: 20px;">
        <strong>USAGE CRIMINEL = VOUS ÊTES SEUL RESPONSABLE</strong>
    </p>
</div>

<div class="stat-card">
    <h3>📦 Ce qui sera installé :</h3>
    <ul style="line-height: 2;">
        <li>✅ Base de données SQLite (locale, chiffrée)</li>
        <li>✅ Modèle IA uncensored (Hermes-2-Pro, ~1.5GB)</li>
        <li>✅ Embeddings locaux (all-MiniLM-L6-v2, ~80MB)</li>
        <li>✅ PDFs de survivalisme hardcore (~500MB-2GB)</li>
        <li>✅ Modules avancés (chimie, explosifs, lockpicking, etc.)</li>
    </ul>

    <p><strong>Espace requis :</strong> ~4-5GB</p>
    <p><strong>Temps d'installation :</strong> 10-30 minutes (selon connexion)</p>
    <p><strong>Connexion requise :</strong> Une fois seulement (téléchargement initial)</p>
</div>

<div class="stat-card" style="margin-top: 20px;">
    <h3>🔒 Confidentialité & Sécurité :</h3>
    <ul style="line-height: 2;">
        <li>✅ 100% LOCAL - Aucune donnée envoyée sur internet</li>
        <li>✅ Pas de tracking, pas de cookies</li>
        <li>✅ IA tourne dans votre navigateur</li>
        <li>✅ Fonctionne OFFLINE après installation</li>
        <li>✅ Chiffrement optionnel de la base de données</li>
    </ul>
</div>

<label style="display: flex; align-items: center; margin-top: 30px; font-size: 18px;">
    <input type="checkbox" id="accept-disclaimer" style="width: 20px; height: 20px; margin-right: 15px;">
    <span>J'ai lu et j'accepte les conditions ci-dessus. Je comprends les risques.</span>
</label>

<script>
const checkbox = document.getElementById('accept-disclaimer');
const nextBtn = document.getElementById('next-btn');

checkbox.addEventListener('change', function() {
    if (this.checked) {
        nextBtn.classList.remove('disabled');
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
    } else {
        nextBtn.classList.add('disabled');
        nextBtn.style.opacity = '0.3';
        nextBtn.style.pointerEvents = 'none';
    }
});

// Disable par défaut
nextBtn.style.opacity = '0.3';
nextBtn.style.pointerEvents = 'none';
</script>
