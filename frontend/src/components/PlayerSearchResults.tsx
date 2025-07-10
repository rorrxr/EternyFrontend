import React, { useCallback, useRef, useEffect } from 'react';
import { User, Search, AlertCircle } from 'lucide-react';
import { PlayerSearchResult } from '../types/player';
import { PlayerCard } from './player/PlayerCard';
import { LoadingState, EmptyState, ErrorState } from './common/LoadingSpinner';
import { useInfiniteScroll } from '../utils/performance';

interface PlayerSearchResultsProps {
  players: PlayerSearchResult[];
  onSelectPlayer: (player: PlayerSearchResult) => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  error?: Error | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  selectedPlayerId?: number;
  variant?: 'grid' | 'list';
  showHeader?: boolean;
}

export const PlayerSearchResults: React.FC<PlayerSearchResultsProps> = ({
  players,
  onSelectPlayer,
  isLoading = false,
  isLoadingMore = false,
  error,
  hasMore = false,
  onLoadMore,
  selectedPlayerId,
  variant = 'list',
  showHeader = true,
}) => {
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasMore && !isLoading && !isLoadingMore) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, isLoading, isLoadingMore]);

  // 무한 스크롤 훅
  const lastElementRef = useInfiniteScroll(
    handleLoadMore,
    hasMore,
    isLoading || isLoadingMore
  );

  const handlePlayerSelect = useCallback((player: PlayerSearchResult) => {
    onSelectPlayer(player);
  }, [onSelectPlayer]);

  const handleRetry = useCallback(() => {
    if (onLoadMore) {
      onLoadMore();
    }
  }, [onLoadMore]);

  // 로딩 상태
  if (isLoading && players.length === 0) {
    return <LoadingState type="search" text="플레이어를 검색하는 중..." />;
  }

  // 에러 상태
  if (error && players.length === 0) {
    return (
      <ErrorState
        title="검색 중 오류가 발생했습니다"
        message={error.message || "네트워크 연결을 확인하고 다시 시도해주세요"}
        onRetry={handleRetry}
      />
    );
  }

  // 빈 상태
  if (!isLoading && players.length === 0) {
    return (
      <EmptyState
        title="검색 결과가 없습니다"
        message="다른 닉네임으로 검색해보세요"
        action={
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <span>정확한 닉네임을 입력해주세요</span>
          </div>
        }
      />
    );
  }

  const containerClass = variant === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
    : 'space-y-3';

  return (
    <div className="glass-effect rounded-2xl border border-gray-700/50 overflow-hidden">
      {showHeader && (
        <div className="bg-gradient-to-r from-cyan-600 to-purple-600 p-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6" />
            검색 결과
            <span className="text-sm font-normal opacity-80">
              ({players.length}명)
            </span>
          </h2>
        </div>
      )}
      
      <div className="p-6">
        {/* 검색 결과 리스트 */}
        <div className={containerClass}>
          {players.map((player, index) => (
            <div
              key={player.userNum}
              ref={index === players.length - 1 ? lastElementRef : null}
            >
              <PlayerCard
                player={player}
                onSelect={handlePlayerSelect}
                isSelected={selectedPlayerId === player.userNum}
                isLoading={isLoading}
                variant={variant === 'grid' ? 'compact' : 'detailed'}
              />
            </div>
          ))}
        </div>

        {/* 로딩 더 보기 */}
        {isLoadingMore && (
          <div className="mt-6">
            <LoadingState 
              type="search" 
              variant="spinner" 
              text="더 많은 결과를 불러오는 중..." 
            />
          </div>
        )}

        {/* 에러 상태 (부분 로딩 실패) */}
        {error && players.length > 0 && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>추가 결과를 불러오는데 실패했습니다</span>
            </div>
            <button
              onClick={handleRetry}
              className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 끝 표시 */}
        {!hasMore && players.length > 0 && (
          <div className="mt-6 text-center text-gray-400 text-sm">
            모든 검색 결과를 불러왔습니다
          </div>
        )}
      </div>
    </div>
  );
}; 