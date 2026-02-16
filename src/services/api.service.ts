import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:44329';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>) {
    try {
      const response = await this.client.get<T>(endpoint, { params });
      return { data: response.data, error: null };
    } catch (error) {
      const axiosError = error as AxiosError;
      return { data: null, error: axiosError.message };
    }
  }

  async post<T>(endpoint: string, payload: unknown) {
    try {
      const response = await this.client.post<T>(endpoint, payload);
      return { data: response.data, error: null };
    } catch (error) {
      const axiosError = error as AxiosError;
      return { data: null, error: axiosError.message };
    }
  }

  async put<T>(endpoint: string, payload: unknown) {
    try {
      const response = await this.client.put<T>(endpoint, payload);
      return { data: response.data, error: null };
    } catch (error) {
      const axiosError = error as AxiosError;
      return { data: null, error: axiosError.message };
    }
  }

  async delete<T>(endpoint: string) {
    try {
      const response = await this.client.delete<T>(endpoint);
      return { data: response.data, error: null };
    } catch (error) {
      const axiosError = error as AxiosError;
      return { data: null, error: axiosError.message };
    }
  }
}

export const apiService = new ApiService();
