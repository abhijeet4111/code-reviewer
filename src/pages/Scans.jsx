import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "../components/shadcn/Card";
import { Button } from "../components/shadcn/Button";
import { Input } from "../components/shadcn/Input";
import { Shield, Plus, Save, AlertTriangle, GitBranch, Zap } from 'lucide-react';
import { useCreateScanMutation, useCreateDeepScanMutation } from '../store/scanApi';
import { useNotifications } from '../components/notifications/NotificationProvider';

const Scans = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [deepScanning, setDeepScanning] = useState(false);
  const [createScan] = useCreateScanMutation();
  const [createDeepScan] = useCreateDeepScanMutation();
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
        url: url.trim(),
        rules: [] // Use all active rules by default
      };

      const result = await createScan(scanData).unwrap();
      
      if (!result) {
        throw new Error('Failed to initiate scan');
      }

      addNotification({
        title: 'Scan Started',
        message: `Security scan initiated for ${result.name}. You'll be redirected to view the results.`,
      });
      
      // Short delay before navigation for better UX
      setTimeout(() => {
        navigate('/reports');
      }, 1500);
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

  const handleDeepScan = async (event) => {
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

    setDeepScanning(true);
    try {
      const scanData = {
        url: url.trim(),
      };

      addNotification({
        title: 'Deep Scan Started',
        message: 'SonarQube deep scan initiated. This may take several minutes...',
      });

      const result = await createDeepScan(scanData).unwrap();
      
      if (!result) {
        throw new Error('Failed to initiate deep scan');
      }

      addNotification({
        title: 'Deep Scan Complete',
        message: `SonarQube deep scan completed for ${result.name}. Found ${result.totalIssues} issues.`,
      });
      
      // Navigate to reports after successful scan
      setTimeout(() => {
        navigate('/reports');
      }, 1500);
    } catch (error) {
      console.error('Deep scan error:', error);
      addNotification({
        title: 'Deep Scan Failed',
        message: error.message || 'Failed to complete the SonarQube deep scan. Please ensure SonarQube is running and try again.',
      });
    } finally {
      setDeepScanning(false);
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
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  disabled={scanning || deepScanning || !url}
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
                
                <Button
                  type="button"
                  onClick={handleDeepScan}
                  className="flex-1"
                  size="lg"
                  variant="outline"
                  disabled={scanning || deepScanning || !url}
                >
                  {deepScanning ? (
                    <>
                      <Zap className="mr-2 h-5 w-5 animate-pulse" />
                      Deep Scanning...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Deep Scan (SonarQube)
                    </>
                  )}
                </Button>
              </div>
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
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium">SonarQube Deep Scan</h3>
                    <p className="text-sm text-gray-500">Comprehensive analysis with industry-standard SonarQube engine</p>
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