const express = require('express');
const dynamicController = require('../controllers/dynamicController');
const router = express.Router();

router.post('/insert', dynamicController.insert);
router.post('/delete', dynamicController.delete);
router.post('/update', dynamicController.update);
router.post('/select', dynamicController.select);

module.exports = router;