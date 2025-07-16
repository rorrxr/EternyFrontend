import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
// @ts-ignore
import InfiniteLoader from 'react-window-infinite-loader';
import { MatchCard } from './MatchCard';
import { MatchFilters } from './MatchFilters';
import { Match } from '@/types/match';
import { CharacterStats } from '@/types/player';

interface MatchHistoryProps {
  matches: Match[];
  characterStats: CharacterStats[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ 
  matches = [], 
  characterStats = [], 
  isLoading = false,
  hasMore = false,
  onLoadMore
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('all');
  const [selectedGameMode, setSelectedGameMode] = useState<string>('all');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set());

  // 🛡️ 방어적 데이터 검증 및 로깅
  console.log('🎮 MatchHistory props:', {
    matches: Array.isArray(matches) ? matches.length : 'not array',
    characterStats: Array.isArray(characterStats) ? characterStats.length : 'not array',
    isLoading,
    hasMore
  });

  // 🔍 안전한 배열 처리
  const safeMatches = useMemo(() => {
    if (!Array.isArray(matches)) {
      console.warn('MatchHistory: matches가 배열이 아닙니다:', typeof matches);
      return [];
    }
    
    // null, undefined 요소 필터링
    const validMatches = matches.filter(match => {
      if (!match) {
        console.warn('MatchHistory: null/undefined match found');
        return false;
      }
      return true;
    });

    console.log('🔍 Filtering matches:', validMatches.length);
    return validMatches;
  }, [matches]);

  const safeCharacterStats = useMemo(() => {
    if (!Array.isArray(characterStats)) {
      console.warn('MatchHistory: characterStats가 배열이 아닙니다:', typeof characterStats);
      return [];
    }
    return characterStats.filter(stat => stat != null);
  }, [characterStats]);

  // 📊 필터링된 매치 계산
  const filteredMatches = useMemo(() => {
    let filtered = [...safeMatches];

    // 캐릭터 필터
    if (selectedCharacter !== 'all') {
      const characterId = parseInt(selectedCharacter);
      if (!isNaN(characterId)) {
        filtered = filtered.filter(match => {
          const matchCharacterId = match?.characterId || 0;
          return matchCharacterId === characterId;
        });
      }
    }

    // 게임 모드 필터
    if (selectedGameMode !== 'all') {
      filtered = filtered.filter(match => {
        const gameMode = match?.gameMode || match?.matchingMode?.toString() || '';
        return gameMode === selectedGameMode;
      });
    }

    // 순위 필터
    if (selectedRank !== 'all') {
      filtered = filtered.filter(match => {
        const rank = match?.gameRank || 0;
        switch (selectedRank) {
          case 'win':
            return rank <= 3 && rank > 0;
          case 'top5':
            return rank <= 5 && rank > 0;
          case 'lose':
            return rank > 5;
          default:
            return true;
        }
      });
    }

    console.log('🎯 Filtered matches result:', {
      original: safeMatches.length,
      filtered: filtered.length,
      filters: { selectedCharacter, selectedGameMode, selectedRank }
    });

    return filtered;
  }, [safeMatches, selectedCharacter, selectedGameMode, selectedRank]);

  // 🔄 무한 스크롤을 위한 아이템 로딩 체크
  const isItemLoaded = useCallback((index: number) => {
    return index < filteredMatches.length;
  }, [filteredMatches.length]);

  // 📦 무한 스크롤 더 로드
  const loadMoreItems = useCallback(async () => {
    if (hasMore && onLoadMore && !isLoading) {
      console.log('🔄 Loading more matches...');
      await onLoadMore();
    }
  }, [hasMore, onLoadMore, isLoading]);

  // 🎨 매치 카드 렌더러 (React Window용)
  const MatchItem = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const match = filteredMatches[index];
    
