import React, { useEffect } from 'react';
import { Trophy, Target, TrendingUp, Crown, Zap, User, Calendar, Shield } from 'lucide-react';
import { PlayerDetail } from '../types/player';
import { usePlayerDetail } from '../hooks/usePlayerDetail';
import { usePlayerStore } from '../store/playerStore';
import { LoadingState, ErrorState } from './common/LoadingSpinner';
import { TierBadge } from './common/TierBadge';

interface EnhancedPlayerProfileProps {
  playerNum: number;
  nickname: string;
  showMatchHistory?: boolean;
  onMatchHistoryLoad?: (matches: any[]) => void;
}

export const EnhancedPlayerProfile: React.FC<EnhancedPlayerProfileProps> = ({ 
  playerNum,
  nickname,
  showMatchHistory = false,
  onMatchHistoryLoad
}) => {
  const { addToRecentPlayers } = usePlayerStore();
  
  const {
    player: playerDetail,
    matches: playerMatches,
    rank: playerRank,
    isLoading,
    error,
    refetch
  } = usePlayerDetail(playerNum);

  // 플레이어를 최근 목록에 추가
  useEffect(() => {
    if (playerDetail) {
      addToRecentPlayers({
        userNum: playerDetail.userNum,
        nickname: playerDetail.nickname,
        characterId: undefined
      });
    }
  }, [playerDetail, addToRecentPlayers]);

  // 매치 히스토리 콜백
  useEffect(() => {
    if (playerMatches && onMatchHistoryLoad) {
      onMatchHistoryLoad(playerMatches.matches);
    }
  }, [playerMatches, onMatchHistoryLoad]);

  // 🎨 티어별 그라디언트
  const getTierGradient = (tier: string) => {
    const gradients: { [key: string]: string } = {
      Iron: "from-gray-600 to-gray-800",
      Bronze: "from-amber-600 to-amber-800",
      Silver: "from-gray-300 to-gray-500",
      Gold: "from-yellow-400 to-yellow-600",
      Platinum: "from-cyan-400 to-cyan-600",
      Diamond: "from-blue-400 to-blue-600",
      Mythril: "from-purple-400 to-purple-600",
      Titan: "from-red-500 to-red-700",
      Immortal: "from-pink-400 via-purple-500 to-cyan-400",
    };
    return gradients[tier] || "from-gray-600 to-gray-800";
  };

  const getPerformanceGrade = (winRate: number, mmr: number) => {
    if (winRate >= 70 && mmr >= 6000) return { grade: 'S+', color: 'text-yellow-400' };
    if (winRate >= 60 && mmr >= 5000) return { grade: 'S', color: 'text-cyan-400' };
    if (winRate >= 50 && mmr >= 4000) return { grade: 'A', color: 'text-green-400' };
    if (winRate >= 40 && mmr >= 3000) return { grade: 'B', color: 'text-blue-400' };
    return { grade: 'C', color: 'text-gray-400' };
  };

  // 로딩 상태
  if (isLoading) {
    return <LoadingState type="profile" text="플레이어 정보를 불러오는 중..." />;
  }

  // 에러 상태
  if (error) {
    return (
      <ErrorState
        title="플레이어 정보를 불러올 수 없습니다"
        message={error.message || "네트워크 연결을 확인하고 다시 시도해주세요"}
        onRetry={refetch}
      />
    );
  }

  // 플레이어 정보가 없는 경우
  if (!playerDetail) {
    return (
      <ErrorState
        title="플레이어를 찾을 수 없습니다"
        message="존재하지 않는 플레이어이거나 정보를 불러올 수 없습니다"
        onRetry={refetch}
      />
    );
  }

  const performanceGrade = getPerformanceGrade(playerDetail.winRate, playerDetail.mmr);

  return (
    <div className="space-y-6">
      {/* 🎮 메인 프로필 카드 */}
      <div className="relative overflow-hidden">
        {/* 🌟 배경 글로우 */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
        
        <div className="relative glass-effect border border-gray-700/50 overflow-hidden rounded-2xl neon-glow-hover">
          {/* 📱 헤더 */}
          <div className={`bg-gradient-to-r ${getTierGradient(playerDetail.tier)} p-6 relative`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {playerDetail.nickname[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                    {playerDetail.nickname}
                    {playerDetail.isFromExternalApi && (
                      <span className="text-sm bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full border border-orange-500/30">
                        외부 API
                      </span>
                    )}
                  </h1>
                  <p className="text-white/80 mt-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    플레이어 #{playerDetail.userNum}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-6 py-3 rounded-xl bg-gradient-to-r ${getTierGradient(playerDetail.tier)} shadow-lg`}>
                  <span className="text-white text-xl font-bold">
                    {playerDetail.tier} {playerDetail.rank}
                  </span>
                </div>
                <div className="text-white/90 mt-2 text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {playerDetail.mmr.toLocaleString()} MMR
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 📊 통계 정보 */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* 🏆 MMR */}
                  <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 hover-scale">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-yellow-400" />
                      <div>
                        <p className="text-sm text-yellow-200">MMR</p>
                        <p className="text-2xl font-bold text-white">{playerDetail.mmr.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* 🎯 승률 */}
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 hover-scale">
                    <div className="flex items-center gap-3">
                      <Target className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="text-sm text-green-200">승률</p>
                        <p className="text-2xl font-bold text-white">{playerDetail.winRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* 📈 순위 */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 hover-scale">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-blue-400" />
                      <div>
                        <p className="text-sm text-blue-200">현재 순위</p>
                        <p className="text-2xl font-bold text-white">#{playerDetail.rank}</p>
                      </div>
                    </div>
                  </div>

                  {/* ⚡ 총 게임 수 */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 hover-scale">
                    <div className="flex items-center gap-3">
                      <Zap className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-sm text-purple-200">총 게임</p>
                        <p className="text-2xl font-bold text-white">{playerDetail.totalGames.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📋 상세 통계 */}
                <div className="glass-card rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    게임 통계
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-400">총 게임</p>
                      <p className="text-xl font-bold text-white">{playerDetail.totalGames.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">승리</p>
                      <p className="text-xl font-bold text-green-400">{playerDetail.wins.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">승률</p>
                      <p className="text-xl font-bold text-yellow-400">{playerDetail.winRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">최근 매치</span>
                      <span className="text-sm text-cyan-400">
                        {playerMatches ? `${playerMatches.matches.length}게임` : '로딩 중...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📊 종합 능력치 */}
              <div className="flex justify-center items-center">
                <div className="glass-card rounded-xl p-6 border border-gray-700/50 w-full max-w-80">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5" />
                    종합 능력치
                  </h3>
                  <div className="aspect-square bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <Crown className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                      <p className="text-cyan-400 font-semibold">종합 평가</p>
                      <p className={`text-4xl font-bold ${performanceGrade.color}`}>
                        {performanceGrade.grade}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {playerDetail.tier} 티어
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 추가 정보 섹션 */}
      {playerDetail.isFromExternalApi && (
        <div className="glass-effect rounded-xl p-4 border border-orange-500/30 bg-orange-500/10">
          <div className="flex items-center gap-2 text-orange-300">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">
              이 플레이어는 외부 API를 통해 조회된 정보입니다. 일부 데이터가 제한될 수 있습니다.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 