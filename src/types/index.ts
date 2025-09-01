// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  company?: string;
  phone?: string;
  address?: string;
  timezone?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  billing: boolean;
  maintenance: boolean;
  security: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  loading: boolean;
}

// Linode Types
export interface LinodeInstance {
  id: number;
  label: string;
  status: 'running' | 'offline' | 'booting' | 'rebooting' | 'shutting_down' | 'provisioning';
  type: string;
  region: string;
  image: string;
  ipv4: string[];
  ipv6?: string;
  specs: {
    disk: number;
    memory: number;
    vcpus: number;
    transfer: number;
  };
  created: string;
  updated: string;
  hypervisor: string;
  backups: {
    enabled: boolean;
    schedule?: {
      day: string;
      window: string;
    };
  };
  tags: string[];
}

export interface LinodeType {
  id: string;
  label: string;
  disk: number;
  memory: number;
  vcpus: number;
  network_out: number;
  price: {
    hourly: number;
    monthly: number;
  };
  addons: {
    backups: {
      price: {
        hourly: number;
        monthly: number;
      };
    };
  };
  type_class: string;
}

export interface LinodeRegion {
  id: string;
  label: string;
  country: string;
  capabilities: string[];
  status: string;
  resolvers: {
    ipv4: string;
    ipv6: string;
  };
}

export interface LinodeImage {
  id: string;
  label: string;
  description: string;
  created: string;
  size: number;
  is_public: boolean;
  type: string;
  status: string;
  vendor: string;
}

export interface LinodeVolume {
  id: number;
  label: string;
  status: string;
  size: number;
  region: string;
  linode_id?: number;
  linode_label?: string;
  filesystem_path: string;
  created: string;
  updated: string;
  tags: string[];
}

export interface LinodeBackup {
  id: number;
  label?: string;
  status: string;
  type: 'auto' | 'snapshot';
  region: string;
  created: string;
  updated: string;
  finished: string;
  configs: string[];
  disks: Array<{
    label: string;
    size: number;
    filesystem: string;
  }>;
}

export interface NodeBalancer {
  id: number;
  label: string;
  hostname: string;
  client_conn_throttle: number;
  region: string;
  ipv4: string;
  ipv6?: string;
  created: string;
  updated: string;
  transfer: {
    in: number;
    out: number;
    total: number;
  };
  tags: string[];
}

// Paystack Types
export interface PaystackCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone?: string;
  metadata?: Record<string, any>;
  risk_action: string;
  international_format_phone?: string;
}

export interface PaystackTransaction {
  id: number;
  domain: string;
  status: 'failed' | 'success' | 'abandoned';
  reference: string;
  amount: number;
  message?: string;
  gateway_response: string;
  paid_at?: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata?: Record<string, any>;
  fees?: number;
  fees_split?: any;
  customer: PaystackCustomer;
  authorization?: PaystackAuthorization;
  plan?: PaystackPlan;
}

export interface PaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name?: string;
}

export interface PaystackPlan {
  id: number;
  name: string;
  plan_code: string;
  description?: string;
  amount: number;
  interval: string;
  send_invoices: boolean;
  send_sms: boolean;
  currency: string;
  migrate?: boolean;
  is_deleted: boolean;
  is_archived: boolean;
}

export interface PaystackInvoice {
  id: number;
  domain: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: string;
  paid: boolean;
  paid_at?: string;
  description?: string;
  authorization?: PaystackAuthorization;
  subscription?: {
    id: number;
    subscription_code: string;
  };
  customer: PaystackCustomer;
  created_at: string;
}

// Dashboard Types
export interface DashboardStats {
  totalInstances: number;
  runningInstances: number;
  totalStorage: number;
  monthlySpend: number;
  currentMonthUsage: number;
  previousMonthUsage: number;
  uptime: number;
  alerts: number;
}

export interface UsageMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  network_in: number;
  network_out: number;
  disk_io: number;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  action: string;
  resource: string;
  user: string;
  status: 'success' | 'failed' | 'pending';
  details?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resource?: string;
  acknowledged: boolean;
}

// Billing Types
export interface BillingOverview {
  currentBalance: number;
  monthToDateSpend: number;
  projectedMonthlySpend: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  nextBillingDate: string;
  paymentMethods: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  exp_month?: string;
  exp_year?: string;
  is_default: boolean;
  authorization_code?: string;
}

export interface CostBreakdown {
  service: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pages: number;
  results: number;
}

// Form Types
export interface CreateInstanceForm {
  label: string;
  type: string;
  region: string;
  image: string;
  root_pass: string;
  authorized_keys?: string[];
  backups_enabled: boolean;
  private_ip: boolean;
  tags?: string[];
}

export interface CreateVolumeForm {
  label: string;
  size: number;
  region: string;
  linode_id?: number;
  config_id?: number;
  tags?: string[];
}

// Error Types
export interface ApiError {
  field?: string;
  reason: string;
}

export interface LinodeError {
  errors: ApiError[];
}

// Monitoring Types
export interface MonitoringAlert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  notifications: string[];
  resource: string;
  metric: string;
}

export interface SystemMetrics {
  cpu: {
    current: number;
    average: number;
    max: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    in: number;
    out: number;
  };
}

// Configuration Types
export interface AppConfig {
  features: {
    billing: boolean;
    monitoring: boolean;
    backups: boolean;
    networking: boolean;
  };
  limits: {
    maxInstances: number;
    maxVolumes: number;
    maxNodeBalancers: number;
  };
  pricing: {
    currency: string;
    taxRate: number;
  };
}