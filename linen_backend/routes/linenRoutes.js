const express = require('express');
const router = express.Router();
const linenController = require('../controllers/linenController');
const { authAndRole } = require("../middleware/auth")

router.post('/linen-item', authAndRole(1, 2), linenController.createLinenItem);
router.get('/linen-item', linenController.getLinenItem);

router.post('/linen-stock', authAndRole(1, 2), linenController.createStock);
router.get('/linen-stock', linenController.getStock);
// router.put('/kpi-name', authAndRole(1, 2), kpiController.updateKPIName);
// router.delete('/kpi-name/:id', authAndRole(1, 2), kpiController.deleteKPIName);
// router.get('/kpi-name', kpiController.getKPIName);
// router.put("/kpi-name/reorder", authAndRole(1, 2), kpiController.reorderKPIName);
// router.get('/kpi-name-group', kpiController.getKPINameGroup);

module.exports = router;