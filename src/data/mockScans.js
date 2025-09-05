import { subDays } from 'date-fns';

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const repositories = [
  {
    id: 1,
    name: 'HealthVault-AI',
    url: 'https://github.com/abhijeetekad/HealthVault-AI',
    lastScan: subDays(new Date(), 2),
    issues: [
      {
        id: 101,
        issue: 'Hardcoded API Endpoints',
        severity: 'HIGH',
        location: 'src/utils/api.js:15',
        description: 'API endpoints are hardcoded in the source code',
        fix: 'Move API endpoints to environment variables',
        status: 'PENDING'
      },
      {
        id: 102,
        issue: 'Insecure File Upload',
        severity: 'HIGH',
        location: 'src/components/FileUploader.jsx:45',
        description: 'File upload lacks proper validation',
        fix: 'Implement file type and size validation',
        status: 'RESOLVED'
      }
    ]
  },
  {
    id: 2,
    name: 'y2mp3',
    url: 'https://github.com/abhijeetekad/y2mp3',
    lastScan: subDays(new Date(), 5),
    issues: [
      {
        id: 201,
        issue: 'Rate Limiting Bypass',
        severity: 'HIGH',
        location: 'server/middleware/rateLimiter.js:23',
        description: 'Rate limiting can be bypassed using proxy',
        fix: 'Implement IP-based rate limiting with proxy detection',
        status: 'PENDING'
      },
      {
        id: 202,
        issue: 'Insecure Dependencies',
        severity: 'MEDIUM',
        location: 'package.json',
        description: 'Multiple dependencies have known vulnerabilities',
        fix: 'Update dependencies to latest secure versions',
        status: 'PENDING'
      },
      {
        id: 203,
        issue: 'Missing Input Sanitization',
        severity: 'MEDIUM',
        location: 'src/utils/urlValidator.js:8',
        description: 'URL input is not properly sanitized',
        fix: 'Implement proper URL validation and sanitization',
        status: 'RESOLVED'
      }
    ]
  },
  {
    id: 3,
    name: 'developer-tool',
    url: 'https://github.com/abhijeetekad/developer-tool',
    lastScan: subDays(new Date(), 8),
    issues: [
      {
        id: 301,
        issue: 'Exposed Environment Variables',
        severity: 'HIGH',
        location: '.env.example',
        description: 'Sensitive configuration exposed in example file',
        fix: 'Remove sensitive data from example files',
        status: 'RESOLVED'
      }
    ]
  },
  {
    id: 4,
    name: 'google-forms-clone',
    url: 'https://github.com/abhijeetekad/google-forms-clone',
    lastScan: subDays(new Date(), 1),
    issues: [
      {
        id: 401,
        issue: 'XSS Vulnerability',
        severity: 'HIGH',
        location: 'src/components/FormRenderer.jsx:56',
        description: 'Form input not properly sanitized before rendering',
        fix: 'Implement proper HTML escaping',
        status: 'PENDING'
      },
      {
        id: 402,
        issue: 'CSRF Protection Missing',
        severity: 'MEDIUM',
        location: 'src/api/formSubmit.js:12',
        description: 'Form submission lacks CSRF protection',
        fix: 'Implement CSRF tokens',
        status: 'PENDING'
      }
    ]
  }
];

// Generate historical scan data
export const generateHistoricalData = () => {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  
  const data = [];
  repositories.forEach(repo => {
    // Generate 5-10 random scans for each repo
    const scanCount = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < scanCount; i++) {
      const scanDate = generateRandomDate(thirtyDaysAgo, today);
      data.push({
        repoId: repo.id,
        repoName: repo.name,
        date: scanDate,
        highSeverity: Math.floor(Math.random() * 3),
        mediumSeverity: Math.floor(Math.random() * 4),
        lowSeverity: Math.floor(Math.random() * 5),
        resolved: Math.floor(Math.random() * 3)
      });
    }
  });
  
  return data.sort((a, b) => a.date - b.date);
};

// Calculate statistics
export const calculateStats = () => {
  const totalIssues = repositories.reduce((acc, repo) => acc + repo.issues.length, 0);
  const highSeverity = repositories.reduce((acc, repo) => 
    acc + repo.issues.filter(issue => issue.severity === 'HIGH').length, 0);
  const resolvedIssues = repositories.reduce((acc, repo) => 
    acc + repo.issues.filter(issue => issue.status === 'RESOLVED').length, 0);
  const pendingIssues = totalIssues - resolvedIssues;

  return {
    totalScans: repositories.length,
    totalIssues,
    highSeverity,
    resolvedIssues,
    pendingIssues
  };
};

// Get latest scan results
export const getLatestScanResults = () => {
  return repositories.map(repo => ({
    id: repo.id,
    name: repo.name,
    url: repo.url,
    lastScan: repo.lastScan,
    issueCount: repo.issues.length,
    highSeverity: repo.issues.filter(issue => issue.severity === 'HIGH').length,
    mediumSeverity: repo.issues.filter(issue => issue.severity === 'MEDIUM').length,
    lowSeverity: repo.issues.filter(issue => issue.severity === 'LOW').length,
    resolved: repo.issues.filter(issue => issue.status === 'RESOLVED').length,
    pending: repo.issues.filter(issue => issue.status === 'PENDING').length
  }));
};
