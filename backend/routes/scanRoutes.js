const express = require('express');
const router = express.Router();
const {
  createScan,
  getAllScans,
  getScanById,
  deleteScan,
  getScanStatistics,
} = require('../controllers/scanController');

// POST /api/scans - Create new scan
router.post('/', createScan);

// GET /api/scans - Get all scans with pagination
router.get('/', getAllScans);

// GET /api/scans/statistics - Get scan statistics
router.get('/statistics', getScanStatistics);

// GET /api/scans/:id - Get specific scan by ID
router.get('/:id', getScanById);

// DELETE /api/scans/:id - Delete scan
router.delete('/:id', deleteScan);

module.exports = router;
