const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Scan = sequelize.define('Scan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  repository_url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
      notEmpty: true,
    },
  },
  repository_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  repository_owner: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scan_status: {
    type: DataTypes.ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING',
  },
  total_files_scanned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_issues_found: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  high_severity_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  medium_severity_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  low_severity_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  scan_started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  scan_completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  scan_duration: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: true,
  },
  rules_used: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'scans',
  timestamps: true,
  indexes: [
    {
      fields: ['repository_url'],
    },
    {
      fields: ['scan_status'],
    },
    {
      fields: ['scan_started_at'],
    },
  ],
});

module.exports = Scan;
