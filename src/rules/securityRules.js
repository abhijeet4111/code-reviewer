// Default security scanning rules used for Normal Scan
// Each rule can optionally include a RegExp "pattern" that, when matched in any scanned file content,
// will produce an issue with the given severity and description.
// This is a simple prototype ruleset and can be extended.

export const defaultSecurityRules = [
  {
    id: 'R001',
    title: 'Hardcoded API Endpoint',
    description: 'Avoid hardcoding API endpoints in the source code. Use environment variables instead.',
    severity: 'MEDIUM',
    pattern: /https?:\/\/[^\s'"`]+/i
  },
  {
    id: 'R002',
    title: 'Potential XSS via dangerouslySetInnerHTML',
    description: 'Using dangerouslySetInnerHTML can lead to XSS if input is not sanitized.',
    severity: 'HIGH',
    pattern: /dangerouslySetInnerHTML/i
  },
  {
    id: 'R003',
    title: 'Missing CSRF Protection',
    description: 'API calls that mutate state should be protected with CSRF tokens.',
    severity: 'MEDIUM',
    pattern: /fetch\([^)]*\{[^}]*method:\s*['"](POST|PUT|PATCH|DELETE)['"][^}]*\}/i
  },
  {
    id: 'R004',
    title: 'Insecure HTTP Usage',
    description: 'Detected plain HTTP usage. Prefer HTTPS for network requests.',
    severity: 'LOW',
    pattern: /http:\/\//i
  },
  {
    id: 'R005',
    title: 'Secret-like Pattern Found',
    description: 'Content resembles a secret or token. Ensure secrets are not committed.',
    severity: 'HIGH',
    pattern: /(api[_-]?key|secret|token)[\s=:]+['"][A-Za-z0-9_\-]{16,}['"]/i
  }
];
