const express = require('express');
const router = express.Router();
const linenController = require('../controllers/linenController');
const transactionController = require('../controllers/transactionController');
const { authAndRole } = require("../middleware/auth")

// router.post('/linen-item', authAndRole(), linenController.createLinenItem);
// router.put('/linen-item', linenController.updateLinenItem);
router.get('/linen-item', linenController.getLinenItem);
// router.delete('/linen-item/:id', authAndRole(), linenController.deleteLinenItem);
router.get('/linen-item/search', linenController.searchLinenItems);

router.post('/linen-stock', authAndRole(), linenController.createStock);
router.put('/linen-stock', authAndRole(), linenController.updateStock);
router.get('/linen-stock', linenController.getStock);
router.delete('/linen-stock/:id', authAndRole(), linenController.deleteStock);

router.post('/create', authAndRole(), transactionController.createLinenTransaction);
router.get('/transactions', transactionController.getLinenTransactions);

//Lookup
router.get('/department', linenController.getDepartment);
router.get('/partner', linenController.getPartner);
router.get("/linen-type", linenController.getLinenType);
module.exports = router;