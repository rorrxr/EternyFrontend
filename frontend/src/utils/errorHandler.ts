export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  CACHE_ERROR = 'CACHE_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  recoverable?: boolean;
  retryable?: boolean;
}

export class ErrorHandler {
  static createError(type: ErrorType, message: string, details?: any): AppError {
    return {
      type,
      message,
      details,
      recoverable: this.isRecoverable(type),
      retryable: this.isRetryable(type)
    };
  }
  private static isRecoverable(type: ErrorType): boolean {
    return [ErrorType.NETWORK_ERROR, ErrorType.EXTERNAL_API_ERROR, ErrorType.CACHE_ERROR].includes(type);
  }
  private static isRetryable(type: ErrorType): boolean {
    return [ErrorType.NETWORK_ERROR, ErrorType.EXTERNAL_API_ERROR].includes(type);
  }
  static handleApiError(error: any): AppError {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 404:
          if (data?.message === 'Player not found' && data?.code === 404) {
            return this.createError(ErrorType.PLAYER_NOT_FOUND, '플레이어를 찾을 수 없습니다. 외부 API에서 데이터를 가져오는 중입니다...', { canRetryWithExternalApi: true });
          }
          return this.createError(ErrorType.API_ERROR, '요청한 리소스를 찾을 수 없습니다.');
        case 500:
          return this.createError(ErrorType.API_ERROR, '서버 오류가 발생했습니다.');
        case 503:
          return this.createError(ErrorType.EXTERNAL_API_ERROR, '외부 API 서비스가 일시적으로 사용할 수 없습니다.');
        default:
          return this.createError(ErrorType.API_ERROR, `API 오류 (${status}): ${data?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      return this.createError(ErrorType.NETWORK_ERROR, '네트워크 연결을 확인해주세요.');
    } else {
      return this.createError(ErrorType.API_ERROR, '요청 처리 중 오류가 발생했습니다.');
    }
  }
} 