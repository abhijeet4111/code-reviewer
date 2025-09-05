const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const simpleGit = require('simple-git');
const axios = require('axios');
const sonarqubeScanner = require('sonarqube-scanner');
const { spawn } = require('child_process');

// SonarQube configuration
const SONAR_CONFIG = {
  hostUrl: 'http://localhost:9000',
  token: 'squ_51088d4005de03191d2d591d14db1bef1bb809ba',
  maxWaitMs: 180000, // 3 minutes
};

/**
 * Create base64 encoded authorization header
 */
function base64(input) {
  return Buffer.from(input, 'utf8').toString('base64');
}

/**
 * Create axios client with SonarQube authentication
 */
function createSonarAxios({ hostUrl, token }) {
  const authHeader = `Basic ${base64(`${token}:`)}`;
  return axios.create({
    baseURL: hostUrl,
    headers: { Authorization: authHeader },
    timeout: 30000,
    validateStatus: () => true,
  });
}

/**
 * Run SonarQube scanner in a child process for better isolation
 */
async function runSonarScannerInChild({ serverUrl, token, projectKey, projectName, sourcesDir }) {
  const runnerPath = path.join(os.tmpdir(), `sonar-runner-${Date.now()}.cjs`);
  const content = `
const { createRequire } = require('module');
const path = require('path');
const projectRoot = process.env.PROJECT_ROOT;
const requireFromProject = createRequire(path.join(projectRoot, 'package.json'));
const scanner = requireFromProject('sonarqube-scanner');

scanner({
  serverUrl: process.env.SONAR_URL,
  token: process.env.SONAR_TOKEN,
  options: {
    'sonar.projectKey': process.env.SONAR_KEY,
    'sonar.projectName': process.env.SONAR_NAME,
    'sonar.projectBaseDir': process.env.SONAR_BASEDIR,
    'sonar.sources': '.',
    'sonar.inclusions': '**/*.js,**/*.jsx,**/*.ts,**/*.tsx,**/*.py,**/*.java,**/*.cpp,**/*.c,**/*.cs',
    'sonar.exclusions': 'node_modules/**,**/*.test.*,tests/**,**/*.spec.*,dist/**,build/**,coverage/**',
    ...(process.env.SONAR_TSCONFIG ? { 'sonar.typescript.tsconfigPath': process.env.SONAR_TSCONFIG } : {})
  }
}, () => {
  process.exit(0);
});
`;

  await fs.writeFile(runnerPath, content, 'utf8');
  
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [runnerPath], {
        env: {
          ...process.env,
          PROJECT_ROOT: __dirname,
          SONAR_URL: serverUrl,
          SONAR_TOKEN: token,
          SONAR_KEY: projectKey,
          SONAR_NAME: projectName,
          SONAR_BASEDIR: sourcesDir,
          ...(process.env.SONAR_TSCONFIG ? { SONAR_TSCONFIG: process.env.SONAR_TSCONFIG } : {})
        },
        stdio: 'inherit',
      });
      
      child.on('exit', (code) => {
        if (code === 0) return resolve();
        reject(new Error(`SonarQube scanner exited with code ${code}`));
      });
      
      child.on('error', reject);
    });
  } finally {
    try {
      await fs.rm(runnerPath, { force: true });
    } catch (error) {
      console.warn('Failed to cleanup scanner file:', error.message);
    }
  }
}

/**
 * Fetch SonarQube analysis results
 */
