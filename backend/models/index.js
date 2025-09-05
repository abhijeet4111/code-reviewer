const Scan = require('./Scan');
const ScanResult = require('./ScanResult');
const Rule = require('./Rule');

// Define associations
Scan.hasMany(ScanResult, {
  foreignKey: 'scan_id',
  as: 'results',
  onDelete: 'CASCADE',
});

ScanResult.belongsTo(Scan, {
  foreignKey: 'scan_id',
  as: 'scan',
});

// Note: Rule doesn't have direct foreign key relationship with ScanResult
// because we store rule_id as string to allow for dynamic rules
// But we can add a method to find related results
Rule.prototype.getResults = function() {
  return ScanResult.findAll({
    where: { rule_id: this.id }
  });
};

module.exports = {
  Scan,
  ScanResult,
  Rule,
};