    if (!match) {
      // 로딩 중인 아이템
      return (
        <div style={style} className="px-4 py-2">
          <div className="bg-white rounded-lg p-4 border border-dakGray-200 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-dakGray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-dakGray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-dakGray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const matchKey = match?.matchId || `match-${index}`;
    const isExpanded = expandedMatches.has(matchKey);

    const handleToggleExpand = () => {
      setExpandedMatches(prev => {
        const newSet = new Set(prev);
        if (isExpanded) {
          newSet.delete(matchKey);
        } else {
          newSet.add(matchKey);
        }
        return newSet;
      });
    };

    return (
      <div style={style} className="px-4 py-2">
        <MatchCard 
          match={match}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
          className="transition-all duration-200 hover:scale-[1.01]"
        />
      </div>
    );
  }, [filteredMatches, expandedMatches]);

  // 필터 핸들러들
  const handleCharacterChange = (character: string) => {
    setSelectedCharacter(character);
  };

  const handleGameModeChange = (gameMode: string) => {
    setSelectedGameMode(gameMode);
  };

  const handleRankChange = (rank: string) => {
    setSelectedRank(rank);
  };

  const handleResetFilters = () => {
    setSelectedCharacter('all');
    setSelectedGameMode('all');
    setSelectedRank('all');
  };

  // 🎨 로딩 상태 UI
  if (isLoading && safeMatches.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <p className="mt-2 text-dakGray-500">매치 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 🚫 데이터 없음 상태
  if (safeMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="text-xl font-semibold text-dakGray-900 mb-2">매치 기록이 없습니다</h3>
        <p className="text-dakGray-500">
          아직 플레이한 게임이 없거나 데이터를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  const itemCount = hasMore ? filteredMatches.length + 1 : filteredMatches.length;

  return (
    <div className="space-y-6">
      {/* 📊 매치 통계 요약 */}
      <div className="bg-white rounded-lg p-4 border border-dakGray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-pink-600">{safeMatches.length}</div>
            <div className="text-sm text-dakGray-500">총 게임</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {safeMatches.filter(m => (m?.gameRank || 0) <= 3 && (m?.gameRank || 0) > 0).length}
            </div>
            <div className="text-sm text-dakGray-500">승리 (1-3등)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {safeMatches.filter(m => (m?.gameRank || 0) === 1).length}
            </div>
            <div className="text-sm text-dakGray-500">1등</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {safeMatches.length > 0 
                ? ((safeMatches.filter(m => (m?.gameRank || 0) <= 3 && (m?.gameRank || 0) > 0).length / safeMatches.length) * 100).toFixed(1)
                : 0}%
            </div>
            <div className="text-sm text-dakGray-500">승률</div>
          </div>
        </div>
      </div>

      {/* 🔍 필터 컴포넌트 */}
      <MatchFilters
        selectedMode={selectedGameMode}
        selectedCharacter={selectedCharacter}
        selectedResult={selectedRank}
        onModeChange={handleGameModeChange}
        onCharacterChange={handleCharacterChange}
        onResultChange={handleRankChange}
        onReset={handleResetFilters}
      />

      {/* 📋 필터링된 결과 표시 */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-dakGray-900 mb-2">필터 조건에 맞는 게임이 없습니다</h3>
          <p className="text-dakGray-500">다른 조건으로 검색해보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-dakGray-900">
              매치 기록 ({filteredMatches.length}게임)
            </h3>
            {(selectedCharacter !== 'all' || selectedGameMode !== 'all' || selectedRank !== 'all') && (
              <button 
                onClick={handleResetFilters}
                className="text-sm text-pink-600 hover:text-pink-700 transition-colors"
              >
                필터 초기화
              </button>
            )}
          </div>

          {/* 🎮 가상화된 매치 카드 목록 */}
          <div className="bg-dakGray-50 rounded-lg border border-dakGray-200">
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={loadMoreItems}
            >
              {({ onItemsRendered, ref }: any) => (
                <List
                  ref={ref}
                  height={600} // 고정 높이 (필요에 따라 조정)
                  width="100%" // width 추가
                  itemCount={itemCount}
                  itemSize={180} // 각 매치 카드의 높이
                  onItemsRendered={onItemsRendered}
                  className="scrollbar-thin scrollbar-thumb-dakGray-300 scrollbar-track-dakGray-100"
                >
                  {MatchItem}
                </List>
              )}
            </InfiniteLoader>
            
            {/* 로딩 인디케이터 */}
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                <span className="ml-2 text-sm text-dakGray-500">더 많은 매치를 불러오는 중...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 