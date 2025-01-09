<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convertisseur d'unités - Menuiserie</title>
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
        label, select, input, button {
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
        <h1>Convertisseur d'unités</h1>
        <form id="convertForm">
            <label for="value">Valeur à convertir :</label>
            <input type="number" id="value" step="0.01" placeholder="Entrez une valeur..." required>

            <label for="unitFrom">De :</label>
            <select id="unitFrom">
                <option value="m">Mètre (m)</option>
                <option value="cm">Centimètre (cm)</option>
                <option value="mm">Millimètre (mm)</option>
                <option value="in">Pouce (in)</option>
                <option value="ft">Pied (ft)</option>
            </select>

            <label for="unitTo">Vers :</label>
            <select id="unitTo">
                <option value="m">Mètre (m)</option>
                <option value="cm">Centimètre (cm)</option>
                <option value="mm">Millimètre (mm)</option>
                <option value="in">Pouce (in)</option>
                <option value="ft">Pied (ft)</option>
            </select>

            <button type="button" class="convert-btn" onclick="convert()">Convertir</button>
        </form>

        <table id="historyTable" style="display: none;">
            <thead>
                <tr>
                    <th>Valeur</th>
                    <th>Unité de départ</th>
                    <th>Unité cible</th>
                    <th>Résultat</th>
                </tr>
            </thead>
            <tbody id="historyBody"></tbody>
        </table>

        <button class="print-btn" onclick="window.print()">Imprimer l'historique</button>
    </div>

    <script>
        // Table de conversion en mètres
        const conversionFactors = {
            m: 1,           // Mètre
            cm: 0.01,       // Centimètre
            mm: 0.001,      // Millimètre
            in: 0.0254,     // Pouce (inch)
            ft: 0.3048      // Pied (foot)
        };

        function convert() {
            const value = parseFloat(document.getElementById('value').value);
            const unitFrom = document.getElementById('unitFrom').value;
            const unitTo = document.getElementById('unitTo').value;

            if (isNaN(value) || value <= 0) {
                alert("Veuillez entrer une valeur valide !");
                return;
            }

            // Conversion de la valeur vers l'unité cible
            const valueInMeters = value * conversionFactors[unitFrom]; // Convertir en mètres
            const result = valueInMeters / conversionFactors[unitTo];  // Convertir vers l'unité cible

            // Ajouter la conversion à l'historique
            addToHistory(value, unitFrom, unitTo, result.toFixed(4));
        }

        function addToHistory(value, unitFrom, unitTo, result) {
            const historyTable = document.getElementById('historyTable');
            const historyBody = document.getElementById('historyBody');

            // Afficher le tableau si c'est la première conversion
            if (historyTable.style.display === 'none') {
                historyTable.style.display = 'table';
            }

            // Ajouter une nouvelle ligne au tableau
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${value}</td>
                <td>${unitFrom}</td>
                <td>${unitTo}</td>
                <td>${result}</td>
            `;
            historyBody.appendChild(row);
        }
    </script>
<footer id="footer">
    <p>© 2025 - Ce code est libre d'utilisation sous réserve de conserver un lien vers <a href="https://www.jourt.com/tools/" target="_blank">Les outils du menuisier</a>.</p>
</footer>
</body>
</html>
