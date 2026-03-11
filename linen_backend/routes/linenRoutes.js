const express = require('express');
const router = express.Router();
const linenController = require('../controllers/linenController');
const transactionController = require('../controllers/transactionController');
const { authAndRole } = require("../middleware/auth")

router.post('/linen-item', authAndRole(1, 2), linenController.createLinenItem);
router.put('/linen-item', linenController.updateLinenItem);
router.get('/linen-item', linenController.getLinenItem);
router.delete('/linen-item/:id', authAndRole(1, 2), linenController.deleteLinenItem);
router.get('/linen-item/search', linenController.searchLinenItems);

router.post('/linen-stock', authAndRole(1, 2), linenController.createStock);
router.put('/linen-stock', authAndRole(1, 2), linenController.updateStock);
router.get('/linen-stock', linenController.getStock);
router.delete('/linen-stock/:id', authAndRole(1, 2), linenController.deleteStock);

router.post('/create', authAndRole(1, 2), transactionController.createLinenTransaction);
router.get('/transactions', transactionController.getLinenTransactions);

//Lookup
router.get('/department', linenController.getDepartment);
router.get('/partner', linenController.getPartner);
router.get("/linen-type", linenController.getLinenType);
module.exports = router;