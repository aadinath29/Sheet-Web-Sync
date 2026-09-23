const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheetController');

router.get('/api/rows', sheetController.getRows);
router.post('/api/rows/:index', sheetController.updateRow);

router.post('/sheet-data-update', sheetController.handleWebhook);

module.exports = router;
