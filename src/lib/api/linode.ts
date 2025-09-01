import axios, { AxiosInstance } from 'axios';
import {
  LinodeInstance,
  LinodeType,
  LinodeRegion,
  LinodeImage,
  LinodeVolume,
  LinodeBackup,
  NodeBalancer,
  CreateInstanceForm,
  CreateVolumeForm,
  PaginatedResponse,
  ApiResponse,
  LinodeError,
  UsageMetrics
} from '@/types';

class LinodeAPIClient {
  private client: AxiosInstance;
  private token: string;

  constructor(token?: string) {
    this.token = token || (typeof process !== 'undefined' ? process.env.LINODE_API_TOKEN : '') || '';
    
    this.client = axios.create({
      baseURL: 'https://api.linode.com/v4',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'X-Filter': '{}' // Default filter
      },
      timeout: 30000
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[Linode API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[Linode API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('[Linode API] Response error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          throw new Error('Unauthorized: Please check your Linode API token');
        }
        
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded: Please try again later');
        }
        
        if (error.response?.data?.errors) {
          const linodeError = error.response.data as LinodeError;
          throw new Error(linodeError.errors.map(e => e.reason).join(', '));
        }
        
        throw error;
      }
    );
  }

  // Authentication & Account
  async getProfile() {
    try {
      const response = await this.client.get('/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getAccountInfo() {
    try {
      const response = await this.client.get('/account');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Instances Management
  async getInstances(page = 1, pageSize = 25): Promise<ApiResponse<PaginatedResponse<LinodeInstance>>> {
    try {
      const response = await this.client.get(`/linode/instances?page=${page}&page_size=${pageSize}`);
      return {
        success: true,
        data: {
          data: response.data.data,
          page: response.data.page,
          pages: response.data.pages,
          results: response.data.results
        }
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getInstance(id: number): Promise<ApiResponse<LinodeInstance>> {
    try {
      const response = await this.client.get(`/linode/instances/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createInstance(instanceData: CreateInstanceForm): Promise<ApiResponse<LinodeInstance>> {
    try {
      const response = await this.client.post('/linode/instances', instanceData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteInstance(id: number): Promise<ApiResponse> {
    try {
      await this.client.delete(`/linode/instances/${id}`);
      return { success: true, message: 'Instance deleted successfully' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async bootInstance(id: number, configId?: number): Promise<ApiResponse> {
    try {
      const data = configId ? { config_id: configId } : {};
      await this.client.post(`/linode/instances/${id}/boot`, data);
      return { success: true, message: 'Instance boot initiated' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async rebootInstance(id: number, configId?: number): Promise<ApiResponse> {
    try {
      const data = configId ? { config_id: configId } : {};
      await this.client.post(`/linode/instances/${id}/reboot`, data);
      return { success: true, message: 'Instance reboot initiated' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async shutdownInstance(id: number): Promise<ApiResponse> {
    try {
      await this.client.post(`/linode/instances/${id}/shutdown`);
      return { success: true, message: 'Instance shutdown initiated' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Instance Statistics
  async getInstanceStats(id: number, period?: string): Promise<ApiResponse<UsageMetrics[]>> {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await this.client.get(`/linode/instances/${id}/stats${params}`);
      
      // Transform Linode stats format to our UsageMetrics format
      const stats: UsageMetrics[] = response.data.data?.map((stat: any) => ({
        timestamp: stat[0],
        cpu: stat[1]?.cpu || 0,
        memory: stat[1]?.memory?.used || 0,
        network_in: stat[1]?.netv4?.in || 0,
        network_out: stat[1]?.netv4?.out || 0,
        disk_io: stat[1]?.io?.io || 0
      })) || [];

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Types, Regions, Images
  async getTypes(): Promise<ApiResponse<LinodeType[]>> {
    try {
      const response = await this.client.get('/linode/types');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getRegions(): Promise<ApiResponse<LinodeRegion[]>> {
    try {
      const response = await this.client.get('/regions');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getImages(): Promise<ApiResponse<LinodeImage[]>> {
    try {
      const response = await this.client.get('/images');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Volumes Management
  async getVolumes(): Promise<ApiResponse<LinodeVolume[]>> {
    try {
      const response = await this.client.get('/volumes');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createVolume(volumeData: CreateVolumeForm): Promise<ApiResponse<LinodeVolume>> {
    try {
      const response = await this.client.post('/volumes', volumeData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteVolume(id: number): Promise<ApiResponse> {
    try {
      await this.client.delete(`/volumes/${id}`);
      return { success: true, message: 'Volume deleted successfully' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async attachVolume(volumeId: number, linodeId: number, configId?: number): Promise<ApiResponse> {
    try {
      const data = { linode_id: linodeId, config_id: configId };
      await this.client.post(`/volumes/${volumeId}/attach`, data);
      return { success: true, message: 'Volume attachment initiated' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async detachVolume(volumeId: number): Promise<ApiResponse> {
    try {
      await this.client.post(`/volumes/${volumeId}/detach`);
      return { success: true, message: 'Volume detachment initiated' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Backups Management
  async getBackups(instanceId: number): Promise<ApiResponse<LinodeBackup[]>> {
    try {
      const response = await this.client.get(`/linode/instances/${instanceId}/backups`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async enableBackups(instanceId: number): Promise<ApiResponse> {
    try {
      await this.client.post(`/linode/instances/${instanceId}/backups/enable`);
      return { success: true, message: 'Backups enabled successfully' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createSnapshot(instanceId: number, label: string): Promise<ApiResponse> {
    try {
      await this.client.post(`/linode/instances/${instanceId}/backups`, { label });
      return { success: true, message: 'Snapshot creation initiated' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // NodeBalancers
  async getNodeBalancers(): Promise<ApiResponse<NodeBalancer[]>> {
    try {
      const response = await this.client.get('/nodebalancers');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createNodeBalancer(data: any): Promise<ApiResponse<NodeBalancer>> {
    try {
      const response = await this.client.post('/nodebalancers', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteNodeBalancer(id: number): Promise<ApiResponse> {
    try {
      await this.client.delete(`/nodebalancers/${id}`);
      return { success: true, message: 'NodeBalancer deleted successfully' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Domains (DNS)
  async getDomains(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get('/domains');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // SSH Keys
  async getSSHKeys(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get('/profile/sshkeys');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async addSSHKey(label: string, ssh_key: string): Promise<ApiResponse> {
    try {
      await this.client.post('/profile/sshkeys', { label, ssh_key });
      return { success: true, message: 'SSH key added successfully' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Events & Notifications
  async getEvents(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get('/account/events');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Invoices
  async getInvoices(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get('/account/invoices');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Account Settings
  async getAccountSettings(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/account/settings');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

// Export singleton instance
export const linodeApi = new LinodeAPIClient();
export default LinodeAPIClient;