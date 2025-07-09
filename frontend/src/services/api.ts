// services/api.ts - API 기본 설정
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 - 공통 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config.url);
    }
    return Promise.reject(error);
  }
); 