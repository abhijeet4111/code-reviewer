import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { repositories } from '../data/mockScans';

// Convert dates to ISO strings for serialization
const serializeRepo = (repo) => ({
  ...repo,
  lastScan: repo.lastScan instanceof Date ? repo.lastScan.toISOString() : repo.lastScan,
});

// Create a mutable copy of repositories for our mock database
let mockDatabase = [...repositories.map(serializeRepo)];

// Generate mock issues based on severity counts
const generateMockIssues = (highCount, mediumCount, lowCount) => {
  const issues = [];
  
  // Add high severity issues
  for (let i = 0; i < highCount; i++) {
    issues.push({
      id: Date.now() + i,
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
      id: Date.now() + highCount + i,
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
      id: Date.now() + highCount + mediumCount + i,
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
        return { data: mockDatabase };
      },
      providesTags: ['Scans'],
    }),

    getScanById: builder.query({
      queryFn: (id) => {
        const scan = mockDatabase.find(repo => repo.id === parseInt(id));
        return scan ? { data: scan } : { error: 'Scan not found' };
      },
      providesTags: (result, error, id) => [{ type: 'Scans', id }],
    }),

    createScan: builder.mutation({
      queryFn: (scanData) => {
        try {
          // Generate issues based on severity counts
          const issues = generateMockIssues(
            scanData.highSeverityCount,
            scanData.mediumSeverityCount,
            scanData.lowSeverityCount
          );

          const newScan = {
            id: Date.now(),
            name: scanData.name,
            url: scanData.url,
            lastScan: new Date().toISOString(),
            issues: issues,
            resolved: 0,
            pending: issues.length
          };

          // Create new array with the new scan at the start
          mockDatabase = [newScan, ...mockDatabase];
          
          return { 
            data: {
              ...newScan,
              totalIssues: issues.length
            }
          };
        } catch (error) {
          console.error('Scan creation error:', error);
          return { 
            error: {
              message: 'Failed to create scan',
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