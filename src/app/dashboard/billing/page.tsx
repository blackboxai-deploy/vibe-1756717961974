"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface BillingData {
  currentBalance: number;
  monthToDateSpend: number;
  projectedMonthlySpend: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  nextBillingDate: string;
  paymentMethods: Array<{
    id: string;
    type: 'card' | 'bank_account';
    last4: string;
    brand?: string;
    exp_month?: string;
    exp_year?: string;
    is_default: boolean;
  }>;
}

interface CostBreakdown {
  service: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/paystack/billing', {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setBillingData(data.data);
        
        // Generate cost breakdown
        setCostBreakdown([
          { service: 'Compute Instances', amount: 89.50, percentage: 70, trend: 'up' },
          { service: 'Block Storage', amount: 25.30, percentage: 20, trend: 'stable' },
          { service: 'Load Balancers', amount: 10.00, percentage: 8, trend: 'stable' },
          { service: 'Backups', amount: 2.70, percentage: 2, trend: 'down' }
        ]);
        
        if (data.demo) {
          setError('Demo billing data shown (Paystack not configured)');
        }
      } else {
        throw new Error(data.error || 'Failed to fetch billing data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fallback demo data
      setBillingData({
        currentBalance: 0,
        monthToDateSpend: 127.50,
        projectedMonthlySpend: 145.00,
        lastPaymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastPaymentAmount: 98.20,
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethods: []
      });
      
      setCostBreakdown([
        { service: 'Compute Instances', amount: 89.50, percentage: 70, trend: 'up' },
        { service: 'Block Storage', amount: 25.30, percentage: 20, trend: 'stable' },
        { service: 'Load Balancers', amount: 10.00, percentage: 8, trend: 'stable' },
        { service: 'Backups', amount: 2.70, percentage: 2, trend: 'down' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-green-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Usage</h1>
          <p className="text-gray-600 mt-1">
            Monitor your spending and manage payment methods
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" asChild>
            <Link href="/dashboard/billing/invoices">View Invoices</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/billing/payment-methods">Payment Methods</Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <span className="text-yellow-600">⚠️</span>
          <AlertDescription className="text-yellow-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Billing Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month to Date</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData?.monthToDateSpend.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Projected: ${billingData?.projectedMonthlySpend.toFixed(2)}
            </p>
            <Progress 
              value={(billingData?.monthToDateSpend || 0) / (billingData?.projectedMonthlySpend || 1) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <span className="text-2xl">💳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData?.lastPaymentAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {billingData?.lastPaymentDate ? new Date(billingData.lastPaymentDate).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <span className="text-2xl">🏦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData?.currentBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Available credit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Month Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Current Month Usage</CardTitle>
                <CardDescription>
                  Your resource consumption this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costBreakdown.map((item) => (
                    <div key={item.service} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={getTrendColor(item.trend)}>
                          {getTrendIcon(item.trend)}
                        </span>
                        <span className="font-medium">{item.service}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your billing payment options
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingData?.paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💳</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                    <p className="text-gray-600 mb-4">Add a payment method to enable automatic billing</p>
                    <Button asChild>
                      <Link href="/dashboard/billing/payment-methods/new">
                        Add Payment Method
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {billingData?.paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-sm">💳</span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {method.brand?.toUpperCase()} •••• {method.last4}
                            </div>
                            <div className="text-xs text-gray-500">
                              Expires {method.exp_month}/{method.exp_year}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.is_default && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/billing/payment-methods/new">
                        Add Another Method
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Cost Breakdown</CardTitle>
              <CardDescription>
                Service-by-service cost analysis for this billing period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {costBreakdown.map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={getTrendColor(item.trend)}>
                          {getTrendIcon(item.trend)}
                        </span>
                        <h4 className="font-medium">{item.service}</h4>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${item.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">{item.percentage}% of total</div>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                    <p className="text-xs text-gray-600 mt-2">
                      {item.trend === 'up' && 'Increased from last month'}
                      {item.trend === 'down' && 'Decreased from last month'}
                      {item.trend === 'stable' && 'Similar to last month'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View your recent payments and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
                <p className="text-gray-600 mb-4">
                  Your payment history will appear here once you start using services
                </p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/billing/invoices">
                    View Invoices
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>
                Configure your billing preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive billing alerts and invoice notifications</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Spending Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified when you reach spending thresholds</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Set Limits
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-reload</h4>
                    <p className="text-sm text-gray-600">Automatically add credit when balance is low</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}