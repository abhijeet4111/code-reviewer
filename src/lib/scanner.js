// Run scan with selected rules
export const runRuleScan = ({ files, rules }) => {
  const issues = [];

  files.forEach(file => {
    rules.forEach(rule => {
      if (rule.pattern instanceof RegExp) {
        const matches = file.content.match(rule.pattern);
        if (matches) {
          issues.push({
            id: `${rule.id}_${Date.now()}`,
            issue: rule.name,
            severity: rule.severity,
            location: file.path,
            description: `${rule.description}. Found: ${matches[0]}`,
            fix: rule.fix,
            status: 'PENDING',
            category: rule.category
          });
        }
      }
    });
  });

  return issues;
};