-- =====================================================
-- Schéma de base de données - Logiciel de Métré Pro
-- =====================================================

CREATE DATABASE IF NOT EXISTS metre_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE metre_pro;

-- =====================================================
-- UTILISATEURS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'metreur', 'viewer') DEFAULT 'metreur',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,

    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PROJETS
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    contract_reference VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'archived', 'completed') DEFAULT 'active',

    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERSIONS DE PLANS
-- =====================================================
CREATE TABLE IF NOT EXISTS plan_versions (
    version_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    version_number INT NOT NULL,
    version_label VARCHAR(50) NOT NULL,

    -- Fichier
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_hash CHAR(64) NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),

    -- Paramètres calibration
    scale_factor DECIMAL(10, 6),
    origin_x DECIMAL(10, 2) DEFAULT 0,
    origin_y DECIMAL(10, 2) DEFAULT 0,
    rotation_degrees DECIMAL(5, 2) DEFAULT 0,
    dpi INT DEFAULT 72,
    unit_system ENUM('metric', 'imperial') DEFAULT 'metric',

    -- Métadonnées
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    change_description TEXT,

    -- Gestion versions
    is_current BOOLEAN DEFAULT FALSE,
    parent_version_id INT,
    superseded_date TIMESTAMP NULL,

    -- Workflow
    status ENUM('draft', 'validated', 'superseded', 'archived') DEFAULT 'draft',

    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id),
    FOREIGN KEY (parent_version_id) REFERENCES plan_versions(version_id),

    UNIQUE KEY unique_version (project_id, version_number),
    INDEX idx_current (project_id, is_current),
    INDEX idx_status (project_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CALQUES
-- =====================================================
CREATE TABLE IF NOT EXISTS layers (
    layer_id INT PRIMARY KEY AUTO_INCREMENT,
    version_id INT NOT NULL,
    layer_name VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    visible BOOLEAN DEFAULT TRUE,
    locked BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,

    FOREIGN KEY (version_id) REFERENCES plan_versions(version_id) ON DELETE CASCADE,
    INDEX idx_version (version_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MESURES
-- =====================================================
CREATE TABLE IF NOT EXISTS measurements (
    measurement_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    version_id INT NOT NULL,
    layer_id INT,

    -- Identification
    item_code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),

    -- Quantités
    quantity DECIMAL(10, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,

    -- Prix
    unit_price DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    -- Géométrie (stockée en JSON)
    geometry_type ENUM('line', 'polyline', 'polygon', 'rectangle', 'circle', 'count') NOT NULL,
    coordinates JSON NOT NULL,

    -- Apparence
    color VARCHAR(20),
    thickness INT DEFAULT 2,
    opacity DECIMAL(3, 2) DEFAULT 0.50,

    -- Tracking workflow
    status ENUM('draft', 'confirmed', 'sent', 'approved', 'rejected',
                'in_avenant', 'avenant_sent', 'avenant_approved',
                'invoiced', 'paid') DEFAULT 'draft',

    -- Checkboxes
    sent_in_avenant BOOLEAN DEFAULT FALSE,
    avenant_number VARCHAR(50),
    sent_date DATE,
    approved_date DATE,
    invoiced_date DATE,
    paid_date DATE,

    -- Traçabilité
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,

    -- Métadonnées
    notes TEXT,
    migrated_from_version INT,
    needs_validation BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES plan_versions(version_id) ON DELETE CASCADE,
    FOREIGN KEY (layer_id) REFERENCES layers(layer_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id),

    INDEX idx_version (version_id),
    INDEX idx_category (category),
    INDEX idx_status (project_id, status),
    INDEX idx_item_code (item_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DELTAS (cache comparaisons)
-- =====================================================
CREATE TABLE IF NOT EXISTS version_deltas (
    delta_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    from_version_id INT NOT NULL,
    to_version_id INT NOT NULL,

    -- Résumé
    total_additions INT DEFAULT 0,
    total_deletions INT DEFAULT 0,
    total_modifications INT DEFAULT 0,
    cost_delta DECIMAL(12, 2) DEFAULT 0,

    -- Détails (JSON)
    changes_detail LONGTEXT,

    -- Cache
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (from_version_id) REFERENCES plan_versions(version_id) ON DELETE CASCADE,
    FOREIGN KEY (to_version_id) REFERENCES plan_versions(version_id) ON DELETE CASCADE,

    UNIQUE KEY unique_delta (from_version_id, to_version_id),
    INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AVENANTS
-- =====================================================
CREATE TABLE IF NOT EXISTS avenants (
    avenant_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    avenant_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Versions
    from_version_id INT,
    to_version_id INT,

    -- Montants
    total_amount DECIMAL(12, 2) NOT NULL,

    -- Workflow
    status ENUM('draft', 'sent', 'approved', 'rejected', 'invoiced', 'paid') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    sent_date DATE,
    approved_date DATE,
    approval_document_path VARCHAR(500),
    invoiced_date DATE,
    invoice_number VARCHAR(50),
    paid_date DATE,

    -- Métadonnées
    client_reference VARCHAR(100),
    notes TEXT,

    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (from_version_id) REFERENCES plan_versions(version_id),
    FOREIGN KEY (to_version_id) REFERENCES plan_versions(version_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),

    UNIQUE KEY unique_avenant_number (project_id, avenant_number),
    INDEX idx_status (project_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- LIAISON AVENANTS ↔ MESURES
-- =====================================================
CREATE TABLE IF NOT EXISTS avenant_measurements (
    avenant_id INT NOT NULL,
    measurement_id INT NOT NULL,

    PRIMARY KEY (avenant_id, measurement_id),
    FOREIGN KEY (avenant_id) REFERENCES avenants(avenant_id) ON DELETE CASCADE,
    FOREIGN KEY (measurement_id) REFERENCES measurements(measurement_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================

-- Utilisateur par défaut (mot de passe: admin123)
INSERT INTO users (username, email, password_hash, name, role) VALUES
('admin', 'admin@metre-pro.local', '$2y$10$YourHashedPasswordHere', 'Administrateur', 'admin')
ON DUPLICATE KEY UPDATE user_id=user_id;

-- =====================================================
-- FIN DU SCHÉMA
-- =====================================================
