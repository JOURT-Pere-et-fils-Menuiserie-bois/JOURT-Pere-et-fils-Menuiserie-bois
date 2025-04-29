<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="DEV - Calculateur de surfaces - développement JOURT Père et fils Menuiserie bois la boite à outils Open Sources">
<meta name="author" content="MR JOURT pour JOURT Père et fils Menuiserie bois">
<!-- Open Graph / Facebook -->
<meta property="og:locale" content="fr_FR">
<meta property="og:type" content="business.business">
<meta property="business:contact_data:street_address" content="50 Chemin de la Butte">
<meta property="business:contact_data:locality" content="Brest">
<meta property="business:contact_data:region" content="Finistère">
<meta property="business:contact_data:postal_code" content="29200">
<meta property="business:contact_data:country_name" content="France">
<meta property="og:url" content="https://www.jourt.com/tools/surfaces">
<meta property="og:title" content="Menuiserie BREST JOURT Père et fils menuisier bois artisan">
<meta property="og:site_name" content="Menuiserie BREST JOURT Père et fils S.A.S.">
<meta property="og:description" content="JOURT Père et fils menuiserie bois, travaux sur mesures, la qualité artisanal pour vos besoins de projet particulier et professionnel, depuis 1946 à Brest">
<meta property="og:image" content="https://www.jourt.com/share-1200-630.webp">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Menuiserie bois Brest, JOURT Père et fils">

<!-- Twitter -->                      
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:title" content="Menuiserie BREST JOURT Père et fils menuisier bois artisan">
<meta property="twitter:description" content="JOURT Père et fils menuiserie bois, travaux sur mesures, la qualité artisanal pour vos besoins de projet particulier et professionnel, depuis 1946 à Brest">
<meta property="twitter:domain" content="jourt.com">
<meta property="twitter:url" content="https://www.jourt.com/tools/surfaces">
<meta property="twitter:site" content="@JOURTPereEtFils">
<meta property="twitter:image" content="https://www.jourt.com/share-1200-630.webp">
<meta property="twitter:image:alt" content="Menuiserie BREST JOURT Père et fils S.A.S. bois, PVC, alu">
<!-- META TAG FIN -->
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://www.jourt.com/tools/surfaces">

<script type="application/ld+json">
{
  "@context": "https://www.schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "JOURT Père et fils",
  "url": "https://www.jourt.com/tools/surfaces",
  "logo": "https://www.jourt.com/images/logo-Jourt-2021.jpg",
  "image": "https://www.jourt.com/images/logo-Jourt-2021.jpg",
  "telephone": "+33 (0)2.98.45.01.41",
  "priceRange": "$$$",
  "description": "JOURT Père et fils menuiserie bois, travaux sur mesures et artisanal pour répondre aux besoins de projet particulier et professionnel, la qualité depuis 1946 à Brest",
  "address": {"@type": "PostalAddress","streetAddress": "50 Chemin de la Butte","addressLocality": "Brest","addressRegion": "Finistère","postalCode": "29200","addressCountry": "FR"},
  "geo": { "@type": "GeoCoordinates", "latitude": "48.3936944", "longitude": "-4.532305555555555" },
  "hasMap": "https://www.google.com/maps/place/JOURT+P%C3%A8re+et+fils+Menuiserie+bois/@48.39369,-4.532329,16z/data=!4m12!1m5!3m4!2zNDjCsDIzJzM3LjMiTiA0wrAzMSc1Ni4zIlc!8m2!3d48.3936944!4d-4.5323056!3m5!1s0x4816bd90dd3d89cd:0x751ad4533101ee6f!8m2!3d48.3938371!4d-4.5320048!16s%2Fg%2F11pl05n__j?hl=fr-FR&entry=ttu",
  "openingHours": [
    "Mo 08:00-12:00 13:00-18:00",
    "Tu 08:00-12:00 13:00-18:00",
    "We 08:00-12:00 13:00-18:00",
    "Th 08:00-12:00 13:00-18:00",
    "Fr 08:00-12:00 13:00-18:00"
  ]}
