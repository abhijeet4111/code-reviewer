import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../shadcn/Card";
import { Button } from "../shadcn/Button";
import { Input } from "../shadcn/Input";

const FormField = ({ label, children, helpText }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium">{label}</label>
    {children}
    {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
  </div>
);

const Select = ({ value, onChange, options }) => (
  <select
    className="w-full rounded-md border border-input bg-background px-3 py-2"
    value={value}
    onChange={onChange}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

const severityOptions = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' }
];

const categoryOptions = [
  { value: 'Security', label: 'Security' },
  { value: 'Quality', label: 'Quality' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Best Practice', label: 'Best Practice' }
];

const RuleEditor = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState({
    name: rule?.name || '',
    description: rule?.description || '',
    pattern: rule?.pattern || '',
    severity: rule?.severity || 'MEDIUM',
    category: rule?.category || 'Security',
    fix: rule?.fix || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      new RegExp(formData.pattern);
      onSave(formData);
    } catch (error) {
      alert('Invalid regular expression pattern');
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{rule?.id ? 'Edit Rule' : 'Add New Rule'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField 
            label="Rule Name" 
            helpText="A clear, descriptive name for the rule"
          >
            <Input
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="e.g., Detect Hardcoded Secrets"
              required
            />
          </FormField>

          <FormField 
            label="Description" 
            helpText="Detailed description of what the rule checks for"
          >
            <Input
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="e.g., Detects hardcoded API keys and secrets in code"
              required
            />
          </FormField>

          <FormField 
            label="Pattern (RegExp)" 
            helpText="JavaScript regular expression pattern to match in code"
          >
            <Input
              value={formData.pattern}
              onChange={handleChange('pattern')}
              placeholder="e.g., api[-]?key|secret|token"
              required
            />
          </FormField>

          <FormField 
            label="Severity" 
            helpText="Impact level of the detected issue"
          >
            <Select
              value={formData.severity}
              onChange={handleChange('severity')}
              options={severityOptions}
            />
          </FormField>

          <FormField 
            label="Category" 
            helpText="Type of issue this rule detects"
          >
            <Select
              value={formData.category}
              onChange={handleChange('category')}
              options={categoryOptions}
            />
          </FormField>

          <FormField 
            label="Suggested Fix" 
            helpText="How to fix issues detected by this rule"
          >
            <Input
              value={formData.fix}
              onChange={handleChange('fix')}
              placeholder="e.g., Move secrets to environment variables"
              required
            />
          </FormField>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit">
              {rule?.id ? 'Update Rule' : 'Add Rule'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RuleEditor;