"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';

interface DashboardStats {
  instances: {
    total: number;
    running: number;
    offline: number;
  };
  storage: {
    total: number;
    used: number;
  };
  billing: {
    currentMonth: number;
    lastMonth: number;
    projectedMonth: number;
  };
  alerts: number;
}

interface RecentActivity {
  id: string;
  action: string;
  resource: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'pending';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    instances: { total: 0, running: 0, offline: 0 },
    storage: { total: 0, used: 0 },
    billing: { currentMonth: 0, lastMonth: 0, projectedMonth: 0 },
    alerts: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const timer = setTimeout(() => {
      setStats({
        instances: { total: 5, running: 4, offline: 1 },
        storage: { total: 500, used: 125 },
        billing: { currentMonth: 127.50, lastMonth: 98.20, projectedMonth: 145.00 },
        alerts: 2
      });
      
      setActivities([
        {
          id: '1',
          action: 'Instance created',
          resource: 'web-server-01',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          status: 'success'
        },
        {
          id: '2',
          action: 'Backup completed',
          resource: 'database-server',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          status: 'success'
        },
        {
          id: '3',
          action: 'Payment processed',
          resource: 'Monthly invoice',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'success'
        },
        {
          id: '4',
          action: 'Alert triggered',
          resource: 'app-server-02',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          status: 'failed'
        },
      ]);
      
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-200 rounded-lg h-96"></div>
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your cloud infrastructure today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instances</CardTitle>
            <span className="text-2xl">🖥️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.instances.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.instances.running} running, {stats.instances.offline} offline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <span className="text-2xl">💾</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storage.used} GB</div>
            <Progress 
              value={(stats.storage.used / stats.storage.total) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.storage.used} of {stats.storage.total} GB used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.billing.currentMonth}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.billing.projectedMonth} projected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <span className="text-2xl">🚨</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.alerts}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.alerts > 0 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <span className="text-orange-600">⚠️</span>
          <AlertDescription className="text-orange-800">
            You have {stats.alerts} active alerts that require attention.{' '}
            <Link href="/dashboard/monitoring/alerts" className="font-medium underline">
              View alerts
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Resource Overview</CardTitle>
              <CardDescription>
                Quick actions and status for your cloud resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="compute" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="compute">Compute</TabsTrigger>
                  <TabsTrigger value="storage">Storage</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                </TabsList>
                
                <TabsContent value="compute" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Running Instances</span>
                        <span className="text-sm font-medium">{stats.instances.running}</span>
                      </div>
                      <Progress value={(stats.instances.running / stats.instances.total) * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Offline Instances</span>
                        <span className="text-sm font-medium">{stats.instances.offline}</span>
                      </div>
                      <Progress value={(stats.instances.offline / stats.instances.total) * 100} />
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button asChild size="sm">
                      <Link href="/dashboard/compute/instances">Manage Instances</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/compute/instances/new">Create Instance</Link>
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="storage" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Storage Utilization</span>
                      <span className="text-sm font-medium">
                        {Math.round((stats.storage.used / stats.storage.total) * 100)}%
                      </span>
                    </div>
                    <Progress value={(stats.storage.used / stats.storage.total) * 100} />
                    <p className="text-xs text-gray-600">
                      {stats.storage.used} GB of {stats.storage.total} GB used
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button asChild size="sm">
                      <Link href="/dashboard/storage/volumes">Manage Volumes</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/storage/backups">View Backups</Link>
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="network" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">2</div>
                      <div className="text-sm text-gray-600">Load Balancers</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-sm text-gray-600">Domains</div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button asChild size="sm">
                      <Link href="/dashboard/networking">Network Settings</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/networking/domains">Manage Domains</Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest events and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status === 'success' && '✓'}
                      {activity.status === 'failed' && '✗'}
                      {activity.status === 'pending' && '•'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.resource}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/activity">View All Activity</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link href="/dashboard/compute/instances/new">
                <span className="text-2xl">🖥️</span>
                <span className="text-sm">Create Instance</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link href="/dashboard/storage/volumes/new">
                <span className="text-2xl">💾</span>
                <span className="text-sm">Add Storage</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link href="/dashboard/billing">
                <span className="text-2xl">💳</span>
                <span className="text-sm">View Billing</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link href="/dashboard/support/tickets/new">
                <span className="text-2xl">🎧</span>
                <span className="text-sm">Get Support</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}