const express = require('express');
const { createMultiIncentiveApplication } = require('../controllers/multiIncentiveApplicationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(protect);

// Çoklu teşvik başvurusu oluştur
router.post('/', createMultiIncentiveApplication);

module.exports = router;