"use client";

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: '📊'
  },
  {
    title: 'Compute',
    href: '/dashboard/compute',
    icon: '🖥️',
    children: [
      { title: 'Instances', href: '/dashboard/compute/instances', icon: '⚡' },
      { title: 'SSH Keys', href: '/dashboard/compute/ssh-keys', icon: '🔑' },
      { title: 'Images', href: '/dashboard/compute/images', icon: '💿' },
    ]
  },
  {
    title: 'Storage',
    href: '/dashboard/storage',
    icon: '💾',
    children: [
      { title: 'Volumes', href: '/dashboard/storage/volumes', icon: '📀' },
      { title: 'Backups', href: '/dashboard/storage/backups', icon: '🔄' },
      { title: 'Object Storage', href: '/dashboard/storage/object', icon: '📦' },
    ]
  },
  {
    title: 'Networking',
    href: '/dashboard/networking',
    icon: '🌐',
    children: [
      { title: 'Load Balancers', href: '/dashboard/networking/load-balancers', icon: '⚖️' },
      { title: 'Domains', href: '/dashboard/networking/domains', icon: '🔗' },
      { title: 'Firewalls', href: '/dashboard/networking/firewalls', icon: '🛡️' },
    ]
  },
  {
    title: 'Monitoring',
    href: '/dashboard/monitoring',
    icon: '📈',
    children: [
      { title: 'Metrics', href: '/dashboard/monitoring/metrics', icon: '📊' },
      { title: 'Alerts', href: '/dashboard/monitoring/alerts', icon: '🚨' },
      { title: 'Logs', href: '/dashboard/monitoring/logs', icon: '📄' },
    ]
  },
  {
    title: 'Billing',
    href: '/dashboard/billing',
    icon: '💳',
    badge: 'New',
    children: [
      { title: 'Overview', href: '/dashboard/billing', icon: '💰' },
      { title: 'Invoices', href: '/dashboard/billing/invoices', icon: '🧾' },
      { title: 'Payment Methods', href: '/dashboard/billing/payment-methods', icon: '💳' },
      { title: 'Usage', href: '/dashboard/billing/usage', icon: '📊' },
    ]
  },
  {
    title: 'Support',
    href: '/dashboard/support',
    icon: '🎧',
    children: [
      { title: 'Tickets', href: '/dashboard/support/tickets', icon: '🎫' },
      { title: 'Documentation', href: '/dashboard/support/docs', icon: '📚' },
      { title: 'API Keys', href: '/dashboard/support/api-keys', icon: '🔐' },
    ]
  },
];

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isExpanded = (href: string) => {
    return expandedItems.includes(href) || pathname.startsWith(href);
  };

  return (
    <div className={cn("pb-12 min-h-screen bg-gray-50 border-r border-gray-200", className)}>
      <div className="space-y-4 py-4">
        {/* Header */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">CloudPro</h1>
            <Badge variant="secondary" className="text-xs">v2.0</Badge>
          </div>
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-medium">{user?.name}</span>
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <div className="px-3">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-1">
              {navigation.map((item) => (
                <div key={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-9 text-left font-normal",
                      isActive(item.href) && "bg-blue-50 text-blue-700 font-medium"
                    )}
                    asChild={!item.children}
                    onClick={item.children ? () => toggleExpanded(item.href) : undefined}
                  >
                    {item.children ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="mr-2 text-sm">{item.icon}</span>
                          {item.title}
                          {item.badge && (
                            <Badge variant="outline" className="ml-2 text-xs h-4">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <span className={cn(
                          "transition-transform text-xs",
                          isExpanded(item.href) ? "rotate-90" : ""
                        )}>
                          ▶
                        </span>
                      </div>
                    ) : (
                      <Link href={item.href} className="flex items-center w-full">
                        <span className="mr-2 text-sm">{item.icon}</span>
                        {item.title}
                        {item.badge && (
                          <Badge variant="outline" className="ml-auto text-xs h-4">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )}
                  </Button>

                  {/* Sub-navigation */}
                  {item.children && isExpanded(item.href) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Button
                          key={child.href}
                          variant={isActive(child.href) ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start h-8 font-normal",
                            isActive(child.href) && "bg-blue-50 text-blue-700 font-medium"
                          )}
                          asChild
                        >
                          <Link href={child.href}>
                            <span className="mr-2 text-sm">{child.icon}</span>
                            {child.title}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* User Actions */}
        <div className="px-3 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-9"
            asChild
          >
            <Link href="/dashboard/settings">
              <span className="mr-2">⚙️</span>
              Settings
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={logout}
          >
            <span className="mr-2">🚪</span>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}