async function fetchSonarResults({ hostUrl, token, projectKey, maxWaitMs = 60000 }) {
  const axiosClient = createSonarAxios({ hostUrl, token });
  const start = Date.now();

  async function tryFetch() {
    try {
      // Fetch project measures
      const measuresRes = await axiosClient.get('/api/measures/component', {
        params: {
          component: projectKey,
          metricKeys: 'bugs,vulnerabilities,code_smells,security_hotspots,coverage,duplicated_lines_density,ncloc,complexity',
        },
      });

      // Fetch issues
      const issuesRes = await axiosClient.get('/api/issues/search', {
        params: {
          componentKeys: projectKey,
          ps: 500, // Get more results
          s: 'SEVERITY',
          asc: 'false',
          facets: 'severities,types,rules',
        },
      });

      if (measuresRes.status === 200 && issuesRes.status === 200) {
        return {
          measures: measuresRes.data,
          issues: issuesRes.data,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.warn('Error fetching SonarQube results:', error.message);
    }
    return null;
  }

  // Poll for results with timeout
  while (Date.now() - start < maxWaitMs) {
    const data = await tryFetch();
    if (data) return data;
    
    // Wait 3 seconds before next attempt
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  // Final attempt - return whatever we get
  console.log('Timeout reached, attempting final fetch...');
  return await tryFetch();
}

/**
 * Clone repository and run SonarQube analysis
 */
async function scanRepositoryWithSonar(repoUrl) {
  const repoName = repoUrl.split('/').pop().replace(/\\.git$/, '') || 'project';
  const projectKey = repoName.toLowerCase().replace(/[^a-z0-9-_.]/g, '-');
  
  // Create temporary directory
  const tempBase = await fs.mkdtemp(path.join(os.tmpdir(), 'sonar-scan-'));
  const repoDir = path.join(tempBase, 'repo');

  try {
    console.log(`Starting SonarQube scan for: ${repoUrl}`);
    console.log(`Project key: ${projectKey}`);
    console.log(`Temp directory: ${tempBase}`);

    // Clone repository
    const git = simpleGit();
    await git.clone(repoUrl, repoDir, ['--depth', '1']); // Shallow clone for speed

    // Check for TypeScript config
    const tsconfigPath = path.join(repoDir, 'tsconfig.json');
    try {
      await fs.access(tsconfigPath);
      process.env.SONAR_TSCONFIG = tsconfigPath;
      console.log('Found TypeScript config at:', tsconfigPath);
    } catch {
      // No TypeScript config found
      delete process.env.SONAR_TSCONFIG;
    }

    // Run SonarQube scanner
    console.log('Running SonarQube scanner...');
    await runSonarScannerInChild({
      serverUrl: SONAR_CONFIG.hostUrl,
      token: SONAR_CONFIG.token,
      projectKey,
      projectName: repoName,
      sourcesDir: repoDir,
    });

    console.log('Scanner completed, fetching results...');
    
    // Fetch results
    const results = await fetchSonarResults({
      hostUrl: SONAR_CONFIG.hostUrl,
      token: SONAR_CONFIG.token,
      projectKey,
      maxWaitMs: SONAR_CONFIG.maxWaitMs,
    });

    if (!results) {
      throw new Error('Failed to fetch SonarQube analysis results');
    }

    console.log(`SonarQube scan completed for ${repoName}`);
    
    return {
      projectKey,
      projectName: repoName,
      measures: results.measures,
      issues: results.issues,
      timestamp: results.timestamp,
      success: true,
    };

  } catch (error) {
    console.error('SonarQube scan error:', error.message);
    throw error;
  } finally {
    // Cleanup temporary directory
    try {
      await fs.rm(tempBase, { recursive: true, force: true });
      console.log(`Cleaned up temp directory: ${tempBase}`);
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error.message);
    }
    
    // Cleanup environment variable
    delete process.env.SONAR_TSCONFIG;
  }
}

/**
 * Transform SonarQube measures into a more usable format
 */
function transformSonarMeasures(measures) {
  if (!measures || !measures.component || !measures.component.measures) {
    return {};
  }

  const transformed = {};
  measures.component.measures.forEach(measure => {
    transformed[measure.metric] = {
      value: measure.value,
      bestValue: measure.bestValue || false,
    };
  });

  return transformed;
}

/**
 * Get summary statistics from SonarQube results
 */
function getSonarSummary(results) {
  if (!results || !results.measures) {
    return null;
  }

  const measures = transformSonarMeasures(results.measures);
  
  return {
    bugs: parseInt(measures.bugs?.value || '0'),
    vulnerabilities: parseInt(measures.vulnerabilities?.value || '0'),
    codeSmells: parseInt(measures.code_smells?.value || '0'),
    securityHotspots: parseInt(measures.security_hotspots?.value || '0'),
    coverage: parseFloat(measures.coverage?.value || '0'),
    duplicatedLines: parseFloat(measures.duplicated_lines_density?.value || '0'),
    linesOfCode: parseInt(measures.ncloc?.value || '0'),
    complexity: parseInt(measures.complexity?.value || '0'),
    totalIssues: (results.issues?.total || 0),
  };
}

module.exports = {
  scanRepositoryWithSonar,
  transformSonarMeasures,
  getSonarSummary,
  SONAR_CONFIG,
};
