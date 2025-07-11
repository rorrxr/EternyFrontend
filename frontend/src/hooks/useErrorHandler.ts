// hooks/useErrorHandler.ts - 에러 처리 훅
import { useState, useCallback, useRef, useEffect } from 'react';
import { ErrorHandler, AppError, ErrorType } from '../utils/errorHandler';

interface ErrorState {
  [key: string]: AppError;
}

interface ToastOptions {
  duration?: number;
  autoClose?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
}

interface ToastMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  duration: number;
  autoClose: boolean;
  showRetry: boolean;
  onRetry?: () => void;
  timestamp: number;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorState>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);
  const timersRef = useRef<Map<string, number>>(new Map());

  // 토스트 메시지 추가
  const addToast = useCallback((
    type: ToastMessage['type'],
    title: string,
    message: string,
    options: ToastOptions = {}
  ) => {
    const {
      duration = type === 'error' ? 5000 : 3000,
      autoClose = true,
      showRetry = type === 'error',
      onRetry
    } = options;

    const id = `toast-${++toastIdRef.current}`;
    
    const toast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
      autoClose,
      showRetry,
      onRetry,
      timestamp: Date.now()
    };

    setToasts(prev => [...prev, toast]);

    // 자동 닫기 타이머 설정
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      
      timersRef.current.set(id, timer);
    }

    return id;
  }, []);

  // 토스트 메시지 제거
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    
    // 타이머 정리
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  // 모든 토스트 제거
  const clearAllToasts = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  // 에러 처리 메인 함수
  const handleError = useCallback((key: string, error: any, options: ToastOptions = {}) => {
    console.error(`Error [${key}]:`, error);
    
    let appError: AppError;
    
    // 이미 AppError 인스턴스인 경우
    if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
      appError = error as AppError;
    } else {
      // 일반 에러를 AppError로 변환
      appError = ErrorHandler.handleApiError(error);
    }

    // 에러 상태 저장
    setErrors(prev => ({
      ...prev,
      [key]: appError
    }));

    // 토스트 메시지 표시
    const toastTitle = getErrorTitle(appError.type);
    const toastOptions: ToastOptions = {
      ...options,
      showRetry: appError.retryable && (options.showRetry !== false),
      onRetry: options.onRetry
    };

    addToast('error', toastTitle, appError.message, toastOptions);

    return appError;
  }, [addToast]);

  // 경고 메시지 표시
  const handleWarning = useCallback((key: string, message: string, options: ToastOptions = {}) => {
    const warningError: AppError = {
      type: ErrorType.VALIDATION_ERROR,
      message,
      recoverable: true,
      retryable: false
    };

    setErrors(prev => ({
      ...prev,
      [key]: warningError
    }));

    addToast('warning', '주의', message, {
      duration: 3000,
      showRetry: false,
      ...options
    });

    return warningError;
  }, [addToast]);

  // 성공 메시지 표시
  const handleSuccess = useCallback((message: string, options: ToastOptions = {}) => {
    addToast('success', '성공', message, {
      duration: 2000,
      showRetry: false,
      ...options
    });
  }, [addToast]);

  // 정보 메시지 표시
  const handleInfo = useCallback((message: string, options: ToastOptions = {}) => {
    addToast('info', '알림', message, {
      duration: 3000,
      showRetry: false,
      ...options
    });
  }, [addToast]);

  // 특정 에러 클리어
  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  // 모든 에러 클리어
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // 에러 존재 여부 확인
  const hasError = useCallback((key: string) => {
    return key in errors;
  }, [errors]);

  // 특정 에러 가져오기
  const getError = useCallback((key: string) => {
    return errors[key] || null;
  }, [errors]);

  // 재시도 가능한 에러 목록
  const getRetryableErrors = useCallback(() => {
    return Object.entries(errors)
      .filter(([, error]) => error.retryable)
      .map(([key, error]) => ({ key, error }));
  }, [errors]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return {
    // 에러 상태
    errors,
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length,
    
    // 토스트 상태
    toasts,
    hasToasts: toasts.length > 0,
    toastCount: toasts.length,
    
    // 에러 처리 함수들
    handleError,
    handleWarning,
    handleSuccess,
    handleInfo,
    
    // 에러 관리 함수들
    clearError,
    clearAllErrors,
    hasError,
    getError,
    getRetryableErrors,
    
    // 토스트 관리 함수들
    removeToast,
    clearAllToasts,
    addToast,
  };
};

// 에러 타입에 따른 제목 반환
function getErrorTitle(errorType: ErrorType): string {
  const titleMap: Record<ErrorType, string> = {
    [ErrorType.NETWORK_ERROR]: '네트워크 오류',
    [ErrorType.API_ERROR]: 'API 오류',
    [ErrorType.VALIDATION_ERROR]: '입력 오류',
    [ErrorType.PLAYER_NOT_FOUND]: '플레이어 없음',
    [ErrorType.EXTERNAL_API_ERROR]: '외부 서비스 오류',
    [ErrorType.CACHE_ERROR]: '캐시 오류'
  };
  
  return titleMap[errorType] || '오류';
}

// 에러 심각도 반환
export const getErrorSeverity = (error: AppError): 'low' | 'medium' | 'high' | 'critical' => {
  switch (error.type) {
    case ErrorType.CACHE_ERROR:
      return 'low';
    case ErrorType.VALIDATION_ERROR:
      return 'medium';
    case ErrorType.NETWORK_ERROR:
    case ErrorType.EXTERNAL_API_ERROR:
      return 'high';
    case ErrorType.API_ERROR:
    case ErrorType.PLAYER_NOT_FOUND:
      return 'critical';
    default:
      return 'medium';
  }
};

// 전역 에러 리포터 (선택적)
export const reportError = (error: AppError, context?: any) => {
  if (import.meta.env.PROD) {
    // 프로덕션에서는 실제 에러 리포팅 서비스로 전송
    console.error('Error reported:', error, context);
  } else {
    // 개발 환경에서는 콘솔에 자세한 정보 출력
    console.group(`🚨 Error Report [${error.type}]`);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Context:', context);
    console.error('Stack:', new Error().stack);
    console.groupEnd();
  }
};

// 에러 통계 훅 (선택적)
export const useErrorStats = () => {
  const [errorStats, setErrorStats] = useState({
    totalErrors: 0,
    errorsByType: Object.values(ErrorType).reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<ErrorType, number>),
    lastError: null as AppError | null,
    lastErrorTime: null as Date | null
  });

  const recordError = useCallback((error: AppError) => {
    setErrorStats(prev => ({
      totalErrors: prev.totalErrors + 1,
      errorsByType: {
        ...prev.errorsByType,
        [error.type]: (prev.errorsByType[error.type] || 0) + 1
      },
      lastError: error,
      lastErrorTime: new Date()
    }));
  }, []);

  const resetStats = useCallback(() => {
    setErrorStats({
      totalErrors: 0,
      errorsByType: Object.values(ErrorType).reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<ErrorType, number>),
      lastError: null,
      lastErrorTime: null
    });
  }, []);

  return {
    errorStats,
    recordError,
    resetStats
  };
}; 