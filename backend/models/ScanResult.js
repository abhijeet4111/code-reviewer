const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScanResult = sequelize.define('ScanResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  scan_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'scans',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  rule_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rule_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issue_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('HIGH', 'MEDIUM', 'LOW'),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  line_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  column_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  fix_suggestion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  code_snippet: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'REVIEWED', 'FIXED', 'IGNORED'),
    defaultValue: 'PENDING',
  },
  confidence_level: {
    type: DataTypes.INTEGER, // 0-100
    defaultValue: 80,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'scan_results',
  timestamps: true,
  indexes: [
    {
      fields: ['scan_id'],
    },
    {
      fields: ['severity'],
    },
    {
      fields: ['category'],
    },
    {
      fields: ['status'],
    },
  ],
});

module.exports = ScanResult;
