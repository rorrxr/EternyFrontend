import React from 'react';
import { Trophy, Target, TrendingUp, Crown, Zap } from 'lucide-react';
import type { Player, BserUserDetailDto, BserCharacterStatsDto } from '../types/game';

interface EnhancedPlayerProfileProps {
  player: Player;
  stats?: BserUserDetailDto | null;
  characterStats?: BserCharacterStatsDto[];
}

export const EnhancedPlayerProfile: React.FC<EnhancedPlayerProfileProps> = ({ 
  player, 
  stats, 
  characterStats 
}) => {
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

  if (!stats) {
    return (
      <div className="glass-effect rounded-2xl border border-gray-700/50 p-8 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">통계 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🎮 메인 프로필 카드 */}
      <div className="relative overflow-hidden">
        {/* 🌟 배경 글로우 */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
        
        <div className="relative glass-effect border border-gray-700/50 overflow-hidden rounded-2xl neon-glow-hover">
          {/* 📱 헤더 */}
          <div className={`bg-gradient-to-r ${getTierGradient(stats.tier)} p-6 relative`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  <Crown className="w-10 h-10" />
                  {player.nickname}
                </h1>
                <p className="text-white/80 mt-1">플레이어 #{player.userNum}</p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-6 py-3 rounded-xl bg-gradient-to-r ${getTierGradient(stats.tier)} shadow-lg`}>
                  <span className="text-white text-xl font-bold">
                    {stats.tier} {stats.rank}
                  </span>
                </div>
                <div className="text-white/90 mt-2 text-lg">{stats.lp} LP</div>
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
                        <p className="text-2xl font-bold text-white">{stats.mmr.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* 🎯 승률 */}
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 hover-scale">
                    <div className="flex items-center gap-3">
                      <Target className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="text-sm text-green-200">승률</p>
                        <p className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* 📈 평균 순위 */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 hover-scale">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-blue-400" />
                      <div>
                        <p className="text-sm text-blue-200">평균 순위</p>
                        <p className="text-2xl font-bold text-white">{stats.averageRank.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  {/* ⚡ 평균 킬 */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 hover-scale">
                    <div className="flex items-center gap-3">
                      <Zap className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-sm text-purple-200">평균 킬</p>
                        <p className="text-2xl font-bold text-white">{stats.averageKills.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📋 상세 통계 */}
                <div className="glass-card rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">게임 통계</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-400">총 게임</p>
                      <p className="text-xl font-bold text-white">{stats.totalGames}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">승리</p>
                      <p className="text-xl font-bold text-green-400">{stats.totalWins}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">1등</p>
                      <p className="text-xl font-bold text-yellow-400">{stats.top1}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center mt-4 pt-4 border-t border-gray-700">
                    <div>
                      <p className="text-sm text-gray-400">2등</p>
                      <p className="text-lg font-semibold text-gray-300">{stats.top2}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">3등</p>
                      <p className="text-lg font-semibold text-gray-300">{stats.top3}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">팀 킬</p>
                      <p className="text-lg font-semibold text-gray-300">{stats.totalTeamKills}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">평균 어시</p>
                      <p className="text-lg font-semibold text-gray-300">{stats.averageAssistants.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📊 종합 능력치 placeholder */}
              <div className="flex justify-center items-center">
                <div className="glass-card rounded-xl p-6 border border-gray-700/50 w-full max-w-80">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">종합 능력치</h3>
                  <div className="aspect-square bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <Crown className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                      <p className="text-cyan-400 font-semibold">종합 평가</p>
                      <p className="text-2xl font-bold text-white">
                        {stats.winRate >= 70 ? 'S+' :
                         stats.winRate >= 60 ? 'S' :
                         stats.winRate >= 50 ? 'A' :
                         stats.winRate >= 40 ? 'B' : 'C'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 