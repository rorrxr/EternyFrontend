import React, { useState, useMemo, useCallback } from 'react';
import { Trophy, ChevronDown, ChevronUp, Filter, Calendar, Target } from 'lucide-react';
import { BserGameDto } from '../types/game';
import { useInfiniteScroll, createVirtualizedList } from '../utils/performance';
import { LoadingState, EmptyState } from './common/LoadingSpinner';

interface MatchHistoryTableProps {
  matches: BserGameDto[];
  title?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  showFilters?: boolean;
  onFilterChange?: (filters: MatchFilters) => void;
}

interface MatchFilters {
  gameMode?: number;
  characterId?: number;
  minRank?: number;
  maxRank?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const MatchHistoryTable: React.FC<MatchHistoryTableProps> = ({ 
  matches, 
  title = "최근 경기",
  isLoading = false,
  hasMore = false,
  onLoadMore,
  showFilters = false,
  onFilterChange
}) => {
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [visibleMatches, setVisibleMatches] = useState(10);
  const [filters, setFilters] = useState<MatchFilters>({});

  // 무한 스크롤 설정
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, isLoading]);

  const lastElementRef = useInfiniteScroll(
    handleLoadMore,
    hasMore,
    isLoading
  );

  // 필터링된 매치 계산
  const filteredMatches = useMemo(() => {
    let filtered = matches;

    if (filters.gameMode !== undefined) {
      filtered = filtered.filter(match => match.matchingMode === filters.gameMode);
    }

    if (filters.characterId !== undefined) {
      filtered = filtered.filter(match => match.characterNum === filters.characterId);
    }

    if (filters.minRank !== undefined) {
      filtered = filtered.filter(match => match.gameRank >= filters.minRank!);
    }

    if (filters.maxRank !== undefined) {
      filtered = filtered.filter(match => match.gameRank <= filters.maxRank!);
    }

    return filtered;
  }, [matches, filters]);

  // 가상화된 리스트 생성
  const virtualizedList = useMemo(() => {
    const visibleItems = filteredMatches.slice(0, visibleMatches);
    return createVirtualizedList(visibleItems, 80); // 각 아이템 높이 80px
  }, [filteredMatches, visibleMatches]);

  // 유틸리티 함수들 (메모이제이션)
  const getRankColor = useCallback((rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank <= 3) return "from-gray-300 to-gray-500";
    if (rank <= 8) return "from-green-400 to-green-600";
    return "from-red-400 to-red-600";
  }, []);

  const getGameModeColor = useCallback((mode: number) => {
    const modes: { [key: number]: string } = {
      0: "bg-blue-100/20 text-blue-300 border-blue-400/30",
      1: "bg-purple-100/20 text-purple-300 border-purple-400/30",
      2: "bg-green-100/20 text-green-300 border-green-400/30",
      3: "bg-orange-100/20 text-orange-300 border-orange-400/30",
    };
    return modes[mode] || "bg-gray-100/20 text-gray-300 border-gray-400/30";
  }, []);

  const getGameModeName = useCallback((teamMode: number) => {
    switch (teamMode) {
      case 1: return "솔로";
      case 2: return "듀오";
      case 3: return "스쿼드";
      default: return "기타";
    }
  }, []);

  const formatGameTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  }, []);

  const toggleMatchExpansion = useCallback((gameId: number) => {
    setExpandedMatch(prev => prev === gameId ? null : gameId);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<MatchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  }, [filters, onFilterChange]);

  const loadMoreMatches = useCallback(() => {
    setVisibleMatches(prev => prev + 10);
  }, []);

  // 로딩 상태
  if (isLoading && matches.length === 0) {
    return <LoadingState type="matches" text="매치 기록을 불러오는 중..." />;
  }

  // 빈 상태
  if (matches.length === 0) {
    return (
      <EmptyState
        title="매치 기록이 없습니다"
        message="아직 플레이한 게임이 없거나 데이터를 불러올 수 없습니다"
      />
    );
  }

  return (
    <div className="glass-effect rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-cyan-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            {title}
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {filteredMatches.length}게임
            </span>
          </h2>
          
          {showFilters && (
            <button
              onClick={() => {/* 필터 토글 로직 */}}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              필터
            </button>
          )}
        </div>
      </div>

      {/* 필터 섹션 */}
      {showFilters && (
        <div className="p-4 bg-gray-800/30 border-b border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.gameMode || ''}
              onChange={(e) => handleFilterChange({ gameMode: e.target.value ? Number(e.target.value) : undefined })}
              className="gaming-input text-sm"
            >
              <option value="">모든 게임 모드</option>
              <option value="1">솔로</option>
              <option value="2">듀오</option>
              <option value="3">스쿼드</option>
            </select>

            <select
              value={filters.minRank || ''}
              onChange={(e) => handleFilterChange({ minRank: e.target.value ? Number(e.target.value) : undefined })}
              className="gaming-input text-sm"
            >
              <option value="">최소 순위</option>
              <option value="1">1위</option>
              <option value="3">3위 이상</option>
              <option value="8">8위 이상</option>
            </select>

            <select
              value={filters.maxRank || ''}
              onChange={(e) => handleFilterChange({ maxRank: e.target.value ? Number(e.target.value) : undefined })}
              className="gaming-input text-sm"
            >
              <option value="">최대 순위</option>
              <option value="1">1위</option>
              <option value="3">3위 이하</option>
              <option value="8">8위 이하</option>
            </select>

            <button
              onClick={() => handleFilterChange({})}
              className="btn-gaming text-sm px-4 py-2 rounded-lg"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}
      
      {/* 매치 리스트 */}
      <div className="divide-y divide-gray-700/50">
        {virtualizedList.items.map((match, index) => (
          <div 
            key={match.gameId}
            ref={index === virtualizedList.items.length - 1 ? lastElementRef : null}
          >
            <div
              className="p-4 hover:bg-gray-800/30 cursor-pointer transition-all duration-300"
              onClick={() => toggleMatchExpansion(match.gameId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* 순위 */}
                  <div className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getRankColor(match.gameRank)} text-white shadow-lg`}>
                    #{match.gameRank}
                  </div>

                  {/* 캐릭터 */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {match.characterName ? match.characterName[0] : 'C'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {match.characterName || `캐릭터 ${match.characterNum}`}
                      </div>
                      <div className="text-sm text-gray-400">
                        레벨 {match.masteryLevel?.[match.characterNum] || 1}
                      </div>
                    </div>
                  </div>

                  {/* 게임 모드 */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getGameModeColor(match.matchingMode)}`}>
                    {getGameModeName(match.teamMode)}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  {/* KDA */}
                  <div className="text-center">
                    <div className="text-sm text-gray-400">K/A</div>
                    <div className="font-semibold text-cyan-400">
                      {match.playerKill}/{match.playerAssistant}
                    </div>
                  </div>

                  {/* 팀 킬 */}
                  <div className="text-center">
                    <div className="text-sm text-gray-400">팀 킬</div>
                    <div className="font-semibold text-white">{match.teamKill}</div>
                  </div>

                  {/* 플레이 시간 */}
                  <div className="text-center">
                    <div className="text-sm text-gray-400">시간</div>
                    <div className="font-semibold text-white">{formatGameTime(match.playTime)}</div>
                  </div>

                  {/* 확장 버튼 */}
                  <button className="text-gray-400 hover:text-white transition-colors">
                    {expandedMatch === match.gameId ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 확장된 상세 정보 */}
            {expandedMatch === match.gameId && (
              <div className="px-4 pb-4 bg-gray-800/30 border-t border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      게임 정보
                    </h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div>게임 ID: {match.gameId}</div>
                      <div>서버: {match.serverName || 'Unknown'}</div>
                      <div>팀 순위: #{match.teamRank || match.gameRank}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      주무기
                    </h4>
                    <div className="text-sm text-cyan-400">
                      {match.bestWeaponName || `무기 ${match.bestWeapon}`}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">장비</h4>
                    <div className="flex gap-1 flex-wrap">
                      {match.equipment?.slice(0, 6).map((item, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-1 text-xs bg-gray-700/50 border border-gray-600/30 rounded text-gray-300"
                        >
                          {item.itemName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      {visibleMatches < filteredMatches.length && (
        <div className="p-4 text-center border-t border-gray-700/50">
          <button
            onClick={loadMoreMatches}
            className="btn-gaming px-6 py-2 rounded-xl transition-all duration-300"
          >
            더보기 ({filteredMatches.length - visibleMatches}게임 남음)
          </button>
        </div>
      )}

      {/* 무한 스크롤 로딩 */}
      {isLoading && matches.length > 0 && (
        <div className="p-4 text-center border-t border-gray-700/50">
          <LoadingState type="matches" variant="spinner" text="추가 매치를 불러오는 중..." />
        </div>
      )}
    </div>
  );
}; 