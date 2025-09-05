import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "../components/shadcn/Card";
import { Input } from "../components/shadcn/Input";
import { Button } from "../components/shadcn/Button";
import { ExternalLink, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useGetAllScansQuery } from '../store/scanApi';
import { format, parseISO } from 'date-fns';

const Reports = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: scans = [], isLoading, error } = useGetAllScansQuery();
  const [selectedRepo, setSelectedRepo] = useState(null);

  const filteredRepos = scans.filter(repo => 
    repo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const severityColors = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800'
  };

  const statusColors = {
    PENDING: 'bg-orange-100 text-orange-800',
    RESOLVED: 'bg-green-100 text-green-800'
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading scan reports...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading reports: {error.message || 'Something went wrong'}</span>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Security Scan Reports</h1>
        <Input
          type="search"
          placeholder="Search repositories..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repository List */}
        <Card>
          <CardHeader>
            <CardTitle>Scanned Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRepos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {scans.length === 0 ? (
                    <div>
                      <p>No scan reports found.</p>
                      <Button 
                        onClick={() => navigate('/scans')} 
                        className="mt-2"
                        variant="outline"
                      >
                        Start Your First Scan
                      </Button>
                    </div>
                  ) : (
                    <p>No repositories match your search.</p>
                  )}
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-4 rounded-lg border transition-colors hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedRepo(repo)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{repo.name}</h3>
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            repo.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            repo.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                            repo.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {repo.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{repo.url}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Last Scan: {repo.lastScan ? format(parseISO(repo.lastScan), 'MMM dd, yyyy HH:mm') : 'Never'}
                          </span>
                          <span className="text-sm font-medium">
                            {repo.totalIssues || 0} issues found
                          </span>
                          {repo.duration && (
                            <span className="text-sm text-gray-500">
                              ({repo.duration}s)
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/reports/${repo.id}`);
                        }}
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Issue Details */}
        {selectedRepo && (
          <Card>
            <CardHeader>
              <CardTitle>Scan Results: {selectedRepo.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">High Severity</p>
                    <p className="text-xl font-bold text-red-600">
                      {selectedRepo.highCount || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Medium Severity</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {selectedRepo.mediumCount || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Low Severity</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedRepo.lowCount || 0}
                    </p>
                  </div>
                </div>

                {/* Issues List */}
                <div className="space-y-4">
                  {selectedRepo.issues && selectedRepo.issues.length > 0 ? (
                    selectedRepo.issues.map((issue) => (
                      <div key={issue.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{issue.rule_name || issue.issue_type}</h4>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[issue.severity]}`}>
                              {issue.severity}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status] || 'bg-gray-100 text-gray-800'}`}>
                              {issue.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{issue.description}</p>
                        <div className="text-sm">
                          <p><span className="font-medium">Location:</span> {issue.file_path}{issue.line_number ? `:${issue.line_number}` : ''}</p>
                          <p><span className="font-medium">Suggested Fix:</span> {issue.fix_suggestion || 'No fix suggestion available'}</p>
                          {issue.code_snippet && (
                            <div className="mt-2">
                              <p className="font-medium">Code Snippet:</p>
                              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                                {issue.code_snippet}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No detailed issues available for this scan.</p>
                      {selectedRepo.status === 'RUNNING' && (
                        <p className="mt-2">Scan is still in progress. Please check back later.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
