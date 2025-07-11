// components/match/MatchHistoryList.tsx - 매치 히스토리 리스트
import React, { memo, useCallback, useMemo } from 'react';
import { Match } from '../../types/match';
import { Trophy, Clock, Users, Target, TrendingUp, TrendingDown } from 'lucide-react';

interface MatchHistoryListProps {
  matches: Match[];
  onMatchClick?: (match: Match) => void;
  showStats?: boolean;
  compact?: boolean;
  limit?: number;
}

export const MatchHistoryList: React.FC<MatchHistoryListProps> = memo(({ 
  matches, 
  onMatchClick,
  showStats = true,
  compact = false,
  limit
}) => {
  const displayMatches = useMemo(() => {
    return limit ? matches.slice(0, limit) : matches;
  }, [matches, limit]);

  const stats = useMemo(() => {
    if (!showStats || displayMatches.length === 0) return null;
    
    const wins = displayMatches.filter(m => m.gameRank === 1).length;
    const top3 = displayMatches.filter(m => m.gameRank <= 3).length;
    const avgRank = displayMatches.reduce((sum, m) => sum + m.gameRank, 0) / displayMatches.length;
    const avgKills = displayMatches.reduce((sum, m) => sum + (m.kills || 0), 0) / displayMatches.length;
    const avgPlayTime = displayMatches.reduce((sum, m) => sum + m.playTime, 0) / displayMatches.length;
    
    return {
      wins,
      winRate: (wins / displayMatches.length) * 100,
      top3Rate: (top3 / displayMatches.length) * 100,
      avgRank: Math.round(avgRank * 10) / 10,
      avgKills: Math.round(avgKills * 10) / 10,
      avgPlayTime: Math.round(avgPlayTime)
    };
  }, [displayMatches, showStats]);

  const handleMatchClick = useCallback((match: Match) => {
    if (onMatchClick) {
      onMatchClick(match);
    }
  }, [onMatchClick]);

  const getRankColor = useCallback((rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank <= 3) return 'bg-gray-400 text-white';
    if (rank <= 8) return 'bg-blue-500 text-white';
    return 'bg-red-500 text-white';
  }, []);

  const getRankIcon = useCallback((rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4" />;
    if (rank <= 3) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  }, []);

  const getCharacterImage = useCallback((character: string) => {
    // 캐릭터 이미지 URL을 반환하는 함수
    return `/images/characters/${character.toLowerCase()}.png`;
  }, []);

  if (displayMatches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          <Clock className="w-8 h-8 mx-auto mb-2" />
          <p>매치 히스토리가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 통계 섹션 */}
      {stats && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {stats.wins}승
              </div>
              <div className="text-sm text-gray-500">승수</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">승률</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {stats.top3Rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Top 3</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {stats.avgRank}
              </div>
              <div className="text-sm text-gray-500">평균 등수</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {stats.avgKills}
              </div>
              <div className="text-sm text-gray-500">평균 킬</div>
            </div>
          </div>
        </div>
      )}

      {/* 매치 리스트 */}
      <div className="space-y-2">
        {displayMatches.map((match, index) => (
          <div
            key={match.matchId}
            className={`
              bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
              transition-all duration-200 hover:shadow-md
              ${onMatchClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
              ${compact ? 'p-3' : 'p-4'}
            `}
            onClick={() => handleMatchClick(match)}
          >
            <div className="flex items-center justify-between">
              {/* 왼쪽: 캐릭터 + 기본 정보 */}
              <div className="flex items-center space-x-3">
                {/* 등수 배지 */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${getRankColor(match.gameRank)}
                `}>
                  {match.gameRank <= 3 ? getRankIcon(match.gameRank) : match.gameRank}
                </div>

                {/* 캐릭터 이미지 */}
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={getCharacterImage(match.character)}
                    alt={match.character}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/characters/default.png';
                    }}
                  />
                </div>

                {/* 매치 정보 */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {match.character}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {match.gameMode} • {match.matchingMode}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    {match.kills !== undefined && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <Target className="w-4 h-4" />
                        <span>{match.kills}킬</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{match.playTime}분</span>
                    </div>
                    {match.teamData && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{match.teamData.length}명</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 날짜 + MMR 변화 */}
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(match.startDtm)}
                </div>
                {match.mmrGain !== undefined && (
                  <div className={`text-sm font-semibold ${
                    match.mmrGain > 0 ? 'text-green-600' : 
                    match.mmrGain < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {match.mmrGain > 0 ? '+' : ''}{match.mmrGain} MMR
                  </div>
                )}
              </div>
            </div>

            {/* 아이템 정보 (컴팩트 모드가 아닐 때) */}
            {!compact && match.equipment && match.equipment.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">아이템:</span>
                  <div className="flex space-x-1">
                    {match.equipment.slice(0, 6).map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                        title={item.itemName}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          item.itemGrade === 5 ? 'bg-orange-500' :
                          item.itemGrade === 4 ? 'bg-purple-500' :
                          item.itemGrade === 3 ? 'bg-blue-500' :
                          item.itemGrade === 2 ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 더 보기 버튼 */}
      {limit && matches.length > limit && (
        <div className="text-center pt-4">
          <button className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            더 보기 ({matches.length - limit}경기 더 있음)
          </button>
        </div>
      )}
    </div>
  );
});

MatchHistoryList.displayName = 'MatchHistoryList'; 