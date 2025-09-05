// Default security rules
export const defaultRules = [
  {
    id: 'SEC001',
    name: 'Hardcoded Secrets',
    description: 'Detects hardcoded API keys, tokens, and secrets',
    severity: 'HIGH',
    pattern: /(api[_-]?key|secret|token|password|auth)[_-]?=?\s*['"`][^'"`]+['"`]/i,
    enabled: true,
    category: 'Security',
    fix: 'Move secrets to environment variables or secure configuration management'
  },
  {
    id: 'SEC002',
    name: 'Insecure Direct Object References',
    description: 'Detects potential IDOR vulnerabilities',
    severity: 'HIGH',
    pattern: /\/(api|data)\/[^\/]+\/\d+/i,
    enabled: true,
    category: 'Security',
    fix: 'Implement proper access control and user permission checks'
  },
  {
    id: 'SEC003',
    name: 'XSS Vulnerability',
    description: 'Detects potential XSS vulnerabilities',
    severity: 'HIGH',
    pattern: /dangerouslySetInnerHTML|innerHTML\s*=/i,
    enabled: true,
    category: 'Security',
    fix: 'Use proper content sanitization and avoid direct HTML injection'
  },
  {
    id: 'QA001',
    name: 'Console Logging',
    description: 'Detects console.log statements',
    severity: 'LOW',
    pattern: /console\.(log|debug|info)/i,
    enabled: true,
    category: 'Quality',
    fix: 'Remove debug logging statements or replace with proper logging system'
  },
  {
    id: 'QA002',
    name: 'TODO Comments',
    description: 'Detects TODO comments in code',
    severity: 'LOW',
    pattern: /\/\/\s*TODO|\/\*\s*TODO/i,
    enabled: true,
    category: 'Quality',
    fix: 'Address TODO comments or convert to proper issue tickets'
  },
  {
    id: 'SEC004',
    name: 'Insecure HTTP',
    description: 'Detects usage of non-HTTPS URLs',
    severity: 'MEDIUM',
    pattern: /http:\/\/(?!localhost)/i,
    enabled: true,
    category: 'Security',
    fix: 'Use HTTPS for all external URLs'
  }
];

// Get rules from localStorage
const getStoredRules = () => {
  try {
    const stored = localStorage.getItem('customRules');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save rules to localStorage
const saveRules = (rules) => {
  localStorage.setItem('customRules', JSON.stringify(rules));
};

// Get all rules (default + custom)
export const getAllRules = () => {
  const customRules = getStoredRules();
  return [...defaultRules, ...customRules];
};

// Get active (enabled) rules
export const getActiveRules = () => {
  return getAllRules().filter(rule => rule.enabled);
};

// Get selected rules for scanning
export const getSelectedRules = () => {
  try {
    const selectedIds = JSON.parse(localStorage.getItem('selectedRules') || '[]');
    return getAllRules().filter(rule => selectedIds.includes(rule.id));
  } catch {
    return defaultRules;
  }
};

// Add a new custom rule
export const addCustomRule = (rule) => {
  const customRules = getStoredRules();
  const newRule = {
    ...rule,
    id: `CUSTOM${customRules.length + 1}`,
    enabled: true
  };
  customRules.push(newRule);
  saveRules(customRules);
  return newRule;
};

// Update rule enabled status
export const updateRuleStatus = (ruleId, enabled) => {
  const customRules = getStoredRules();
  const updatedRules = customRules.map(rule => 
    rule.id === ruleId ? { ...rule, enabled } : rule
  );
  saveRules(updatedRules);
};

// Save selected rules for scanning
export const saveSelectedRules = (ruleIds) => {
  localStorage.setItem('selectedRules', JSON.stringify(ruleIds));
};