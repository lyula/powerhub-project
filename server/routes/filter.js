const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController');

router.get('/', filterController.getFilters);
router.post('/', filterController.createFilter);
router.delete('/:id', filterController.deleteFilter);

module.exports = router;
