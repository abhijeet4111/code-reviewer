const { Scan, ScanResult, Rule } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Mock scanner function (you can replace this with actual GitHub API integration)
const mockScanner = require('../src/mockScanner');

/**
 * Create a new scan
 */
const createScan = async (req, res) => {
  try {
    const { repository_url, rules_to_use = [] } = req.body;

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
      scan_status: 'RUNNING',
      rules_used: rules_to_use,
    });

    // Start scanning process (simulate with setTimeout)
    setTimeout(async () => {
      try {
        // Get rules to use for scanning
        const rulesToUse = rules_to_use.length > 0 
          ? await Rule.findAll({ where: { id: { [Op.in]: rules_to_use } } })
          : await Rule.findAll({ where: { is_active: true } });

        // Run mock scanner
        const scanResults = await mockScanner.scanRepository(repository_url, rulesToUse);
        
        // Save scan results
        const results = await Promise.all(
          scanResults.issues.map(issue => 
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

        // Update scan with results
        const severityCounts = results.reduce((acc, result) => {
          acc[`${result.severity.toLowerCase()}_severity_count`]++;
          return acc;
        }, {
          high_severity_count: 0,
          medium_severity_count: 0,
          low_severity_count: 0,
        });

        await scan.update({
          scan_status: 'COMPLETED',
          scan_completed_at: new Date(),
          scan_duration: Math.floor((new Date() - scan.scan_started_at) / 1000),
          total_files_scanned: scanResults.totalFiles,
          total_issues_found: results.length,
          ...severityCounts,
        });

      } catch (error) {
        console.error('Scanning error:', error);
        await scan.update({
          scan_status: 'FAILED',
          scan_completed_at: new Date(),
        });
      }
    }, 2000); // Simulate 2 second scan time

    res.status(201).json({
      success: true,
      message: 'Scan started successfully',
      data: scan,
    });

  } catch (error) {
    console.error('Create scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get all scans
 */
const getAllScans = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, repository } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.scan_status = status;
    if (repository) {
      whereClause[Op.or] = [
        { repository_name: { [Op.iLike]: `%${repository}%` } },
        { repository_owner: { [Op.iLike]: `%${repository}%` } },
      ];
    }

    const { rows: scans, count: total } = await Scan.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['scan_started_at', 'DESC']],
      include: [
        {
          model: ScanResult,
          as: 'results',
          attributes: ['severity', 'status'],
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Get all scans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get scan by ID
 */
const getScanById = async (req, res) => {
  try {
    const { id } = req.params;

    const scan = await Scan.findByPk(id, {
      include: [
        {
          model: ScanResult,
          as: 'results',
          order: [['severity', 'DESC'], ['createdAt', 'DESC']],
        },
      ],
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found',
      });
    }

    res.json({
      success: true,
      data: scan,
    });

  } catch (error) {
    console.error('Get scan by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Delete scan
 */
const deleteScan = async (req, res) => {
  try {
    const { id } = req.params;

    const scan = await Scan.findByPk(id);
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found',
      });
    }

    await scan.destroy();

    res.json({
      success: true,
      message: 'Scan deleted successfully',
    });

  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get scan statistics
 */
const getScanStatistics = async (req, res) => {
  try {
    const totalScans = await Scan.count();
    const completedScans = await Scan.count({ where: { scan_status: 'COMPLETED' } });
    const failedScans = await Scan.count({ where: { scan_status: 'FAILED' } });
    const runningScans = await Scan.count({ where: { scan_status: 'RUNNING' } });
    
    const totalIssues = await ScanResult.count();
    const highSeverityIssues = await ScanResult.count({ where: { severity: 'HIGH' } });
    const mediumSeverityIssues = await ScanResult.count({ where: { severity: 'MEDIUM' } });
    const lowSeverityIssues = await ScanResult.count({ where: { severity: 'LOW' } });

    res.json({
      success: true,
      data: {
        scans: {
          total: totalScans,
          completed: completedScans,
          failed: failedScans,
          running: runningScans,
        },
        issues: {
          total: totalIssues,
          high: highSeverityIssues,
          medium: mediumSeverityIssues,
          low: lowSeverityIssues,
        },
      },
    });

  } catch (error) {
    console.error('Get scan statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  createScan,
  getAllScans,
  getScanById,
  deleteScan,
  getScanStatistics,
};
