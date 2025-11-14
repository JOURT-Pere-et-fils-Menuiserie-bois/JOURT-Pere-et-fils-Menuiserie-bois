<?php
/**
 * SETUP WIZARD - Installation automatique ZERO CONFIG
 * Première utilisation : configure TOUT automatiquement
 */

session_start();

// Vérifier si déjà installé
$installMarker = __DIR__ . '/data/.installed';
if (file_exists($installMarker) && !isset($_GET['force'])) {
    header('Location: /index.php');
    exit;
}

// Étapes du wizard
$steps = [
    'welcome' => 'Bienvenue',
    'check' => 'Vérifications',
    'database' => 'Base de données',
    'models' => 'Modèles IA',
    'content' => 'Contenu Survival',
    'permissions' => 'Permissions',
    'complete' => 'Terminé'
];

$currentStep = $_GET['step'] ?? 'welcome';

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PIP-SURVIVAL - Setup Wizard</title>
    <link rel="stylesheet" href="/assets/css/pipboy.css">
    <style>
        .wizard-container {
            max-width: 800px;
            margin: 50px auto;
            padding: 30px;
            border: 3px solid var(--color-primary);
            background: var(--color-black);
            box-shadow: var(--glow-md);
        }
        .wizard-title {
            font-size: 32px;
            text-align: center;
            text-shadow: var(--glow-lg);
            margin-bottom: 30px;
        }
        .wizard-steps {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }
        .wizard-step {
            padding: 10px 15px;
            border: 2px solid var(--color-dark);
            background: var(--color-darker);
            font-size: 14px;
            flex: 1;
            text-align: center;
            margin: 5px;
        }
        .wizard-step.active {
            border-color: var(--color-primary);
            background: var(--color-dark);
            box-shadow: var(--glow-sm);
        }
        .wizard-step.completed {
            background: var(--color-primary);
            color: var(--color-black);
        }
        .wizard-content {
            min-height: 300px;
            padding: 20px;
            border: 2px solid var(--color-primary);
            background: var(--color-darker);
            margin-bottom: 20px;
        }
        .wizard-actions {
            display: flex;
            justify-content: space-between;
        }
        .check-item {
            padding: 10px;
            margin: 10px 0;
            border-left: 3px solid var(--color-primary);
            background: var(--color-black);
        }
        .check-ok { border-color: var(--color-primary); }
        .check-warning { border-color: #ffaa00; color: #ffaa00; }
        .check-error { border-color: #ff0000; color: #ff0000; }
        .progress-bar {
            width: 100%;
            height: 30px;
            border: 2px solid var(--color-primary);
            margin: 20px 0;
            padding: 3px;
        }
        .progress-fill {
            height: 100%;
            background: var(--color-primary);
            transition: width 0.3s;
            box-shadow: var(--glow-md);
        }
        .log-output {
            background: var(--color-black);
            border: 1px solid var(--color-primary);
            padding: 15px;
            height: 200px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
            margin: 20px 0;
        }
        .disclaimer {
            background: rgba(255,0,0,0.1);
            border: 2px solid #ff0000;
            padding: 20px;
            margin: 20px 0;
            color: #ff0000;
        }
    </style>
</head>
<body class="pip-body">

<div class="wizard-container">
    <h1 class="wizard-title">⚠️ PIP-SURVIVAL SETUP ⚠️</h1>

    <!-- Steps -->
    <div class="wizard-steps">
        <?php foreach ($steps as $key => $label): ?>
            <div class="wizard-step <?php
                echo $key === $currentStep ? 'active' : '';
                echo array_search($key, array_keys($steps)) < array_search($currentStep, array_keys($steps)) ? ' completed' : '';
            ?>">
                <?php echo $label; ?>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Content -->
    <div class="wizard-content">
        <?php
        switch ($currentStep) {
            case 'welcome':
                include 'setup/step-welcome.php';
                break;
            case 'check':
                include 'setup/step-check.php';
                break;
            case 'database':
                include 'setup/step-database.php';
                break;
            case 'models':
                include 'setup/step-models.php';
                break;
            case 'content':
                include 'setup/step-content.php';
                break;
            case 'permissions':
                include 'setup/step-permissions.php';
                break;
            case 'complete':
                include 'setup/step-complete.php';
                break;
            default:
                echo '<h2>Étape inconnue</h2>';
        }
        ?>
    </div>

    <!-- Actions -->
    <div class="wizard-actions">
        <?php
        $stepKeys = array_keys($steps);
        $currentIndex = array_search($currentStep, $stepKeys);
        $prevStep = $currentIndex > 0 ? $stepKeys[$currentIndex - 1] : null;
        $nextStep = $currentIndex < count($stepKeys) - 1 ? $stepKeys[$currentIndex + 1] : null;
        ?>

        <?php if ($prevStep && $currentStep !== 'complete'): ?>
            <a href="?step=<?php echo $prevStep; ?>" class="pip-btn">← RETOUR</a>
        <?php else: ?>
            <div></div>
        <?php endif; ?>

        <?php if ($nextStep): ?>
            <a href="?step=<?php echo $nextStep; ?>" class="pip-btn" id="next-btn">SUIVANT →</a>
        <?php elseif ($currentStep === 'complete'): ?>
            <a href="/index.php" class="pip-btn glow">LANCER L'APPLICATION 🚀</a>
        <?php endif; ?>
    </div>
</div>

<script>
// Helper pour AJAX calls
async function setupAPI(action, data = {}) {
    const response = await fetch('/setup-api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
    });
    return await response.json();
}

// Logger
function log(message, type = 'info') {
    const output = document.querySelector('.log-output');
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

// Progress bar
function setProgress(percent) {
    const bar = document.querySelector('.progress-fill');
    if (bar) {
        bar.style.width = percent + '%';
    }
}
</script>

</body>
</html>
