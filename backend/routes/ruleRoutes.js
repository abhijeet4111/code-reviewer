const express = require('express');
const router = express.Router();
const {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleStatus,
  getRuleCategories,
} = require('../controllers/ruleController');

// GET /api/rules/categories - Get all rule categories
router.get('/categories', getRuleCategories);

// GET /api/rules - Get all rules with filtering
router.get('/', getAllRules);

// POST /api/rules - Create new rule
router.post('/', createRule);

// GET /api/rules/:id - Get specific rule by ID
router.get('/:id', getRuleById);

// PUT /api/rules/:id - Update rule
router.put('/:id', updateRule);

// PATCH /api/rules/:id/toggle - Toggle rule active status
router.patch('/:id/toggle', toggleRuleStatus);

// DELETE /api/rules/:id - Delete rule
router.delete('/:id', deleteRule);

module.exports = router;
