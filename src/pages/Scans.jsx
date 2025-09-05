import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "../components/shadcn/Card";
import { Button } from "../components/shadcn/Button";
import { Input } from "../components/shadcn/Input";
import { Shield, Plus, Save, AlertTriangle, GitBranch } from 'lucide-react';
import { useCreateScanMutation } from '../store/scanApi';
import { useNotifications } from '../components/notifications/NotificationProvider';

const Scans = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [createScan] = useCreateScanMutation();
  const { addNotification } = useNotifications();

  const validateUrl = (url) => {
    try {
      new URL(url);
      return url.includes('github.com');
    } catch {
      return false;
    }
  };

  const handleScan = async (event) => {
    event.preventDefault();
    
    if (!url) {
      addNotification({
        title: 'Validation Error',
        message: 'Please enter a repository URL',
      });
      return;
    }

    if (!validateUrl(url)) {
      addNotification({
        title: 'Invalid URL',
        message: 'Please enter a valid GitHub repository URL',
      });
      return;
    }

    setScanning(true);
    try {
      const scanData = {
        name: url.split('/').pop(),
        url: url
      };

      const result = await createScan(scanData).unwrap();
      
      if (!result) {
        throw new Error('Invalid scan result');
      }

      addNotification({
        title: 'Scan Complete',
        message: `Found ${result.totalIssues} security issues in ${result.name}`,
      });
      
      // Short delay before navigation for better UX
      setTimeout(() => {
        navigate('/reports');
      }, 1000);
    } catch (error) {
      console.error('Scan error:', error);
      addNotification({
        title: 'Scan Failed',
        message: error.message || 'Failed to complete the security scan. Please try again.',
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Repository Security Scanner</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Scan your GitHub repository for security vulnerabilities, code quality issues, and best practice violations.
          </p>
        </div>

        {/* Scan Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleScan} className="space-y-6">
              <div className="relative">
                <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter GitHub repository URL (e.g., https://github.com/user/repo)"
                  className="pl-10"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={scanning || !url}
              >
                {scanning ? (
                  <>
                    <Shield className="mr-2 h-5 w-5 animate-pulse" />
                    Scanning Repository...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Start Security Scan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>What We Scan For</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Security Vulnerabilities</h3>
                    <p className="text-sm text-gray-500">Detection of common security issues and vulnerabilities</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Code Quality</h3>
                    <p className="text-sm text-gray-500">Analysis of code quality and best practices</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Plus className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Custom Rules</h3>
                    <p className="text-sm text-gray-500">Support for custom security rules and patterns</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Enter Repository URL</h3>
                    <p className="text-sm text-gray-500">Paste your GitHub repository URL above</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Automated Scan</h3>
                    <p className="text-sm text-gray-500">Our system analyzes your code for issues</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Review Results</h3>
                    <p className="text-sm text-gray-500">Get detailed reports with fix suggestions</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Scans;