const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const ctrl = require('../controllers/uploadController');

// Accept any file field name (e.g., 'file', 'resume', 'document')
router.post('/', upload.any(), ctrl.upload);

module.exports = router;
