<?php
/**
 * ModuleController - Gestion des modules
 */

class ModuleController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * GET /api/modules
     */
    public function getAll() {
        $modules = $this->db->fetchAll('SELECT * FROM modules ORDER BY name');
        foreach ($modules as &$module) {
            $module['enabled'] = (bool)$module['enabled'];
            $module['config'] = json_decode($module['config'], true);
        }
        jsonResponse($modules);
    }

    /**
     * GET /api/modules/{id}
     */
    public function get($id) {
        $module = $this->db->fetchOne('SELECT * FROM modules WHERE id = ? OR name = ?', [$id, $id]);
        if (!$module) {
            jsonError('Module not found', 404);
        }
        $module['enabled'] = (bool)$module['enabled'];
        $module['config'] = json_decode($module['config'], true);
        jsonResponse($module);
    }

    /**
     * POST /api/modules (toggle enabled)
     * Body: { "name": "search", "enabled": true }
     */
    public function toggle() {
        $data = getJsonInput();

        if (empty($data['name'])) {
            jsonError('Module name is required', 400);
        }

        $name = sanitize($data['name']);
        $enabled = isset($data['enabled']) ? (int)(bool)$data['enabled'] : null;

        if ($enabled === null) {
            jsonError('Enabled status is required', 400);
        }

        try {
            $updated = $this->db->update('modules', ['enabled' => $enabled], 'name = :name', ['name' => $name]);
            if ($updated === 0) {
                jsonError('Module not found', 404);
            }

            jsonResponse([
                'message' => 'Module updated successfully',
                'name' => $name,
                'enabled' => (bool)$enabled
            ]);

        } catch (Exception $e) {
            jsonError('Failed to update module', 500, $e->getMessage());
        }
    }
}