</script>
    <title>Calculateur de surfaces - Menuiserie</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
        }
        label, input, button {
            display: block;
            width: 100%;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 10px;
            text-align: center;
        }
        .convert-btn {
            margin-top: 20px;
            padding: 10px;
            background: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 5px;
        }
        .convert-btn:hover {
            background: #45a049;
        }
        .print-btn {
            margin-top: 20px;
            padding: 10px;
            background: #007BFF;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 5px;
        }
        .print-btn:hover {
            background: #0056b3;
        }
        header {
            text-align: center;
            margin-top: 20px;
        }
        footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #555;
        }
        footer a {
            color: #007BFF;
            text-decoration: none;
        }
        footer a:hover {
            text-decoration: underline;
        }

        @media print {
            form, .print-btn {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
<header>
<img itemprop="image" itemscope="" itemtype="https://schema.org/ImageObject" alt="Profile Icon" title="Ouvrier menuisier" src="https://www.jourt.com/images/profile_icon-mini.webp" srcset="https://www.jourt.com/images/profile_icon-mini.webp 68w, https://www.jourt.com/images/profile_icon.webp 136w" sizes="(max-width: 700px) 136px,136px" width="136" height="136">
</header>
<section class="presentation-surfaces">
    <h1>Calculateur de surfaces pour la menuiserie</h1>
    <p>
        Cet outil a été conçu pour vous aider à déterminer rapidement et précisément les surfaces à couvrir lors de vos travaux de menuiserie. 
        Il prend en charge les formes rectangulaires et carrées, vous permettant de calculer les surfaces des pièces en un clin d'œil.
    </p>
    
    <h2>Fonctionnalités principales :</h2>
    <ul>
        <li>Entrer la largeur et la longueur de la surface.</li>
        <li>Obtenir instantanément la surface totale en mètres carrés.</li>
        <li>Calculer les surfaces de plusieurs pièces grâce à l’historique des calculs.</li>
        <li>Imprimer facilement les résultats pour les conserver ou les partager.</li>
    </ul>
    
    <h2>Comment ça fonctionne ?</h2>
    <ol>
        <li>Entrez la largeur et la longueur de la surface dans les champs prévus à cet effet.</li>
        <li>Cliquez sur le bouton <strong>Calculer</strong> pour obtenir la surface totale en m².</li>
        <li>Ajoutez d’autres calculs si nécessaire. L’historique s’affiche automatiquement.</li>
        <li>Utilisez le bouton <strong>Imprimer l’historique</strong> pour conserver une trace de vos calculs.</li>
    </ol>
    
    <h2>Pourquoi cet outil est-il utile ?</h2>
    <p>
        Que ce soit pour estimer les matériaux nécessaires, préparer un devis ou vérifier des mesures, cet outil vous simplifie la vie sur les chantiers. 
        Il vous permet d’éviter les erreurs de calcul et de gagner un temps précieux dans vos projets.
    </p>
        <form id="surfaceForm">
            <label for="length">Longueur (m) :</label>
            <input type="number" id="length" step="0.01" placeholder="Entrez la longueur..." required>

            <label for="width">Largeur (m) :</label>
            <input type="number" id="width" step="0.01" placeholder="Entrez la largeur..." required>

            <label for="title">Titre (optionnel) :</label>
            <input type="text" id="title" placeholder="Ex : Cuisine, Salon...">

            <button type="button" class="convert-btn" onclick="calculateSurface()">Calculer</button>
        </form>

        <table id="historyTable" style="display: none;">
            <thead>
                <tr>
                    <th>Titre</th>
                    <th>Longueur (m)</th>
                    <th>Largeur (m)</th>
                    <th>Surface (m²)</th>
                </tr>
            </thead>
            <tbody id="historyBody"></tbody>
            <tfoot id="totalRow" style="display: none;">
                <tr>
                    <td colspan="3"><strong>Surface totale :</strong></td>
                    <td id="totalSurface">0</td>
                </tr>
                <tr>
                    <td colspan="3"><strong>Linéraire total des murs :</strong></td>
                    <td id="totalLinear">0</td>
                </tr>
            </tfoot>
        </table>
        <button class="print-btn" onclick="window.print()">Imprimer l'historique</button>
</section>
    </div>

    <script>
        let totalSurface = 0;
        let totalLinear = 0;

        function calculateSurface() {
            const length = parseFloat(document.getElementById('length').value);
            const width = parseFloat(document.getElementById('width').value);
            const title = document.getElementById('title').value || 'Sans titre';

            if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
                alert("Veuillez entrer des dimensions valides !");
                return;
            }

            const surface = length * width;
            totalSurface += surface;

            // Calcul du linéaire total des murs (2 * (longueur + largeur))
            const linear = 2 * (length + width);
            totalLinear += linear; // Ajout au linéaire total

            addToHistory(title, length, width, surface.toFixed(2));
            updateTotals();
        }

        function addToHistory(title, length, width, surface) {
            const historyTable = document.getElementById('historyTable');
            const historyBody = document.getElementById('historyBody');

            if (historyTable.style.display === 'none') {
                historyTable.style.display = 'table';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td contenteditable="true" oninput="updateTitle(this)">${title}</td>
                <td>${length}</td>
                <td>${width}</td>
                <td>${surface}</td>
            `;
            historyBody.appendChild(row);
        }

        function updateTitle(cell) {
            if (!cell.textContent.trim()) {
                cell.textContent = 'Sans titre';
            }
        }

        function updateTotals() {
            const totalRow = document.getElementById('totalRow');
            const totalSurfaceCell = document.getElementById('totalSurface');
            const totalLinearCell = document.getElementById('totalLinear');

            totalSurfaceCell.textContent = totalSurface.toFixed(2);
            totalLinearCell.textContent = totalLinear.toFixed(2);
            totalRow.style.display = 'table-row';
        }
    </script>

    <footer id="footer">
        © 2025 - Ce code est libre d'utilisation sous réserve de conserver un lien vers <a href="https://www.jourt.com/tools/">Les outils du menuisier</a>.
    </footer>
</body>
</html>