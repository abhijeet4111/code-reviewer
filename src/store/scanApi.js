import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Transform scan data from backend format to frontend format
const transformScanData = (scan) => ({
  id: scan.id,
  name: scan.repository_name,
  url: scan.repository_url,
  lastScan: scan.scan_started_at,
  status: scan.scan_status,
  issues: scan.results || [],
  resolved: scan.results ? scan.results.filter(r => r.status === 'FIXED').length : 0,
  pending: scan.results ? scan.results.filter(r => r.status === 'PENDING').length : 0,
  totalFiles: scan.total_files_scanned,
  totalIssues: scan.total_issues_found,
  highCount: scan.high_severity_count,
  mediumCount: scan.medium_severity_count,
  lowCount: scan.low_severity_count,
  duration: scan.scan_duration,
});

export const scanApi = createApi({
  reducerPath: 'scanApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Scans', 'Rules'],
  endpoints: (builder) => ({
    // Get all scans with pagination and filtering
    getAllScans: builder.query({
      query: ({ page = 1, limit = 50, status, repository } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (status) params.append('status', status);
        if (repository) params.append('repository', repository);
        
        return `scans?${params.toString()}`;
      },
      transformResponse: (response) => {
        if (response.success && response.data?.scans) {
          return response.data.scans.map(transformScanData);
        }
        return [];
      },
      providesTags: ['Scans'],
    }),

    // Get scan by ID with detailed results
    getScanById: builder.query({
      query: (id) => `scans/${id}`,
      transformResponse: (response) => {
        if (response.success && response.data) {
          return transformScanData(response.data);
        }
        throw new Error('Scan not found');
      },
      providesTags: (result, error, id) => [{ type: 'Scans', id }],
    }),

    // Create a new scan
    createScan: builder.mutation({
      query: (scanData) => ({
        url: 'scans',
        method: 'POST',
        body: {
          repository_url: scanData.url,
          rules_to_use: scanData.rules || [], // Optional: specify which rules to use
        },
      }),
      transformResponse: (response) => {
        if (response.success && response.data) {
          return {
            ...transformScanData(response.data),
            totalIssues: response.data.total_issues_found || 0,
          };
        }
        throw new Error(response.message || 'Failed to create scan');
      },
      invalidatesTags: ['Scans'],
    }),

    // Get scan statistics
    getScanStatistics: builder.query({
      query: () => 'scans/statistics',
      transformResponse: (response) => {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      },
    }),

    // Delete scan
    deleteScan: builder.mutation({
      query: (id) => ({
        url: `scans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Scans'],
    }),

    // Rules management endpoints
    getAllRules: builder.query({
      query: ({ category, severity, active } = {}) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (severity) params.append('severity', severity);
        if (active !== undefined) params.append('active', active);
        
        return `rules?${params.toString()}`;
      },
      transformResponse: (response) => {
        if (response.success && response.data?.rules) {
          return response.data.rules;
        }
        return [];
      },
      providesTags: ['Rules'],
    }),
  }),
});

export const {
  useGetAllScansQuery,
  useGetScanByIdQuery,
  useCreateScanMutation,
  useGetScanStatisticsQuery,
  useDeleteScanMutation,
  useGetAllRulesQuery,
} = scanApi;
