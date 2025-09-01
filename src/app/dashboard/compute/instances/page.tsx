"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface Instance {
  id: number;
  label: string;
  status: 'running' | 'offline' | 'booting' | 'rebooting' | 'shutting_down';
  type: string;
  region: string;
  ipv4: string[];
  created: string;
  specs: {
    vcpus: number;
    memory: number;
    disk: number;
  };
}

export default function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/linode/instances', {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInstances(data.data?.data || []);
        } else {
          // Show demo data if API fails
          setInstances([
            {
              id: 1,
              label: 'web-server-01',
              status: 'running',
              type: 'g6-standard-2',
              region: 'us-east',
              ipv4: ['192.168.1.100'],
              created: new Date().toISOString(),
              specs: { vcpus: 2, memory: 4096, disk: 80 }
            },
            {
              id: 2,
              label: 'database-server',
              status: 'running',
              type: 'g6-standard-4',
              region: 'us-west',
              ipv4: ['192.168.1.101'],
              created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              specs: { vcpus: 4, memory: 8192, disk: 160 }
            },
            {
              id: 3,
              label: 'app-server-02',
              status: 'offline',
              type: 'g6-standard-1',
              region: 'us-east',
              ipv4: ['192.168.1.102'],
              created: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
              specs: { vcpus: 1, memory: 2048, disk: 50 }
            }
          ]);
          setError('Demo data shown (Linode API not configured)');
        }
      } else {
        throw new Error('Failed to fetch instances');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Show demo data on error
      setInstances([
        {
          id: 1,
          label: 'demo-server-01',
          status: 'running',
          type: 'g6-standard-2',
          region: 'us-east',
          ipv4: ['192.168.1.100'],
          created: new Date().toISOString(),
          specs: { vcpus: 2, memory: 4096, disk: 80 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInstanceAction = async (instanceId: number, action: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [instanceId]: action }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update instance status based on action
      setInstances(prev => prev.map(instance => {
        if (instance.id === instanceId) {
          let newStatus = instance.status;
          switch (action) {
            case 'boot':
              newStatus = 'booting';
              break;
            case 'reboot':
              newStatus = 'rebooting';
              break;
            case 'shutdown':
              newStatus = 'shutting_down';
              break;
          }
          return { ...instance, status: newStatus as any };
        }
        return instance;
      }));
      
      // Simulate status change completion
      setTimeout(() => {
        setInstances(prev => prev.map(instance => {
          if (instance.id === instanceId) {
            let newStatus = instance.status;
            switch (action) {
              case 'boot':
              case 'reboot':
                newStatus = 'running';
                break;
              case 'shutdown':
                newStatus = 'offline';
                break;
            }
            return { ...instance, status: newStatus as any };
          }
          return instance;
        }));
      }, 3000);
      
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [instanceId]: '' }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      running: { color: 'bg-green-100 text-green-800', text: 'Running', icon: '🟢' },
      offline: { color: 'bg-gray-100 text-gray-800', text: 'Offline', icon: '⚫' },
      booting: { color: 'bg-blue-100 text-blue-800', text: 'Booting', icon: '🔵' },
      rebooting: { color: 'bg-yellow-100 text-yellow-800', text: 'Rebooting', icon: '🟡' },
      shutting_down: { color: 'bg-orange-100 text-orange-800', text: 'Shutting Down', icon: '🟠' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.offline;
    
    return (
      <Badge className={`${config.color} font-medium`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </Badge>
    );
  };

  const filteredInstances = instances.filter(instance =>
    instance.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instance.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instance.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compute Instances</h1>
          <p className="text-gray-600 mt-1">
            Manage your Linode compute instances
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/compute/instances/new">
            Create Instance
          </Link>
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <span className="text-yellow-600">⚠️</span>
          <AlertDescription className="text-yellow-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Your Instances ({filteredInstances.length})</CardTitle>
              <CardDescription>
                Virtual machines running in your Linode account
              </CardDescription>
            </div>
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search instances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInstances.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🖥️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No instances found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No instances match your search.' : 'Create your first compute instance to get started.'}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/dashboard/compute/instances/new">
                    Create First Instance
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Specs</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstances.map((instance) => (
                    <TableRow key={instance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {instance.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {instance.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(instance.status)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{instance.type}</span>
                      </TableCell>
                      <TableCell>{instance.region}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {instance.ipv4?.[0] || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{instance.specs.vcpus} vCPUs</div>
                          <div>{instance.specs.memory / 1024} GB RAM</div>
                          <div>{instance.specs.disk} GB Disk</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(instance.created).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={!!actionLoading[instance.id]}
                            >
                              {actionLoading[instance.id] ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                                  <span>{actionLoading[instance.id]}...</span>
                                </div>
                              ) : (
                                '⋮'
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/compute/instances/${instance.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {instance.status === 'offline' && (
                              <DropdownMenuItem 
                                onClick={() => handleInstanceAction(instance.id, 'boot')}
                              >
                                Boot Instance
                              </DropdownMenuItem>
                            )}
                            {instance.status === 'running' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleInstanceAction(instance.id, 'reboot')}
                                >
                                  Reboot Instance
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleInstanceAction(instance.id, 'shutdown')}
                                >
                                  Shutdown Instance
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/compute/instances/${instance.id}/console`}>
                                Open Console
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete Instance
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}