const { Rule } = require('../models');

const defaultRules = [
  {
    id: 'SEC001',
    name: 'Hardcoded Secrets',
    description: 'Detects hardcoded API keys, passwords, and tokens in source code',
    pattern: '(api[_-]?key|secret|token|password)[_-]?\\s*[:=]\\s*["\'][^"\'\\s]{8,}["\']',
    severity: 'HIGH',
    category: 'Security',
    language: 'JavaScript',
    file_extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    fix_suggestion: 'Move secrets to environment variables or secure configuration files',
    is_active: true,
    is_custom: false,
  },
  {
    id: 'SEC002',
    name: 'SQL Injection',
    description: 'Detects potential SQL injection vulnerabilities in database queries',
    pattern: '(query|execute)\\s*\\(\\s*["\'][^"\']*\\$\\{[^}]+\\}[^"\']*["\']',
    severity: 'HIGH',
    category: 'Security',
    language: 'JavaScript',
    file_extensions: ['.js', '.ts'],
    fix_suggestion: 'Use parameterized queries or prepared statements instead of string concatenation',
    is_active: true,
    is_custom: false,
  },
  {
    id: 'SEC003',
    name: 'Weak Cryptography',
    description: 'Detects usage of weak or deprecated cryptographic algorithms',
    pattern: '(md5|sha1|des|rc4|createCipher)\\s*\\(',
    severity: 'MEDIUM',
    category: 'Security',
    language: 'JavaScript',
    file_extensions: ['.js', '.ts'],
    fix_suggestion: 'Use strong cryptographic algorithms like AES-256, SHA-256, or bcrypt',
    is_active: true,
    is_custom: false,
  },
  {
    id: 'SEC004',
    name: 'Insecure Random',
    description: 'Detects usage of weak random number generation',
    pattern: 'Math\\.random\\(\\)',
    severity: 'MEDIUM',
    category: 'Security',
    language: 'JavaScript',
    file_extensions: ['.js', '.ts'],
    fix_suggestion: 'Use crypto.randomBytes() or crypto.getRandomValues() for cryptographically secure random numbers',
    is_active: true,
    is_custom: false,
  },
  {
    id: 'SEC005',
    name: 'XSS Vulnerability',
    description: 'Detects potential Cross-Site Scripting (XSS) vulnerabilities',
    pattern: '(innerHTML|outerHTML|document\\.write)\\s*[+=]\\s*[^;]+\\+[^;]*\\)',
    severity: 'HIGH',
    category: 'Security',
    language: 'JavaScript',
    file_extensions: ['.js', '.ts', '.jsx', '.tsx'],
    fix_suggestion: 'Use textContent instead of innerHTML, or properly sanitize user input',
    is_active: true,
    is_custom: false,
  },
  {
    id: 'SEC006',
    name: 'Insecure HTTP',
    description: 'Detects usage of insecure HTTP URLs instead of HTTPS',
    pattern: 'http://(?!localhost|127\\.0\\.0\\.1)',
    severity: 'MEDIUM',
    category: 'Security',
    language: null,
    file_extensions: ['.js', '.ts', '.json', '.config'],
    fix_suggestion: 'Use HTTPS instead of HTTP for external communications',
    is_active: true,
    is_custom: false,
  },
  {
    id: 'SEC007',
    name: 'Debug Information',
    description: 'Detects debug information that should not be in production',
    pattern: '(console\\.(log|debug|info|warn|error)|debugger;|TODO|FIXME)',
    severity: 'LOW',
    category: 'Code Quality',
    language: 'JavaScript',
    file_extensions: ['.js', '.ts', '.jsx', '.tsx'],
    fix_suggestion: 'Remove debug statements and TODO comments before production deployment',
    is_active: true,
    is_custom: false,
  },
  {
    id: 'SEC008',
    name: 'Insecure CORS',
    description: 'Detects overly permissive CORS configuration',
    pattern: 'origin\\s*:\\s*["\']\\*["\']',
    severity: 'MEDIUM',
    category: 'Security',
    language: 'JavaScript',
    file_extensions: ['.js', '.ts'],
    fix_suggestion: 'Specify allowed origins explicitly instead of using wildcard',
    is_active: true,
    is_custom: false,
  },
  {
    id: 'SEC009',
    name: 'Eval Usage',
    description: 'Detects dangerous usage of eval() function',
    pattern: 'eval\\s*\\(',
    severity: 'HIGH',
    category: 'Security',
    language: 'JavaScript',
    file_extensions: ['.js', '.ts'],
    fix_suggestion: 'Avoid using eval(). Use safer alternatives like JSON.parse() for data parsing',
    is_active: true,
    is_custom: false,
  },
  {
    id: 'SEC010',
    name: 'Vulnerable Dependencies',
    description: 'Detects potentially vulnerable package versions',
    pattern: '("express"\\s*:\\s*"4\\.[0-9]\\.|"lodash"\\s*:\\s*"4\\.17\\.[0-9]")',
    severity: 'MEDIUM',
    category: 'Dependencies',
    language: null,
    file_extensions: ['package.json'],
    fix_suggestion: 'Update dependencies to their latest secure versions',
    is_active: true,
    is_custom: false,
  },
];

const seedRules = async () => {
  try {
    console.log('🌱 Starting to seed security rules...');
    
    for (const ruleData of defaultRules) {
      const [rule, created] = await Rule.findOrCreate({
        where: { id: ruleData.id },
        defaults: ruleData,
      });
      
      if (created) {
        console.log(`✅ Created rule: ${rule.id} - ${rule.name}`);
      } else {
        console.log(`⏭️  Rule already exists: ${rule.id} - ${rule.name}`);
      }
    }
    
    console.log('🎉 Rule seeding completed successfully!');
    console.log(`📊 Total rules in database: ${await Rule.count()}`);
    
  } catch (error) {
    console.error('❌ Error seeding rules:', error.message);
    throw error;
  }
};

module.exports = { seedRules, defaultRules };
