import axios, { AxiosInstance } from 'axios';
import {
  PaystackCustomer,
  PaystackTransaction,
  PaystackPlan,
  PaystackInvoice,
  ApiResponse,
  BillingOverview,
  PaymentMethod
} from '@/types';

interface PaystackChargeRequest {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  callback_url?: string;
  plan?: string;
  invoice_limit?: number;
  metadata?: Record<string, any>;
  channels?: string[];
}

interface PaystackCustomerRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

class PaystackAPIClient {
  private client: AxiosInstance;
  private secretKey: string;
  public publicKey: string;

  constructor(secretKey?: string, publicKey?: string) {
    this.secretKey = secretKey || (typeof process !== 'undefined' ? process.env.PAYSTACK_SECRET_KEY : '') || '';
    this.publicKey = publicKey || (typeof process !== 'undefined' ? process.env.PAYSTACK_PUBLIC_KEY : '') || '';
    
    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[Paystack API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[Paystack API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('[Paystack API] Response error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          throw new Error('Unauthorized: Please check your Paystack secret key');
        }
        
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded: Please try again later');
        }
        
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        
        throw error;
      }
    );
  }

  // Customer Management
  async createCustomer(customerData: PaystackCustomerRequest): Promise<ApiResponse<PaystackCustomer>> {
    try {
      const response = await this.client.post('/customer', customerData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getCustomer(customerCode: string): Promise<ApiResponse<PaystackCustomer>> {
    try {
      const response = await this.client.get(`/customer/${customerCode}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getCustomers(page = 1, perPage = 50): Promise<ApiResponse<PaystackCustomer[]>> {
    try {
      const response = await this.client.get(`/customer?page=${page}&perPage=${perPage}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async updateCustomer(customerCode: string, customerData: Partial<PaystackCustomerRequest>): Promise<ApiResponse<PaystackCustomer>> {
    try {
      const response = await this.client.put(`/customer/${customerCode}`, customerData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Transaction Management
  async initializeTransaction(chargeData: PaystackChargeRequest): Promise<ApiResponse<{ authorization_url: string; access_code: string; reference: string }>> {
    try {
      // Convert amount to kobo (multiply by 100)
      const data = {
        ...chargeData,
        amount: chargeData.amount * 100
      };
      
      const response = await this.client.post('/transaction/initialize', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async verifyTransaction(reference: string): Promise<ApiResponse<PaystackTransaction>> {
    try {
      const response = await this.client.get(`/transaction/verify/${reference}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getTransaction(id: number): Promise<ApiResponse<PaystackTransaction>> {
    try {
      const response = await this.client.get(`/transaction/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getTransactions(page = 1, perPage = 50, customerId?: string): Promise<ApiResponse<PaystackTransaction[]>> {
    try {
      let url = `/transaction?page=${page}&perPage=${perPage}`;
      if (customerId) {
        url += `&customer=${customerId}`;
      }
      
      const response = await this.client.get(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async chargeAuthorization(authorizationCode: string, email: string, amount: number, reference?: string): Promise<ApiResponse<PaystackTransaction>> {
    try {
      const data = {
        authorization_code: authorizationCode,
        email,
        amount: amount * 100, // Convert to kobo
        reference
      };
      
      const response = await this.client.post('/transaction/charge_authorization', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Plan Management
  async createPlan(planData: {
    name: string;
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'biannually' | 'annually';
    description?: string;
    send_invoices?: boolean;
    send_sms?: boolean;
    currency?: string;
  }): Promise<ApiResponse<PaystackPlan>> {
    try {
      const data = {
        ...planData,
        amount: planData.amount * 100 // Convert to kobo
      };
      
      const response = await this.client.post('/plan', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getPlans(): Promise<ApiResponse<PaystackPlan[]>> {
    try {
      const response = await this.client.get('/plan');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getPlan(planCode: string): Promise<ApiResponse<PaystackPlan>> {
    try {
      const response = await this.client.get(`/plan/${planCode}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Subscription Management
  async createSubscription(customerCode: string, planCode: string, authorizationCode?: string): Promise<ApiResponse<any>> {
    try {
      const data: any = {
        customer: customerCode,
        plan: planCode
      };
      
      if (authorizationCode) {
        data.authorization = authorizationCode;
      }
      
      const response = await this.client.post('/subscription', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getSubscriptions(customerId?: string): Promise<ApiResponse<any[]>> {
    try {
      let url = '/subscription';
      if (customerId) {
        url += `?customer=${customerId}`;
      }
      
      const response = await this.client.get(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async disableSubscription(subscriptionCode: string, token: string): Promise<ApiResponse> {
    try {
      const data = { code: subscriptionCode, token };
      await this.client.post('/subscription/disable', data);
      return { success: true, message: 'Subscription disabled successfully' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Invoice Management
  async getInvoices(customerId?: string): Promise<ApiResponse<PaystackInvoice[]>> {
    try {
      let url = '/paymentrequest';
      if (customerId) {
        url += `?customer=${customerId}`;
      }
      
      const response = await this.client.get(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createInvoice(invoiceData: {
    description: string;
    amount: number;
    customer: string;
    due_date?: string;
    has_invoice?: boolean;
    send_notification?: boolean;
    draft?: boolean;
  }): Promise<ApiResponse<PaystackInvoice>> {
    try {
      const data = {
        ...invoiceData,
        amount: invoiceData.amount * 100 // Convert to kobo
      };
      
      const response = await this.client.post('/paymentrequest', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Settlement & Balance
  async getBalance(): Promise<ApiResponse<{ balance: number; currency: string }[]>> {
    try {
      const response = await this.client.get('/balance');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getSettlements(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get('/settlement');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Banks & Payment Methods
  async getBanks(country = 'nigeria'): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get(`/bank?country=${country}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Utility Methods
  generateTransactionReference(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getBillingOverview(customerId: string): Promise<ApiResponse<BillingOverview>> {
    try {
      // Get customer data
      const customerResult = await this.getCustomer(customerId);
      if (!customerResult.success) {
        return { success: false, error: 'Failed to fetch customer data' };
      }

      // Get recent transactions
      const transactionsResult = await this.getTransactions(1, 10, customerId);
      const transactions = transactionsResult.success ? transactionsResult.data || [] : [];

      // Get subscriptions
      const subscriptionsResult = await this.getSubscriptions(customerId);
      const subscriptions = subscriptionsResult.success ? subscriptionsResult.data || [] : [];

      // Calculate billing overview
      const currentDate = new Date();
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const monthToDateTransactions = transactions.filter(
        (txn: PaystackTransaction) => new Date(txn.created_at) >= monthStart && txn.status === 'success'
      );
      
      const monthToDateSpend = monthToDateTransactions.reduce(
        (total: number, txn: PaystackTransaction) => total + (txn.amount / 100), // Convert from kobo
        0
      );

      const lastSuccessfulTransaction = transactions.find((txn: PaystackTransaction) => txn.status === 'success');
      
      // Extract payment methods from transactions
      const paymentMethods: PaymentMethod[] = [];
      const seenAuthorizations = new Set<string>();
      
      transactions.forEach((txn: PaystackTransaction) => {
        if (txn.authorization && !seenAuthorizations.has(txn.authorization.authorization_code)) {
          seenAuthorizations.add(txn.authorization.authorization_code);
          paymentMethods.push({
            id: txn.authorization.authorization_code,
            type: 'card',
            last4: txn.authorization.last4,
            brand: txn.authorization.brand,
            exp_month: txn.authorization.exp_month,
            exp_year: txn.authorization.exp_year,
            is_default: paymentMethods.length === 0,
            authorization_code: txn.authorization.authorization_code
          });
        }
      });

      const billingOverview: BillingOverview = {
        currentBalance: 0, // Paystack doesn't provide customer balance directly
        monthToDateSpend,
        projectedMonthlySpend: monthToDateSpend * (30 / currentDate.getDate()),
        lastPaymentDate: lastSuccessfulTransaction?.paid_at || lastSuccessfulTransaction?.created_at || '',
        lastPaymentAmount: lastSuccessfulTransaction ? lastSuccessfulTransaction.amount / 100 : 0,
        nextBillingDate: subscriptions.length > 0 ? 'Based on active subscriptions' : '',
        paymentMethods
      };

      return { success: true, data: billingOverview };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Webhook verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const hash = crypto.createHmac('sha512', this.secretKey).update(payload).digest('hex');
      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const paystackApi = new PaystackAPIClient();
export default PaystackAPIClient;