// components/layout/LoadingStates.tsx - 로딩 상태 컴포넌트들
import React from 'react';
import { Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react';

// 기본 스켈레톤 카드
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`card animate-pulse ${className}`}>
    <div className="flex items-start gap-4 mb-6">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </div>
    
    <div className="grid grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      ))}
    </div>
    
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>
  </div>
);

// 플레이어 프로필 스켈레톤
export const PlayerProfileSkeleton: React.FC = () => (
  <div className="card animate-pulse p-6">
    <div className="flex items-center gap-6 mb-8">
      {/* 프로필 이미지 */}
      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      
      {/* 플레이어 정보 */}
      <div className="flex-1">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-3"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
      
      {/* 랭크 배지 */}
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
    
    {/* 통계 그리드 */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
        </div>
      ))}
    </div>
    
    {/* 최근 게임 */}
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>
  </div>
);

// 매치 히스토리 스켈레톤
export const MatchHistorySkeleton: React.FC = () => (
  <div className="card animate-pulse p-6">
    <div className="flex justify-between items-center mb-6">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </div>
    
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="text-right">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 랭크 차트 스켈레톤
export const RankChartSkeleton: React.FC = () => (
  <div className="card animate-pulse p-6">
    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-6"></div>
    
    {/* 현재 랭크 */}
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </div>
    
    {/* 차트 영역 */}
    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
    
    {/* 통계 */}
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
        </div>
      ))}
    </div>
  </div>
);

// 검색 결과 스켈레톤
export const SearchResultsSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="card animate-pulse p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

// 로딩 스피너 (다양한 크기)
export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
}> = ({ 
  size = 'md', 
  color = 'primary',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-blue-200 border-t-blue-500',
    secondary: 'border-gray-200 border-t-gray-500',
    white: 'border-white/30 border-t-white'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-current`} />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
};

// 전체 페이지 로딩
export const PageLoading: React.FC<{ text?: string }> = ({ text = "로딩 중..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <LoadingSpinner size="xl" text={text} />
    </div>
  </div>
);

// 인라인 로딩 (작은 영역용)
export const InlineLoading: React.FC<{ text?: string }> = ({ text = "로딩 중..." }) => (
  <div className="flex items-center justify-center gap-2 py-8">
    <LoadingSpinner size="sm" />
    <span className="text-sm text-gray-500 dark:text-gray-400">{text}</span>
  </div>
);

// 연결 상태 표시기
export const ConnectionStatus: React.FC<{ 
  isConnected: boolean;
  isReconnecting?: boolean;
  onRetry?: () => void;
}> = ({ isConnected, isReconnecting = false, onRetry }) => {
  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <Wifi className="w-4 h-4" />
        <span className="text-sm">연결됨</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        {isReconnecting ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span className="text-sm">
          {isReconnecting ? '재연결 중...' : '연결 끊김'}
        </span>
      </div>
      
      {!isReconnecting && onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
        >
          재시도
        </button>
      )}
    </div>
  );
};

// 빈 상태 컴포넌트
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ icon, title, description, action }) => (
  <div className="text-center py-12">
    {icon && (
      <div className="flex justify-center mb-4 text-gray-400 dark:text-gray-600">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="btn-primary"
      >
        {action.label}
      </button>
    )}
  </div>
);

// 로딩 오버레이
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  text?: string;
  backdrop?: boolean;
}> = ({ isVisible, text = "처리 중...", backdrop = true }) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      backdrop ? 'bg-black/50' : 'bg-transparent pointer-events-none'
    }`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

// 프로그레시브 이미지 로딩
export const ProgressiveImage: React.FC<{
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}> = ({ src, alt, placeholder, className = "" }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      
      {placeholder && !isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
        />
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-gray-400 text-sm">이미지 로드 실패</span>
        </div>
      )}
    </div>
  );
}; 