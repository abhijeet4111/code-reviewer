const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rule = sequelize.define('Rule', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pattern: {
    type: DataTypes.TEXT,
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
  language: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  file_extensions: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  fix_suggestion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_custom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'rules',
  timestamps: true,
  indexes: [
    {
      fields: ['category'],
    },
    {
      fields: ['severity'],
    },
    {
      fields: ['is_active'],
    },
    {
      fields: ['language'],
    },
  ],
});

module.exports = Rule;
