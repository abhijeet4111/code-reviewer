const { v4: uuidv4 } = require('uuid');

/**
 * Mock scanner that simulates scanning a repository
 * In a real implementation, this would fetch files from GitHub API
 * and run actual pattern matching
 */

const mockFiles = [
  {
    path: 'src/config/database.js',
    content: `
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password123',  // Hardcoded password - security issue
  database: 'myapp'
});

const API_KEY = "sk-1234567890abcdef";  // Hardcoded API key - security issue
module.exports = connection;
    `,
  },
  {
    path: 'src/auth/auth.js',
    content: `
const jwt = require('jsonwebtoken');
const SECRET_KEY = "my-secret-key";  // Weak secret key

function authenticate(req, res, next) {
  // No input validation - security issue
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Vulnerable to timing attacks
  if (token === 'admin-token') {
    req.user = { role: 'admin' };
    next();
  } else {
    res.status(403).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate };
    `,
  },
  {
    path: 'src/api/users.js',
    content: `
const express = require('express');
const router = express.Router();

router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  // SQL Injection vulnerability - no parameterization
  const query = \`SELECT * FROM users WHERE id = '\${userId}'\`;
  
  db.query(query, (err, results) => {
    if (err) {
      // Information disclosure - error details exposed
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
    `,
  },
  {
    path: 'src/utils/crypto.js',
    content: `
const crypto = require('crypto');

// Weak encryption algorithm
function encrypt(text) {
  const cipher = crypto.createCipher('des', 'weak-key');
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Weak random number generation
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports = { encrypt, generateId };
    `,
  },
  {
    path: 'package.json',
    content: `{
  "name": "vulnerable-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "4.16.4",
    "mysql2": "1.6.5",
    "lodash": "4.17.10"
  }
}`,
  },
];

const scanRepository = async (repositoryUrl, rules) => {
  // Simulate scanning delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const issues = [];
  let totalFiles = mockFiles.length;

  // Simulate scanning each file against each rule
  for (const file of mockFiles) {
    for (const rule of rules) {
      try {
        const pattern = new RegExp(rule.pattern, 'gi');
        const matches = file.content.match(pattern);
        
        if (matches) {
          // Find line number where issue occurs
          const lines = file.content.split('\\n');
          let lineNumber = 1;
          let foundLine = false;
          
          for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
              lineNumber = i + 1;
              foundLine = true;
              break;
            }
          }

          // Create issue for each match (or just one per file per rule)
          issues.push({
            id: uuidv4(),
            rule_id: rule.id,
            rule_name: rule.name,
            issue_type: rule.name,
            severity: rule.severity,
            category: rule.category,
            file_path: file.path,
            line_number: foundLine ? lineNumber : null,
            description: rule.description,
            fix_suggestion: rule.fix_suggestion || 'Please review and fix this issue',
            code_snippet: foundLine ? lines[lineNumber - 1]?.trim() : matches[0],
          });
        }
      } catch (error) {
        console.error(`Error processing rule ${rule.id}:`, error.message);
      }
    }
  }

  return {
    totalFiles,
    issues,
    scanDuration: 2, // seconds
  };
};

// Mock function to validate GitHub repository URL
const validateRepositoryUrl = (url) => {
  const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
  return githubUrlPattern.test(url);
};

// Mock function to get repository info
const getRepositoryInfo = async (url) => {
  if (!validateRepositoryUrl(url)) {
    throw new Error('Invalid GitHub repository URL');
  }

  const urlParts = url.replace('https://github.com/', '').split('/');
  return {
    owner: urlParts[0],
    name: urlParts[1],
    full_name: `${urlParts[0]}/${urlParts[1]}`,
    description: 'Mock repository for security scanning',
    language: 'JavaScript',
    stars: Math.floor(Math.random() * 1000),
    forks: Math.floor(Math.random() * 100),
    private: false,
  };
};

module.exports = {
  scanRepository,
  validateRepositoryUrl,
  getRepositoryInfo,
};
