import React, { Component, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Bug, Wifi, Clock, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: (string | number)[];
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  errorId: string;
  lastResetKeys?: (string | number)[];
}

// 에러 분류
type ErrorType = 'network' | 'runtime' | 'unknown';

const classifyError = (error: Error): ErrorType => {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || 
      message.includes('fetch') || 
      message.includes('timeout') ||
      message.includes('connection')) {
    return 'network';
  }
  
  if (message.includes('runtime') || 
      message.includes('undefined') || 
      message.includes('null')) {
    return 'runtime';
  }
  
  return 'unknown';
};

const getErrorIcon = (errorType: ErrorType) => {
  switch (errorType) {
    case 'network':
      return <Wifi className="w-8 h-8 text-red-400" />;
    case 'runtime':
      return <Bug className="w-8 h-8 text-red-400" />;
    default:
      return <AlertTriangle className="w-8 h-8 text-red-400" />;
  }
};

const getErrorMessage = (errorType: ErrorType) => {
  switch (errorType) {
    case 'network':
      return {
        title: '네트워크 연결 문제',
        description: '인터넷 연결을 확인하고 다시 시도해주세요.'
      };
    case 'runtime':
      return {
        title: '애플리케이션 오류',
        description: '일시적인 오류가 발생했습니다.'
      };
    default:
      return {
        title: '예상치 못한 오류',
        description: '문제가 지속되면 페이지를 새로고침해주세요.'
      };
  }
};

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId?: number;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0,
      errorId: '',
      lastResetKeys: props.resetKeys
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // resetKeys가 변경되면 에러 상태 초기화
    if (props.resetOnPropsChange && props.resetKeys !== state.lastResetKeys) {
      if (state.hasError) {
        return {
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          retryCount: 0,
          lastResetKeys: props.resetKeys
        };
      }
      return {
        lastResetKeys: props.resetKeys
      };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 외부 에러 트래킹 서비스에 전송 (예: Sentry)
    this.props.onError?.(error, errorInfo);
    
    // 에러 정보 저장
    this.setState({
      error,
      errorInfo,
    });

    // 자동 복구 시도 (네트워크 에러의 경우)
    const errorType = classifyError(error);
    if (errorType === 'network' && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleAutoRetry();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private scheduleAutoRetry = () => {
    // 네트워크 에러의 경우 자동으로 재시도
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000); // 지수 백오프
    
    this.resetTimeoutId = setTimeout(() => {
      console.log(`Auto retry attempt ${this.state.retryCount + 1}`);
      this.handleReset();
    }, delay);
  };

  private handleReset = () => {
    const maxRetries = this.props.maxRetries || 3;
    
    if (this.state.retryCount < maxRetries) {
      console.log(`Manual retry attempt ${this.state.retryCount + 1}/${maxRetries}`);
      
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      // 최대 재시도 횟수 초과시 완전 초기화
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: 0
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 fallback이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = classifyError(this.state.error);
      const errorMessage = getErrorMessage(errorType);
      const maxRetries = this.props.maxRetries || 3;
      const canRetry = this.state.retryCount < maxRetries;

      // 기본 에러 UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="text-center">
              {/* 에러 아이콘 */}
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                {getErrorIcon(errorType)}
              </div>

              {/* 에러 메시지 */}
              <h2 className="text-white text-xl font-bold mb-2">
                {errorMessage.title}
              </h2>
              <p className="text-white/70 mb-6">
                {errorMessage.description}
              </p>

              {/* 재시도 정보 */}
              {this.state.retryCount > 0 && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-yellow-300 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>재시도 횟수: {this.state.retryCount}/{maxRetries}</span>
                  </div>
                </div>
              )}

              {/* 개발 환경에서 에러 상세 정보 */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 p-4 bg-red-500/10 rounded-lg text-left mb-6">
                  <summary className="text-red-400 cursor-pointer mb-2">
                    개발자 정보 (개발 환경에서만 표시)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <span className="text-red-300 text-xs font-bold">Error ID:</span>
                      <code className="text-red-300 text-xs ml-2">{this.state.errorId}</code>
                    </div>
                    <pre className="text-xs text-red-300 whitespace-pre-wrap break-words">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}
              
              {/* 액션 버튼들 */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && (
                  <button 
                    onClick={this.handleReset}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    다시 시도 ({maxRetries - this.state.retryCount}회 남음)
                  </button>
                )}

                <button 
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  홈으로 가기
                </button>
                
                <button 
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  페이지 새로고침
                </button>
              </div>

              {/* 추가 도움말 */}
              <div className="mt-6 text-xs text-white/50">
                <p>문제가 지속될 경우:</p>
                <ul className="mt-2 space-y-1">
                  <li>• 브라우저 캐시를 삭제해보세요</li>
                  <li>• 네트워크 연결을 확인해보세요</li>
                  <li>• 잠시 후 다시 시도해보세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC로도 사용할 수 있는 래퍼 (강화된 버전)
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// 에러 경계를 위한 유틸리티 hooks
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  if (error) {
    throw error;
  }

  return { captureError, resetError };
}; 