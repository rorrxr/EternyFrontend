// components/PopularSearches.tsx - 인기 검색어 컴포넌트
import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { TrendingUp, Search, Clock, Users, Star, Crown, Flame } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { EnhancedPlayerService } from '../services/enhancedPlayerService';

interface PopularSearchesProps {
  onSearchTermClick: (term: string) => void;
  showRecentSearches?: boolean;
  showTrendingPlayers?: boolean;
  limit?: number;
}

interface TrendingPlayer {
  nickname: string;
  tier: string;
  rank: number;
  change: number;
  isRising: boolean;
}

export const PopularSearches: React.FC<PopularSearchesProps> = memo(({
  onSearchTermClick,
  showRecentSearches = true,
  showTrendingPlayers = true,
  limit = 8
}) => {
  const { searchHistory, recentPlayers } = usePlayerStore();
  const [trendingPlayers, setTrendingPlayers] = useState<TrendingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 인기 검색어 (정적 데이터)
  const popularTerms = useMemo(() => [
    { term: 'Faker', category: 'pro', icon: <Crown className="w-4 h-4" /> },
    { term: 'Hide on bush', category: 'pro', icon: <Crown className="w-4 h-4" /> },
    { term: 'Dopa', category: 'pro', icon: <Crown className="w-4 h-4" /> },
    { term: 'Canyon', category: 'pro', icon: <Crown className="w-4 h-4" /> },
    { term: 'Showmaker', category: 'pro', icon: <Crown className="w-4 h-4" /> },
    { term: 'Keria', category: 'pro', icon: <Crown className="w-4 h-4" /> },
    { term: 'Chovy', category: 'pro', icon: <Crown className="w-4 h-4" /> },
    { term: 'Ruler', category: 'pro', icon: <Crown className="w-4 h-4" /> },
  ], []);

  // 트렌딩 플레이어 데이터 로드
  useEffect(() => {
    const loadTrendingPlayers = async () => {
      if (!showTrendingPlayers) return;
      
      setIsLoading(true);
      try {
        // 실제 API 호출 대신 모의 데이터 사용
        const mockTrendingPlayers: TrendingPlayer[] = [
          { nickname: 'RisingStarPlayer', tier: 'IMMORTAL', rank: 1, change: 15, isRising: true },
          { nickname: 'ClimbingFast', tier: 'TITAN', rank: 23, change: 8, isRising: true },
          { nickname: 'TopPlayer2024', tier: 'IMMORTAL', rank: 5, change: -3, isRising: false },
          { nickname: 'MetaBreaker', tier: 'MYTHRIL', rank: 156, change: 12, isRising: true },
          { nickname: 'ConsistentWins', tier: 'DIAMOND', rank: 45, change: 6, isRising: true },
        ];
        
        setTimeout(() => {
          setTrendingPlayers(mockTrendingPlayers);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('트렌딩 플레이어 로드 실패:', error);
        setIsLoading(false);
      }
    };

    loadTrendingPlayers();
  }, [showTrendingPlayers]);

  const handleSearchClick = useCallback((term: string) => {
    onSearchTermClick(term);
  }, [onSearchTermClick]);

  const getTierColor = useCallback((tier: string) => {
    const tierColors: Record<string, string> = {
      'IRON': 'text-amber-600',
      'BRONZE': 'text-orange-600',
      'SILVER': 'text-gray-600',
      'GOLD': 'text-yellow-600',
      'PLATINUM': 'text-emerald-600',
      'DIAMOND': 'text-blue-600',
      'MYTHRIL': 'text-pink-600',
      'TITAN': 'text-red-600',
      'IMMORTAL': 'text-purple-600',
    };
    return tierColors[tier] || 'text-gray-600';
  }, []);

  const getTierIcon = useCallback((tier: string) => {
    if (['IMMORTAL', 'TITAN'].includes(tier)) return <Star className="w-4 h-4" />;
    if (['MYTHRIL', 'DIAMOND'].includes(tier)) return <TrendingUp className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">인기 검색어</h2>
        <p className="text-slate-400">많이 검색되는 플레이어들을 확인해보세요</p>
      </div>

      {/* 인기 검색어 */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
                          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-white">인기 검색어</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {popularTerms.slice(0, limit).map((item, index) => (
            <button
              key={item.term}
              onClick={() => handleSearchClick(item.term)}
              className="flex items-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                  {index + 1}
                </span>
                <div className="text-orange-400">{item.icon}</div>
                <span className="text-sm text-slate-300 group-hover:text-white truncate">
                  {item.term}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 최근 검색어 */}
      {showRecentSearches && searchHistory.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">최근 검색어</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 6).map((term, index) => (
              <button
                key={index}
                onClick={() => handleSearchClick(term)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 최근 조회한 플레이어 */}
      {recentPlayers.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-white">최근 조회한 플레이어</h3>
          </div>
          
          <div className="space-y-3">
            {recentPlayers.slice(0, 3).map((player) => (
              <button
                key={player.userNum}
                onClick={() => handleSearchClick(player.nickname)}
                className="w-full flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {player.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-white group-hover:text-blue-400">
                    {player.nickname}
                  </div>
                  <div className="text-xs text-slate-400">
                    #{player.userNum}
                  </div>
                </div>
                {player.tier && (
                  <div className={`text-xs font-medium ${getTierColor(player.tier)}`}>
                    {player.tier}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 트렌딩 플레이어 */}
      {showTrendingPlayers && (
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-white">트렌딩 플레이어</h3>
            <span className="text-xs text-slate-400">최근 급상승 중</span>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-600 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-slate-600 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-slate-600 rounded w-12"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {trendingPlayers.slice(0, 5).map((player, index) => (
                <button
                  key={player.nickname}
                  onClick={() => handleSearchClick(player.nickname)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-400 w-4">
                      {index + 1}
                    </span>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {player.nickname.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white group-hover:text-purple-400">
                      {player.nickname}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={getTierColor(player.tier)}>
                        {player.tier}
                      </span>
                      <span className="text-slate-400">
                        #{player.rank}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      player.isRising ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {player.isRising ? '+' : ''}{player.change}
                    </div>
                    <div className="text-xs text-slate-400">
                      {player.isRising ? '상승' : '하락'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 팁 섹션 */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-800/30">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">검색 팁</h3>
        </div>
        
        <div className="space-y-2 text-sm text-slate-300">
          <p>• 정확한 닉네임을 입력하면 더 빠르게 검색할 수 있습니다.</p>
          <p>• 대소문자를 구분하지 않으며, 일부만 입력해도 검색됩니다.</p>
          <p>• 최근 검색한 플레이어는 자동으로 저장됩니다.</p>
        </div>
      </div>
    </div>
  );
});

PopularSearches.displayName = 'PopularSearches'; 