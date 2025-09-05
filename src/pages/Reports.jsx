import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "../components/shadcn/Card";
import { Input } from "../components/shadcn/Input";
import { Button } from "../components/shadcn/Button";
import { ExternalLink, ArrowRight } from 'lucide-react';
import { useGetAllScansQuery } from '../store/scanApi';
import { format } from 'date-fns';

const Reports = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: scans = [], isLoading } = useGetAllScansQuery();
  const [selectedRepo, setSelectedRepo] = useState(null);

  const filteredRepos = scans.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.url.toLowerCase().includes(searchTerm.toLowerCase())
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
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="p-4 rounded-lg border transition-colors hover:bg-gray-50"
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
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{repo.url}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          Last Scan: {format(new Date(repo.lastScan), 'MMM dd, yyyy')}
                        </span>
                        <span className="text-sm font-medium">
                          {repo.issues.length} issues found
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={() => navigate(`/reports/${repo.id}`)}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{repo.name}</h3>
                      <p className="text-sm text-gray-500">{repo.url}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Last Scan: {format(new Date(repo.lastScan), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm font-medium">
                        {repo.issues.length} issues found
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
                      {selectedRepo.issues.filter(i => i.severity === 'HIGH').length}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Medium Severity</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {selectedRepo.issues.filter(i => i.severity === 'MEDIUM').length}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Resolved</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedRepo.issues.filter(i => i.status === 'RESOLVED').length}
                    </p>
                  </div>
                </div>

                {/* Issues List */}
                <div className="space-y-4">
                  {selectedRepo.issues.map((issue) => (
                    <div key={issue.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{issue.issue}</h4>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[issue.severity]}`}>
                            {issue.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{issue.description}</p>
                      <div className="text-sm">
                        <p><span className="font-medium">Location:</span> {issue.location}</p>
                        <p><span className="font-medium">Suggested Fix:</span> {issue.fix}</p>
                      </div>
                    </div>
                  ))}
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
