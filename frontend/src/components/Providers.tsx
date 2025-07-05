import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from './ErrorBoundary'
import { ApiError } from '../lib/api/client'
import { config } from '../lib/config'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            // 글로벌 쿼리 에러 핸들링
            console.error('Query error:', error, query.queryKey)
            
            if (error instanceof ApiError) {
              // 특정 에러는 토스트로 표시하지 않음
              const silentErrors = [404, 401, 403]
              if (!silentErrors.includes(error.status)) {
                console.error('데이터 로딩 실패:', error.message)
              }
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, variables, context, mutation) => {
            // 글로벌 뮤테이션 에러 핸들링
            console.error('Mutation error:', error, { variables, context })
            
            if (error instanceof ApiError) {
              console.error('작업 실패:', error.message)
            }
          },
        }),
        defaultOptions: {
          queries: {
            // 기본 캐시 시간 설정
            staleTime: config.cache.userStaleTime,
            gcTime: 10 * 60 * 1000, // 10분 (cacheTime 대신 gcTime 사용)
            
            // 재시도 로직
            retry: (failureCount: number, error: unknown) => {
              // API 에러의 경우 특별 처리
              if (error instanceof ApiError) {
                // 클라이언트 에러는 재시도하지 않음
                if (error.status >= 400 && error.status < 500) {
                  return false
                }
                // 서버 에러는 최대 2번 재시도
                return failureCount < 2
              }
              
              // 네트워크 에러 등은 최대 3번 재시도
              return failureCount < 3
            },
            
            // 재시도 지연 시간 (지수 백오프)
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // 백그라운드에서 재요청 설정
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
            
            // 에러 시 백그라운드 업데이트 방지
            refetchOnError: false,
            
            // 컴포넌트 언마운트 시 쿼리 취소
            notifyOnChangeProps: 'tracked',
          },
          mutations: {
            // 뮤테이션 재시도 설정
            retry: (failureCount: number, error: unknown) => {
              if (error instanceof ApiError) {
                // 클라이언트 에러는 재시도하지 않음
                if (error.status >= 400 && error.status < 500) {
                  return false
                }
                return failureCount < 1
              }
              return failureCount < 2
            },
            
            // 뮤테이션 재시도 지연
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 에러 로깅 및 외부 서비스로 전송
        console.error('App Error:', error, errorInfo)
        
        // 프로덕션 환경에서는 에러 트래킹 서비스로 전송
        if (import.meta.env.PROD) {
          // 예: Sentry, LogRocket 등
          // Sentry.captureException(error, { extra: errorInfo })
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        
        {/* 개발 환경에서만 DevTools 표시 */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools 
            initialIsOpen={false}
            position="bottom-right"
            toggleButtonProps={{
              style: {
                marginRight: '20px',
                marginBottom: '20px',
              },
            }}
          />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

// 쿼리 클라이언트를 외부에서 접근할 수 있도록 하는 헬퍼
let globalQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 매번 새로운 클라이언트 생성
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          retry: false,
        },
      },
    })
  }
  
  // 클라이언트 사이드에서는 싱글톤 패턴
  if (!globalQueryClient) {
    globalQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: config.cache.userStaleTime,
          gcTime: 10 * 60 * 1000,
        },
      },
    })
  }
  
  return globalQueryClient
}

// 개발자를 위한 쿼리 캐시 디버깅 유틸리티
export function debugQueryCache() {
  if (import.meta.env.DEV && globalQueryClient) {
    const cache = globalQueryClient.getQueryCache()
    console.log('Query Cache:', {
      queries: cache.getAll(),
      queryCount: cache.getAll().length,
    })
  }
} 