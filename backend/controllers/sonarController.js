const { Scan, ScanResult } = require('../models');
const { scanRepositoryWithSonar, getSonarSummary } = require('../src/sonarService');
const { v4: uuidv4 } = require('uuid');

/**
 * Map SonarQube severity to our severity levels
 */
function mapSonarSeverity(sonarSeverity) {
  const severityMap = {
    'BLOCKER': 'HIGH',
    'CRITICAL': 'HIGH',
    'MAJOR': 'MEDIUM',
    'MINOR': 'LOW',
    'INFO': 'LOW',
  };
  return severityMap[sonarSeverity] || 'MEDIUM';
}

/**
 * Create a new deep scan with SonarQube
 */
const createDeepScan = async (req, res) => {
  try {
    const { repository_url } = req.body;

    if (!repository_url) {
      return res.status(400).json({
        success: false,
        message: 'Repository URL is required',
      });
    }

    // Extract repository info from URL
    const urlParts = repository_url.replace('https://github.com/', '').split('/');
    if (urlParts.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub repository URL',
      });
    }

    const repository_owner = urlParts[0];
    const repository_name = urlParts[1];

    // Create scan record
    const scan = await Scan.create({
      repository_url,
      repository_name,
      repository_owner,
      scan_type: 'DEEP',
      scan_status: 'RUNNING',
      rules_used: [],
    });

    // Start SonarQube scanning process immediately (no setTimeout)
    console.log(`Starting SonarQube deep scan for: ${repository_url}`);
    
    try {
      // Run SonarQube scan
      const sonarResults = await scanRepositoryWithSonar(repository_url);
      console.log('SonarQube scan completed successfully');
      
      // Convert SonarQube issues to our format
      const sonarIssues = sonarResults.issues?.issues || [];
      const convertedIssues = sonarIssues.map(issue => ({
        id: uuidv4(),
        rule_id: issue.rule || 'SONAR_RULE',
        rule_name: issue.message || 'SonarQube Issue',
        issue_type: issue.type || 'CODE_SMELL',
        severity: mapSonarSeverity(issue.severity),
        category: 'SonarQube',
        file_path: issue.component?.replace(/^.*:/, '') || 'Unknown',
        line_number: issue.line || null,
        description: issue.message || 'Issue detected by SonarQube',
        fix_suggestion: `Fix this ${issue.type} issue. Rule: ${issue.rule}`,
        code_snippet: null,
      }));
      
      // Save scan results
      const results = await Promise.all(
        convertedIssues.map(issue => 
          ScanResult.create({
            scan_id: scan.id,
            rule_id: issue.rule_id,
            rule_name: issue.rule_name,
            issue_type: issue.issue_type,
            severity: issue.severity,
            category: issue.category,
            file_path: issue.file_path,
            line_number: issue.line_number,
            description: issue.description,
            fix_suggestion: issue.fix_suggestion,
            code_snippet: issue.code_snippet,
          })
        )
      );

      // Calculate severity counts
      const severityCounts = results.reduce((acc, result) => {
        acc[`${result.severity.toLowerCase()}_severity_count`]++;
        return acc;
      }, {
        high_severity_count: 0,
        medium_severity_count: 0,
        low_severity_count: 0,
      });

      // Get SonarQube summary
      const sonarSummary = getSonarSummary(sonarResults);

      // Update scan with results
      await scan.update({
        scan_status: 'COMPLETED',
        scan_completed_at: new Date(),
        scan_duration: Math.floor((new Date() - scan.scan_started_at) / 1000),
        total_files_scanned: sonarSummary?.linesOfCode || 0,
        total_issues_found: results.length,
        sonar_project_key: sonarResults.projectKey,
        sonar_measures: sonarResults.measures,
        sonar_issues: sonarResults.issues,
        ...severityCounts,
      });

      res.status(201).json({
        success: true,
        message: 'Deep scan completed successfully',
        data: {
          ...scan.toJSON(),
          totalIssues: results.length,
          sonarSummary,
        },
      });

    } catch (scanError) {
      console.error('SonarQube scanning error:', scanError);
      await scan.update({
        scan_status: 'FAILED',
        scan_completed_at: new Date(),
      });

      return res.status(500).json({
        success: false,
        message: 'Deep scan failed',
        error: scanError.message,
      });
    }

  } catch (error) {
    console.error('Create deep scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get SonarQube project details
 */
const getSonarProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const scan = await Scan.findByPk(id);
    
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found',
      });
    }

    if (scan.scan_type !== 'DEEP') {
      return res.status(400).json({
        success: false,
        message: 'This is not a deep scan',
      });
    }

    const sonarSummary = getSonarSummary({
      measures: scan.sonar_measures,
      issues: scan.sonar_issues,
    });

    res.json({
      success: true,
      data: {
        scan_id: scan.id,
        project_key: scan.sonar_project_key,
        summary: sonarSummary,
        measures: scan.sonar_measures,
        issues_summary: scan.sonar_issues,
      },
    });

  } catch (error) {
    console.error('Get SonarQube project details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  createDeepScan,
  getSonarProjectDetails,
};
