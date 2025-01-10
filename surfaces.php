<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
<section class="presentation-surfaces">
    <h1>Calculateur de surfaces pour la menuiserie</h1>
    <p>
        Cet outil a été conçu pour vous aider à déterminer rapidement et précisément les surfaces à couvrir lors de vos travaux de menuiserie. 
        Il prend en charge les formes rectangulaires et carrées, vous permettant de calculer les surfaces en un clin d'œil.
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
    </p>        <form id="surfaceForm">
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
            </tfoot>
        </table>

        <button class="print-btn" onclick="window.print()">Imprimer l'historique</button>
</section>
    </div>

    <script>
        let totalSurface = 0;

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

            addToHistory(title, length, width, surface.toFixed(2));
            updateTotalSurface();
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

        function updateTotalSurface() {
            const totalRow = document.getElementById('totalRow');
            const totalSurfaceCell = document.getElementById('totalSurface');

            totalSurfaceCell.textContent = totalSurface.toFixed(2);
            totalRow.style.display = 'table-row';
        }
    </script>

    <footer id="footer">
        © 2025 - Ce code est libre d'utilisation sous réserve de conserver un lien vers <a href="https://www.jourt.com/tools">Les outils du menuisier</a>.
    </footer>
</body>
</html>
