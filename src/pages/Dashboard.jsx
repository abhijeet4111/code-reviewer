import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../components/shadcn/Card";
import { Button } from "../components/shadcn/Button";
import { Input } from "../components/shadcn/Input";
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import * as Tabs from '@radix-ui/react-tabs';
import { format } from 'date-fns';
import { useNotifications } from '../components/notifications/NotificationProvider';

const mockChartData = Array.from({ length: 7 }, (_, i) => ({
  date: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), 'MMM dd'),
  scans: Math.floor(Math.random() * 50) + 10,
  issues: Math.floor(Math.random() * 30),
})).reverse();

const severityData = [
  { name: 'High', value: 12 },
  { name: 'Medium', value: 24 },
  { name: 'Low', value: 36 },
];

const generateMockScanResults = () => [
  {
    id: Date.now(),
    issue: 'Hardcoded API Key',
    severity: 'HIGH',
    location: 'src/config.js:15',
    description: 'Found hardcoded API key in configuration file',
    fix: 'Move API key to environment variables',
  },
  {
    id: Date.now() + 1,
    issue: 'Insecure Cookie Settings',
    severity: 'MEDIUM',
    location: 'src/auth/session.js:45',
    description: 'Cookie missing secure and httpOnly flags',
    fix: 'Add secure and httpOnly flags to cookie configuration',
  },
  {
    id: Date.now() + 2,
    issue: 'Outdated Dependencies',
    severity: 'LOW',
    location: 'package.json',
    description: 'Several dependencies are outdated and may contain vulnerabilities',
    fix: 'Update dependencies to their latest secure versions',
  },
];

const Dashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');

  const stats = [
    {
      title: 'Total Scans',
      value: results.length || '0',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Critical Issues',
      value: results.filter(r => r.severity === 'HIGH').length || '0',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Resolved',
      value: '0',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending',
      value: results.length || '0',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setUrl('');
    }
  };

  const handleUrlSubmit = (event) => {
    event.preventDefault();
    if (url) {
      startScan();
    }
  };

  const startScan = async () => {
    setScanning(true);
    // Mock scan delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock results
    const newResults = generateMockScanResults();
    setResults(newResults);
    
    addNotification({
      title: 'Scan Complete',
      message: `Found ${newResults.length} security issues. Check the results below.`,
    });
    
    setScanning(false);
    // Switch to overview tab to show results
    setActiveTab('overview');
  };

  const severityColors = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
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

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex space-x-2 border-b mb-6">
          <Tabs.Trigger
            value="overview"
            className={`px-4 py-2 -mb-px ${
              activeTab === 'overview'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500'
            }`}
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="scan"
            className={`px-4 py-2 -mb-px ${
              activeTab === 'scan'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500'
            }`}
          >
            New Scan
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview">
          {/* Results Table */}
          {results.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Security Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.map((result) => (
                        <tr key={result.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium">{result.issue}</div>
                            <div className="text-sm text-gray-500">{result.description}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${severityColors[result.severity]}`}>
                              {result.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">{result.location}</td>
                          <td className="px-6 py-4 text-sm">{result.fix}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Scan Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="scans"
                        stroke="#2563eb"
                        fill="#93c5fd"
                      />
                      <Area
                        type="monotone"
                        dataKey="issues"
                        stroke="#dc2626"
                        fill="#fca5a5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={severityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>

        <Tabs.Content value="scan">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Plugin (ZIP)
                  </label>
                  <Input
                    type="file"
                    accept=".zip"
                    onChange={handleFileUpload}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Or Enter Repository URL
                  </label>
                  <form onSubmit={handleUrlSubmit} className="flex gap-2">
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://github.com/user/repo"
                      className="flex-1"
                    />
                    <Button type="submit" disabled={scanning}>
                      {scanning ? 'Scanning...' : 'Start Scan'}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default Dashboard;