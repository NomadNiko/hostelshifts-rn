import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

const API_BASE = `${API_CONFIG.baseUrl}${API_CONFIG.apiPath}`;

export interface Schedule {
  id: string;
  name: string;
  startDate: string; // Backend uses startDate, not weekStart
  endDate: string;   // Backend uses endDate, not weekEnd
  status: 'DRAFT' | 'PUBLISHED' | 'published'; // Backend returns lowercase 'published'
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id?: any;
    firstName?: string;
    lastName?: string;
  };
}

export interface ScheduleShift {
  id: string;
  scheduleId: string;
  date: string;
  order?: number;
  isActive?: boolean;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: {
      id: string | number;
      _id?: string;
    };
  };
  shiftType?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    colorIndex?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: {
    id: string;
    name: string;
  };
}

class SchedulesService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('hostelshifts_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getSchedules(): Promise<Schedule[]> {
    try {
      const headers = await this.getAuthHeaders();
      console.log('🔍 Fetching schedules from:', `${API_BASE}${API_ENDPOINTS.schedules.list}`);
      
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.schedules.list}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch schedules: ${response.status}`);
      }

      const data = await response.json();
      console.log('📅 Raw schedules data from backend:', JSON.stringify(data, null, 2));
      console.log('📅 Number of schedules received:', Array.isArray(data) ? data.length : 'Not an array');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('📅 First schedule sample:', JSON.stringify(data[0], null, 2));
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Get schedules error:', error);
      throw error;
    }
  }

  async getScheduleShifts(scheduleId: string): Promise<ScheduleShift[]> {
    try {
      if (!scheduleId) {
        console.warn('No schedule ID provided for fetching shifts');
        return [];
      }

      const headers = await this.getAuthHeaders();
      const url = `${API_BASE}${API_ENDPOINTS.scheduleShifts.list.replace(':scheduleId', scheduleId)}`;
      console.log('🔍 Fetching schedule shifts from:', url);
      console.log('🔍 Schedule ID:', scheduleId);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.log(`❌ Schedule shifts request failed: ${response.status} ${response.statusText}`);
        if (response.status === 404) {
          console.warn(`No shifts found for schedule ${scheduleId}`);
          return [];
        }
        throw new Error(`Failed to fetch schedule shifts: ${response.status}`);
      }

      const data = await response.json();
      console.log('⏰ Raw schedule shifts data from backend:', JSON.stringify(data, null, 2));
      
      // Backend returns { shifts: [...], unassignedShifts: [] }
      const shifts = data.shifts || [];
      console.log('⏰ Number of shifts received:', Array.isArray(shifts) ? shifts.length : 'Not an array');
      
      if (Array.isArray(shifts) && shifts.length > 0) {
        console.log('⏰ First shift sample:', JSON.stringify(shifts[0], null, 2));
      }
      
      return Array.isArray(shifts) ? shifts : [];
    } catch (error) {
      console.error('Get schedule shifts error:', error);
      return []; // Return empty array instead of throwing for better UX
    }
  }

  async getEmployees(): Promise<Employee[]> {
    try {
      const headers = await this.getAuthHeaders();
      console.log('🔍 Fetching employees from:', `${API_BASE}${API_ENDPOINTS.employees.list}`);
      
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.employees.list}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.log(`❌ Employees request failed: ${response.status} ${response.statusText}`);
        // If employees endpoint doesn't exist, return empty array instead of throwing
        if (response.status === 404) {
          console.warn('Employees endpoint not found, returning empty array');
          return [];
        }
        throw new Error(`Failed to fetch employees: ${response.status}`);
      }

      const data = await response.json();
      console.log('👥 Raw employees data from backend:', JSON.stringify(data, null, 2));
      console.log('👥 Number of employees received:', Array.isArray(data) ? data.length : 'Not an array');
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Get employees error:', error);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }

  async publishSchedule(scheduleId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE}${API_ENDPOINTS.schedules.publish.replace(':id', scheduleId)}`,
        {
          method: 'PATCH',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to publish schedule');
      }
    } catch (error) {
      console.error('Publish schedule error:', error);
      throw error;
    }
  }
}

export default new SchedulesService();