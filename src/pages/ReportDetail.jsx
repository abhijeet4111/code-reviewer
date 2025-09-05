import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "../components/shadcn/Card";
import { Button } from "../components/shadcn/Button";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useGetScanByIdQuery } from '../store/scanApi';
import { format } from 'date-fns';

const ReportDetail = () => {
  const { id } = useParams();
  console.log("id",id);
  const navigate = useNavigate();
  const { data: report, isLoading, error } = useGetScanByIdQuery(id);
  console.log("report",report);

  const severityColors = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800'
  };

  const statusColors = {
    PENDING: 'bg-orange-100 text-orange-800',
    RESOLVED: 'bg-green-100 text-green-800'
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
            <p className="text-gray-500 mb-4">The requested scan report could not be found.</p>
            <Button onClick={() => navigate('/reports')}>
              View All Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: 'High Severity',
      value: report.issues.filter(i => i.severity === 'HIGH').length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Medium Severity',
      value: report.issues.filter(i => i.severity === 'MEDIUM').length,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Resolved Issues',
      value: report.issues.filter(i => i.status === 'RESOLVED').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending Issues',
      value: report.issues.filter(i => i.status === 'PENDING').length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <h1 className="text-2xl font-bold">Security Report</h1>
        </div>
        <a
          href={report.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          View Repository
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>

      {/* Repository Info */}
      <Card>
        <CardHeader>
          <CardTitle>Repository Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Repository Name</p>
              <p className="font-medium">{report.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Scan Date</p>
              <p className="font-medium">
                {format(new Date(report.lastScan), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>Security Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.issues.map((issue) => (
              <div key={issue.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{issue.issue}</h3>
                    <p className="text-sm text-gray-500">{issue.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[issue.severity]}`}>
                      {issue.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">
                      <span className="font-medium">Location: </span>
                      {issue.location}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">
                      <span className="font-medium">Suggested Fix: </span>
                      {issue.fix}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDetail;