// hooks/useErrorHandler.ts - 에러 처리 훅
import { useState, useCallback } from 'react';
import { ErrorHandler, AppError } from '../utils/errorHandler';

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<Map<string, AppError>>(new Map());

  const handleError = useCallback((key: string, error: any) => {
    const appError = ErrorHandler.handleApiError(error);
    
    setErrors(prev => new Map(prev).set(key, appError));
    
    // 콘솔에 에러 로그
    console.error(`Error [${key}]:`, appError);
    
    return appError;
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors(new Map());
  }, []);

  return {
    errors,
    handleError,
    clearError,
    clearAllErrors,
    hasError: (key: string) => errors.has(key),
    getError: (key: string) => errors.get(key)
  };
}; 