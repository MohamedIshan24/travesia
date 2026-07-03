const express = require('express');
const router = express.Router();
const { generateEssay } = require('../controllers/essayController');

router.post('/:id/essay', generateEssay);

module.exports = router;