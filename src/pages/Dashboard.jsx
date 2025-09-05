import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "../components/shadcn/Card";
import { Button } from "../components/shadcn/Button";
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
import { Shield, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useGetAllScansQuery } from '../store/scanApi';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: scans = [], isLoading } = useGetAllScansQuery();

  const dashboardStats = [
    {
      title: 'Total Scans',
      value: scans.length,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Critical Issues',
      value: scans.reduce((acc, scan) => acc + scan.issues.filter(i => i.severity === 'HIGH').length, 0),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Resolved',
      value: scans.reduce((acc, scan) => acc + scan.issues.filter(i => i.status === 'RESOLVED').length, 0),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending',
      value: scans.reduce((acc, scan) => acc + scan.issues.filter(i => i.status === 'PENDING').length, 0),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => (
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

      {/* Header with New Scan button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Security Overview</h2>
        <Button onClick={() => navigate('/scans')} className="flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          New Scan
        </Button>
      </div>

      {/* Latest Scans */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Latest Repository Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repository</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Scan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">High</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medium</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Low</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/reports/${scan.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <a
                          href={scan.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {scan.name}
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {format(new Date(scan.lastScan), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {scan.issues.filter(i => i.severity === 'HIGH').length}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {scan.issues.filter(i => i.severity === 'MEDIUM').length}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {scan.issues.filter(i => i.severity === 'LOW').length}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        scan.issues.some(i => i.status === 'PENDING')
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {scan.issues.some(i => i.status === 'PENDING')
                          ? `${scan.issues.filter(i => i.status === 'PENDING').length} Pending`
                          : 'Resolved'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>30-Day Scan Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scans}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="lastScan"
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  />
                  <Area
                    type="monotone"
                    dataKey={(scan) => scan.issues.filter(i => i.severity === 'HIGH').length}
                    stackId="1"
                    stroke="#ef4444"
                    fill="#fee2e2"
                    name="High"
                  />
                  <Area
                    type="monotone"
                    dataKey={(scan) => scan.issues.filter(i => i.severity === 'MEDIUM').length}
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#fef3c7"
                    name="Medium"
                  />
                  <Area
                    type="monotone"
                    dataKey={(scan) => scan.issues.filter(i => i.severity === 'LOW').length}
                    stackId="1"
                    stroke="#10b981"
                    fill="#d1fae5"
                    name="Low"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Status */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Resolution Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={scans}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey={(scan) => scan.issues.filter(i => i.status === 'RESOLVED').length}
                    name="Resolved"
                    fill="#10b981"
                  />
                  <Bar
                    dataKey={(scan) => scan.issues.filter(i => i.status === 'PENDING').length}
                    name="Pending"
                    fill="#f59e0b"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;