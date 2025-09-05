import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../components/shadcn/Card";
import { Button } from "../components/shadcn/Button";
import { Shield, Plus, Save, AlertTriangle } from 'lucide-react';
import RuleEditor from '../components/rules/RuleEditor';
import { getAllRules, addCustomRule, updateRuleStatus, saveSelectedRules } from '../lib/rulesStorage';

const Rules = () => {
  const [rules, setRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState(new Set());
  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    const allRules = getAllRules();
    setRules(allRules);
    // Initialize selected rules
    setSelectedRules(new Set(allRules.filter(r => r.enabled).map(r => r.id)));
  }, []);

  const handleSaveRule = (ruleData) => {
    const addedRule = addCustomRule(ruleData);
    setRules([...rules, addedRule]);
    setShowEditor(false);
    setEditingRule(null);
  };

  const handleRuleToggle = (ruleId) => {
    const newSelected = new Set(selectedRules);
    if (newSelected.has(ruleId)) {
      newSelected.delete(ruleId);
    } else {
      newSelected.add(ruleId);
    }
    setSelectedRules(newSelected);
    updateRuleStatus(ruleId, newSelected.has(ruleId));
  };

  const handleSaveSelection = () => {
    saveSelectedRules(Array.from(selectedRules));
  };

  const severityColors = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800'
  };

  const handleAddNewRule = () => {
    setEditingRule({
      name: '',
      description: '',
      pattern: '',
      severity: 'MEDIUM',
      category: 'Security',
      fix: ''
    });
    setShowEditor(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Security Rules</h1>
          <p className="text-gray-500 mt-1">
            Manage and customize security scanning rules
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleAddNewRule}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Rule
          </Button>
          <Button onClick={handleSaveSelection}>
            <Save className="w-4 h-4 mr-2" />
            Save Selection
          </Button>
        </div>
      </div>

      {showEditor && (
        <RuleEditor
          rule={editingRule}
          onSave={handleSaveRule}
          onCancel={() => {
            setShowEditor(false);
            setEditingRule(null);
          }}
        />
      )}

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id} className={selectedRules.has(rule.id) ? 'border-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[rule.severity]}`}>
                      {rule.severity}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                      {rule.category}
                    </span>
                    {rule.id.startsWith('CUSTOM') && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Pattern: </span>
                      <code className="bg-gray-100 px-2 py-1 rounded">{rule.pattern.toString()}</code>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Fix: </span>
                      {rule.fix}
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <Button
                    variant={selectedRules.has(rule.id) ? "default" : "outline"}
                    onClick={() => handleRuleToggle(rule.id)}
                  >
                    {selectedRules.has(rule.id) ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Rules;