const { Rule } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all rules
 */
const getAllRules = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, severity, active } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (category) whereClause.category = category;
    if (severity) whereClause.severity = severity;
    if (active !== undefined) whereClause.is_active = active === 'true';

    const { rows: rules, count: total } = await Rule.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['category', 'ASC'], ['severity', 'DESC'], ['name', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        rules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Get all rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get rule by ID
 */
const getRuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await Rule.findByPk(id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found',
      });
    }

    res.json({
      success: true,
      data: rule,
    });

  } catch (error) {
    console.error('Get rule by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Create a new rule
 */
const createRule = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      pattern,
      severity,
      category,
      language,
      file_extensions,
      fix_suggestion,
      is_active = true,
    } = req.body;

    // Validate required fields
    if (!id || !name || !description || !pattern || !severity || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: id, name, description, pattern, severity, category',
      });
    }

    // Check if rule ID already exists
    const existingRule = await Rule.findByPk(id);
    if (existingRule) {
      return res.status(400).json({
        success: false,
        message: 'Rule with this ID already exists',
      });
    }

    // Validate pattern (try to create RegExp)
    try {
      new RegExp(pattern, 'i');
    } catch (patternError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid regular expression pattern',
        error: patternError.message,
      });
    }

    const rule = await Rule.create({
      id,
      name,
      description,
      pattern,
      severity,
      category,
      language,
      file_extensions: file_extensions || [],
      fix_suggestion,
      is_active,
      is_custom: true,
      created_by: req.user?.id || 'system', // You can implement user auth later
    });

    res.status(201).json({
      success: true,
      message: 'Rule created successfully',
      data: rule,
    });

  } catch (error) {
    console.error('Create rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Update rule
 */
const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const rule = await Rule.findByPk(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found',
      });
    }

    // Validate pattern if provided
    if (updateData.pattern) {
      try {
        new RegExp(updateData.pattern, 'i');
      } catch (patternError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid regular expression pattern',
          error: patternError.message,
        });
      }
    }

    await rule.update(updateData);

    res.json({
      success: true,
      message: 'Rule updated successfully',
      data: rule,
    });

  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Delete rule
 */
const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await Rule.findByPk(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found',
      });
    }

    await rule.destroy();

    res.json({
      success: true,
      message: 'Rule deleted successfully',
    });

  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Toggle rule active status
 */
const toggleRuleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await Rule.findByPk(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found',
      });
    }

    await rule.update({ is_active: !rule.is_active });

    res.json({
      success: true,
      message: `Rule ${rule.is_active ? 'activated' : 'deactivated'} successfully`,
      data: rule,
    });

  } catch (error) {
    console.error('Toggle rule status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get rule categories
 */
const getRuleCategories = async (req, res) => {
  try {
    const categories = await Rule.findAll({
      attributes: [[Rule.sequelize.fn('DISTINCT', Rule.sequelize.col('category')), 'category']],
      raw: true,
    });

    res.json({
      success: true,
      data: categories.map(c => c.category),
    });

  } catch (error) {
    console.error('Get rule categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleStatus,
  getRuleCategories,
};
