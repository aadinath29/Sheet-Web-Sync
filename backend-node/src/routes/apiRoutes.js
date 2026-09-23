const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheetController');

// Proxies to Python
router.get('/api/rows', sheetController.getRows);
router.post('/api/rows/:index', sheetController.updateRow);

// Webhook from Python
router.post('/sheet-data-update', sheetController.handleWebhook);

module.exports = router;
