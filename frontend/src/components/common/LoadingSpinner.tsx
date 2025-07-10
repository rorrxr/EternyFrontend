import React from 'react';
import { Loader2, Search, Trophy, User, TrendingUp } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const spinnerSize = sizeClasses[size];

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {text && <span className="ml-2 text-gray-400">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${spinnerSize} bg-cyan-400 rounded-full animate-pulse`} />
        {text && <span className="ml-2 text-gray-400">{text}</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${spinnerSize} animate-spin text-cyan-400`} />
      {text && <span className="ml-2 text-gray-400">{text}</span>}
    </div>
  );
};

// 스켈레톤 컴포넌트들
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />
);

// 플레이어 카드 스켈레톤
export const PlayerCardSkeleton: React.FC = () => (
  <div className="gaming-card p-4">
    <div className="flex items-start gap-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  </div>
);

// 검색 결과 스켈레톤
export const SearchResultsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <PlayerCardSkeleton key={index} />
    ))}
  </div>
);

// 플레이어 프로필 스켈레톤
export const PlayerProfileSkeleton: React.FC = () => (
  <div className="glass-effect rounded-2xl p-6">
    <div className="flex items-start gap-6 mb-6">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="text-center">
          <Skeleton className="h-6 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-12 mx-auto" />
        </div>
      ))}
    </div>
    
    <Skeleton className="h-64 w-full" />
  </div>
);

// 매치 히스토리 스켈레톤
export const MatchHistorySkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="gaming-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// 통합 로딩 상태 컴포넌트
interface LoadingStateProps {
  type: 'search' | 'profile' | 'matches' | 'general';
  text?: string;
  variant?: 'skeleton' | 'spinner';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  text,
  variant = 'skeleton',
  count = 3
}) => {
  if (variant === 'spinner') {
    const icons = {
      search: <Search className="w-6 h-6" />,
      profile: <User className="w-6 h-6" />,
      matches: <Trophy className="w-6 h-6" />,
      general: <TrendingUp className="w-6 h-6" />
    };

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <div className="w-16 h-16 bg-cyan-400/20 rounded-full" />
          </div>
          <div className="relative w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white">
            {icons[type]}
          </div>
        </div>
        <div className="mt-4 text-center">
          <LoadingSpinner variant="dots" />
          {text && <p className="mt-2 text-gray-400">{text}</p>}
        </div>
      </div>
    );
  }

  // 스켈레톤 버전
  switch (type) {
    case 'search':
      return <SearchResultsSkeleton count={count} />;
    case 'profile':
      return <PlayerProfileSkeleton />;
    case 'matches':
      return <MatchHistorySkeleton count={count} />;
    default:
      return (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="gaming-card p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
  }
};

// 에러 상태 컴포넌트
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "오류가 발생했습니다",
  message = "잠시 후 다시 시도해주세요",
  onRetry,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
      <div className="w-8 h-8 text-red-400">⚠️</div>
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-center mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn-gaming px-6 py-2 rounded-lg"
      >
        다시 시도
      </button>
    )}
  </div>
);

// 빈 상태 컴포넌트
interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "결과가 없습니다",
  message = "검색 조건을 변경해보세요",
  action,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mb-4">
      <Search className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-center mb-4">{message}</p>
    {action}
  </div>
); 