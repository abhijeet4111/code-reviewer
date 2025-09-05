import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { repositories } from '../data/mockScans';
import { getSelectedRules } from '../lib/rulesStorage';
import { runRuleScan } from '../lib/scanner';

// Convert dates to ISO strings for serialization
const serializeRepo = (repo) => ({
  ...repo,
  lastScan: repo.lastScan instanceof Date ? repo.lastScan.toISOString() : repo.lastScan,
});

// Initial data with serialized dates
let scannedRepositories = repositories.map(serializeRepo);

// Generate mock issues based on severity counts
const generateMockIssues = (highCount, mediumCount, lowCount) => {
  const issues = [];
  
  // Add high severity issues
  for (let i = 0; i < highCount; i++) {
    issues.push({
      id: `${Date.now()}_HIGH_${i}`,
      issue: 'Critical Security Vulnerability',
      severity: 'HIGH',
      location: 'src/config.js',
      description: 'Found potential security vulnerability in configuration',
      fix: 'Review and update security configuration',
      status: 'PENDING'
    });
  }

  // Add medium severity issues
  for (let i = 0; i < mediumCount; i++) {
    issues.push({
      id: `${Date.now()}_MEDIUM_${i}`,
      issue: 'Code Quality Issue',
      severity: 'MEDIUM',
      location: 'src/utils/helpers.js',
      description: 'Identified potential code quality concerns',
      fix: 'Refactor code following best practices',
      status: 'PENDING'
    });
  }

  // Add low severity issues
  for (let i = 0; i < lowCount; i++) {
    issues.push({
      id: `${Date.now()}_LOW_${i}`,
      issue: 'Minor Improvement Suggested',
      severity: 'LOW',
      location: 'src/components/UI.js',
      description: 'Minor improvements could be made',
      fix: 'Consider implementing suggested changes',
      status: 'PENDING'
    });
  }

  return issues;
};

export const scanApi = createApi({
  reducerPath: 'scanApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Scans'],
  endpoints: (builder) => ({
    getAllScans: builder.query({
      queryFn: () => {
        return { data: scannedRepositories };
      },
      providesTags: ['Scans'],
    }),

    getScanById: builder.query({
      queryFn: (id) => {
        const scan = scannedRepositories.find(repo => repo.id === parseInt(id));
        return scan ? { data: scan } : { error: 'Scan not found' };
      },
      providesTags: (result, error, id) => [{ type: 'Scans', id }],
    }),

    createScan: builder.mutation({
      queryFn: (scanData) => {
        try {
          // Get selected rules
          const rules = getSelectedRules();

          // Build mock files for scanning
          const files = [
            { 
              path: 'src/config.js', 
              content: `export const config = {
                apiKey: "sk-1234567890",
                secret: "my-secret-key",
                endpoint: "http://api.example.com"
              };`
            },
            { 
              path: 'src/components/Form.jsx', 
              content: `const Form = () => {
                return <div dangerouslySetInnerHTML={{__html: content}} />;
              };`
            },
            { 
              path: 'src/api/client.js', 
              content: `fetch('http://insecure-api.com/data', {
                headers: { Authorization: 'Bearer hardcoded-token' }
              });`
            }
          ];

          // Run scan with rules
          const issues = rules.length > 0 
            ? runRuleScan({ files, rules })
            : generateMockIssues(
                Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 2)
              );

          const newScan = {
            id: Date.now(),
            name: scanData.name,
            url: scanData.url,
            lastScan: new Date().toISOString(),
            issues,
            resolved: 0,
            pending: issues.length
          };

          // Update scans array
          scannedRepositories = [newScan, ...scannedRepositories];
          
          return { data: { ...newScan, totalIssues: issues.length } };
        } catch (error) {
          console.error('Scan error:', error);
          return { 
            error: { 
              message: 'Scan failed', 
              details: error.message 
            } 
          };
        }
      },
      invalidatesTags: ['Scans'],
    }),
  }),
});

export const {
  useGetAllScansQuery,
  useGetScanByIdQuery,
  useCreateScanMutation,
} = scanApi;