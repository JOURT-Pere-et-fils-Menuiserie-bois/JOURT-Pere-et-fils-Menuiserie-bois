<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Estimation de volume de peinture et vernis - calculateur de surfaces pour travaux de menuiserie">
    <meta name="author" content="MR JOURT pour JOURT Père et fils Menuiserie bois">
    <title>Estimation de volume de peinture et vernis</title>
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
	#totalRow td:first-child{text-align:right;}
        .convert-btn, .add-wall-btn {
            margin-top: 20px;
            padding: 10px;
            background: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 5px;
        }
        .convert-btn:hover, .add-wall-btn:hover {
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
        header {
            text-align: center;
            margin-top: 20px;
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

    <h1>Estimation de volume de peinture et vernis</h1>
    <p>
       Cet outil vous permet d'estimer rapidement et précisément le volume de peinture ou de vernis nécessaire pour vos projets de menuiserie. 
	Il prend en compte la hauteur et la largeur des murs, le nombre de couches à appliquer, ainsi que les spécifications du pot de peinture.    </p>
    
    <h2>Fonctionnalités principales :</h2>
    <ul>
        <li>Spécifier les détails de la peinture.</li>
        <li>Définir la capacité d’un pot de peinture (en litres).</li>
        <li>Entrer la hauteur et la longueur des murs.</li>
        <li>Obtenir instantanément le volume total de peinture requis et le nombre de pots nécessaires.</li>
    </ul>
    
    <h2>Comment ça fonctionne ?</h2>
    <ol>
        <li>Entrez la hauteur et la longeur de chaque mur dans les champs prévus à cet effet.</li>
        <li>Cliquez sur le bouton <strong>Ajouter un mur</strong> pour l'ajouter à la surface totale en m².</li>
        <li>L’historique s’affiche automatiquement.</li>
        <li>Utilisez le bouton <strong>Imprimer l’historique</strong> pour conserver une trace de vos calculs.</li>
    </ol>
    
    <h2>Pourquoi cet outil est-il utile ?</h2>
    <p>
        Que ce soit pour préparer un chantier, estimer le coût des matériaux ou éviter les achats superflus, cet outil vous aide à planifier 
        précisément vos besoins en peinture et vernis. Il vous fait gagner du temps tout en réduisant les risques de gaspillage.
    </p>

         
            <h2>Configuration de la peinture</h2>
            <label for="volumePerPot">Volume du pot de peinture (litres) :</label>
            <input type="number" id="volumePerPot" value="" required>

            <label for="coverage">Surface de couverture du pot (m²) :</label>
            <input type="number" id="coverage" value="" required>

            <label for="pricePerPot">Prix du pot (euros) :</label>
            <input type="number" id="pricePerPot" value="" required>

            <label for="layers">Nombre de couches :</label>
            <input type="number" id="layers" value="1" min="1" onchange="recalculate()" required> <!-- Relance les calculs en cas de changement -->

            <hr>

            <h2>Dimensions des murs</h2>
            <label for="room">Nom de la pièce :</label>
            <input type="text" id="room" placeholder="Ex : Cuisine" required>

            <label for="height">Hauteur (m) :</label>
            <input type="number" id="height" step="0.01" placeholder="Entrez la hauteur..." required>

            <label for="width">Longeur (m) :</label>
            <input type="number" id="width" step="0.01" placeholder="Entrez la longeur..." required>

            <button type="button" class="add-wall-btn" onclick="addWall()">Ajouter un mur</button>
        </section>

        <table id="historyTable" style="display: none;">
            <thead>
                <tr>
                    <th>Nom de la pièce</th>
                    <th>Longeur (m)</th>
                    <th>Hauteur (m)</th>
                    <th>Surface (m²)</th>
                    <th>Peinture pour une couche (l)</th>
                </tr>
            </thead>
            <tbody id="historyBody"></tbody>
            <tfoot id="totalRow" style="display: none;">
                <tr>
                    <td colspan="4"><strong>Surface totale des murs :</strong></td>
                    <td id="totalSurface">0.00</td>
                </tr>
                <tr>
                    <td colspan="4"><strong>Total de litres de peinture :</strong></td>
                    <td id="totalLiters">0.00</td>
                </tr>
                <tr>
                    <td colspan="4"><strong>Total de pots de peinture nécessaires :</strong></td>
                    <td id="totalPots">0</td>
                </tr>
                <tr>
                    <td colspan="4"><strong>Coût total :</strong></td>
                    <td id="totalCost" colspan="4">0.00 €</td>
                </tr>
            </tfoot>
        </table>

        <div id="subtotals"></div> <!-- Div pour afficher les sous-totaux -->

        <button class="print-btn" onclick="window.print()">Imprimer l'historique</button>
    </div>

    <script>
        let totalSurface = 0;
        let totalLiters = 0; 
        let totalPots = 0; 
        let totalCost = 0; 
        let roomData = {}; // Objets pour stocker les données par pièce

        function addWall() {
            // Récupérer les valeurs des champs 
            const volumePerPot = parseFloat(document.getElementById('volumePerPot').value);
            const coverage = parseFloat(document.getElementById('coverage').value);
            const pricePerPot = parseFloat(document.getElementById('pricePerPot').value);
            const layers = parseInt(document.getElementById('layers').value);

            // Vérifier que les valeurs sont valides  
            if (
                isNaN(volumePerPot) || volumePerPot <= 0 ||
                isNaN(coverage) || coverage <= 0 ||
                isNaN(pricePerPot) || pricePerPot < 0 ||
                isNaN(layers) || layers <= 0 
            ) {
                alert("Veuillez remplir correctement les champs pour le volume du pot, la couverture, le prix et le nombre de couches !");
                return;
            }

            const width = parseFloat(document.getElementById('width').value);
            const height = parseFloat(document.getElementById('height').value);
            const room = document.getElementById('room').value.trim() || 'Sans titre';

            // Vérifier que les dimensions du mur sont valides  
            if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
                alert("Veuillez entrer des dimensions valides pour le mur !");
                return;
            }

            // Surface du mur (largeur * hauteur)
            const wallSurface = width * height;
            totalSurface += wallSurface; // Ajout à la surface totale

            // Estimation des litres de peinture (en fonction du nombre de couches)
            const liters = (wallSurface * layers) / coverage; // Total de litres nécessaires  
            totalLiters += liters; // Ajout au total des litres

            // Créer ou mettre à jour les données de la pièce  
            if (!roomData[room]) {
                roomData[room] = { surface: 0, liters: 0 };
            }
            roomData[room].surface += wallSurface;
            roomData[room].liters += liters;

            // Estimation des pots de peinture nécessaires  
            totalPots = Math.ceil(totalLiters / volumePerPot); // Mise à jour du total des pots

            // Coût total  
            totalCost = totalPots * pricePerPot; // Coût total en fonction du prix du pot

            addToHistory(room, width, height, wallSurface.toFixed(2), liters.toFixed(2));

            // Afficher le sous-total pour la pièce actuelle  
            displaySubtotal(room); 

            updateTotals();

            // Réinitialisation du champ Longueur et focus dessus  
            document.getElementById('width').value = '';
            document.getElementById('width').focus();
        }

        function displaySubtotal(room) {
            const subtotalsDiv = document.getElementById('subtotals');
            subtotalsDiv.innerHTML = ''; // Réinitialiser l'affichage des sous-totaux  
            const subtotalElement = document.createElement('div');
            subtotalElement.textContent = `Sous-total : ${room} ${roomData[room].surface.toFixed(2)} m² soit ${roomData[room].liters.toFixed(2)} l`;
            subtotalsDiv.appendChild(subtotalElement);
        }

        function addToHistory(room, width, height, wallSurface, liters) {
            const historyTable = document.getElementById('historyTable');
            const historyBody = document.getElementById('historyBody');

            if (historyTable.style.display === 'none') {
                historyTable.style.display = 'table';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td contenteditable="true" oninput="updateTitle(this)">${room}</td>
                <td>${width.toFixed(2)}</td>
                <td>${height.toFixed(2)}</td>
                <td>${wallSurface}</td>
                <td>${liters}</td>
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
            const totalLitersCell = document.getElementById('totalLiters');
            const totalPotsCell = document.getElementById('totalPots');
            const totalCostCell = document.getElementById('totalCost');

            totalSurfaceCell.textContent = totalSurface.toFixed(2) + ' m²';
            totalLitersCell.textContent = totalLiters.toFixed(2) + ' l'; // Mise à jour du total des litres  
            totalPotsCell.textContent = totalPots; // Mise à jour du total des pots  
            totalCostCell.textContent = totalCost.toFixed(2) + ' €'; // Mise à jour du coût total  
            totalRow.style.display = 'contents';
        }

        function recalculate() {
            const historyBody = document.getElementById('historyBody');
            totalSurface = 0;
            totalLiters = 0; 
            roomData = {}; // Réinitialiser les données de la pièce

            const rows = historyBody.querySelectorAll('tr');
            rows.forEach(row => {
                const room = row.cells[0].textContent.trim();
                const width = parseFloat(row.cells[1].textContent);
                const height = parseFloat(row.cells[2].textContent);
                const layers = parseInt(document.getElementById('layers').value);
                const coverage = parseFloat(document.getElementById('coverage').value);
                
                if (!isNaN(width) && !isNaN(height)) {
                    const wallSurface = width * height;
                    totalSurface += wallSurface;

                    const liters = (wallSurface * layers) / coverage; // Total de litres nécessaires  
                    totalLiters += liters; // Ajout au total des litres  

                    // Créer ou mettre à jour les données de la pièce  
                    if (!roomData[room]) {
                        roomData[room] = { surface: 0, liters: 0 };
                    }
                    roomData[room].surface += wallSurface;
                    roomData[room].liters += liters;
                }
            });

            // Afficher tous les sous-totaux  
            displaySubtotalForAll();

            totalPots = Math.ceil(totalLiters / parseFloat(document.getElementById('volumePerPot').value)); // Recalculer le total des pots  
            totalCost = totalPots * parseFloat(document.getElementById('pricePerPot').value); // Recalculer le coût total

            // Mettre à jour les totaux  
            updateTotals();
        }

        function displaySubtotalForAll() {
            const subtotalsDiv = document.getElementById('subtotals');
            subtotalsDiv.innerHTML = ''; // Réinitialiser l'affichage des sous-totaux  
            for (const room in roomData) {
                const subtotalElement = document.createElement('div');
                subtotalElement.textContent = `Sous-total : ${room} ${roomData[room].surface.toFixed(2)} m² soit ${roomData[room].liters.toFixed(2)} l`;
                subtotalsDiv.appendChild(subtotalElement);
            }
        }
    </script>

    <footer id="footer">
        © 2025 - Ce code est libre d'utilisation sous réserve de conserver un lien vers <a href="https://www.jourt.com/tools/">Les outils du menuisier</a>.
    </footer>
</body>
</html>