const express = require('express');
const router = express.Router();
const {
  createDeepScan,
  getSonarProjectDetails,
} = require('../controllers/sonarController');

// POST /api/sonar/scan - Create new deep scan with SonarQube
router.post('/scan', createDeepScan);

// GET /api/sonar/project/:id - Get SonarQube project details
router.get('/project/:id', getSonarProjectDetails);

module.exports = router;
