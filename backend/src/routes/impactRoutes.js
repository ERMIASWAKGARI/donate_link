const express = require('express');
const { getImpact } = require('../controllers/impactController');

const router = express.Router();

router.get('/get-impact', getImpact);

module.exports = router;
