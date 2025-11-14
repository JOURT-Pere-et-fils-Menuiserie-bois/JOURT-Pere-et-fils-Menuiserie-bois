<?php
/**
 * Database - Gestion SQLite
 */

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        try {
            $this->pdo = new PDO('sqlite:' . DB_PATH);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            // Performance
            $this->pdo->exec('PRAGMA journal_mode = WAL');
            $this->pdo->exec('PRAGMA synchronous = NORMAL');
            $this->pdo->exec('PRAGMA cache_size = 10000');
        } catch (PDOException $e) {
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getPdo() {
        return $this->pdo;
    }

    /**
     * Initialise la base de données (création des tables)
     */
    public function init() {
        $sql = <<<SQL
        -- Table des documents
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            filename TEXT,
            category TEXT,
            content TEXT,
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Table des chunks (morceaux de documents)
        CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            page INTEGER,
            chunk_index INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
        );

        -- Table des vecteurs (embeddings)
        CREATE TABLE IF NOT EXISTS vectors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chunk_id INTEGER NOT NULL,
            embedding BLOB NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE CASCADE
        );

        -- Table des modules
        CREATE TABLE IF NOT EXISTS modules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            enabled INTEGER DEFAULT 1,
            config TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Index pour performances
        CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(doc_id);
        CREATE INDEX IF NOT EXISTS idx_vectors_chunk ON vectors(chunk_id);
        CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

        -- Modules par défaut
        INSERT OR IGNORE INTO modules (name, enabled, config) VALUES
            ('search', 1, '{"icon":"💾","label":"DATA"}'),
            ('codegen', 1, '{"icon":"🔧","label":"CODE"}'),
            ('docs', 1, '{"icon":"📄","label":"DOCS"}'),
            ('map', 1, '{"icon":"🗺","label":"MAP"}'),
            ('radio', 1, '{"icon":"📻","label":"RADIO"}');
SQL;

        $this->pdo->exec($sql);
        return true;
    }

    /**
     * Query simple
     */
    public function query($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Fetch all
     */
    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }

    /**
     * Fetch one
     */
    public function fetchOne($sql, $params = []) {
        return $this->query($sql, $params)->fetch();
    }

    /**
     * Insert et retourne l'ID
     */
    public function insert($table, $data) {
        $keys = array_keys($data);
        $fields = implode(', ', $keys);
        $placeholders = ':' . implode(', :', $keys);

        $sql = "INSERT INTO {$table} ({$fields}) VALUES ({$placeholders})";
        $this->query($sql, $data);

        return $this->pdo->lastInsertId();
    }

    /**
     * Update
     */
    public function update($table, $data, $where, $whereParams = []) {
        $setParts = [];
        foreach (array_keys($data) as $key) {
            $setParts[] = "{$key} = :{$key}";
        }
        $setClause = implode(', ', $setParts);

        $sql = "UPDATE {$table} SET {$setClause} WHERE {$where}";
        $params = array_merge($data, $whereParams);

        return $this->query($sql, $params)->rowCount();
    }

    /**
     * Delete
     */
    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        return $this->query($sql, $params)->rowCount();
    }

    /**
     * Count
     */
    public function count($table, $where = '', $params = []) {
        $sql = "SELECT COUNT(*) as count FROM {$table}";
        if ($where) {
            $sql .= " WHERE {$where}";
        }
        $result = $this->fetchOne($sql, $params);
        return (int)$result['count'];
    }

    /**
     * Transaction
     */
    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }

    public function commit() {
        return $this->pdo->commit();
    }

    public function rollback() {
        return $this->pdo->rollBack();
    }
}
