export interface CommonResponse<T> {
  message: string;
  status: number;
  data: T | null;
  code?: number;
} 