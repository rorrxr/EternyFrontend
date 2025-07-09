// components/player/PlayerDetailCard.tsx - 플레이어 상세 카드
import React from 'react';
import { PlayerDetail } from '../../types/player';
import { Trophy, Target, TrendingUp, Calendar } from 'lucide-react';

interface PlayerDetailCardProps {
  player: PlayerDetail;
  isFromExternalApi?: boolean;
}

export const PlayerDetailCard: React.FC<PlayerDetailCardProps> = ({ 
  player, 
  isFromExternalApi = false 
}) => {
  const getTierColorClass = (tier: string) => {
    const tierMap: Record<string, string> = {
      'IRON': 'tier-iron',
      'BRONZE': 'tier-bronze',
      'SILVER': 'tier-silver',
      'GOLD': 'tier-gold',
      'PLATINUM': 'tier-platinum',
      'DIAMOND': 'tier-diamond',
      'MYTHRIL': 'tier-mythril',
      'TITAN': 'tier-titan',
      'IMMORTAL': 'tier-immortal',
    };
    return tierMap[tier] || 'tier-iron';
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return 'text-green-500';
    if (winRate >= 60) return 'text-blue-500';
    if (winRate >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="card">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {player.nickname.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {player.nickname}
            </h1>
            <p className="text-gray-500 dark:text-slate-400">#{player.userNum}</p>
            {isFromExternalApi && (
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  실시간 데이터
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* 티어 배지 */}
        <div className={`px-4 py-2 rounded-xl border-2 font-bold text-lg ${getTierColorClass(player.tier)}`}>
          {player.tier} {player.rank > 0 ? `#${player.rank}` : ''}
        </div>
      </div>

      {/* 통계 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">승률</span>
          </div>
          <div className={`text-2xl font-bold ${getWinRateColor(player.winRate)}`}>
            {player.winRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">승수</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {player.wins}승
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">총 게임</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {player.totalGames}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">MMR</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {player.mmr.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 최근 매치 프리뷰 */}
      {player.recentMatches && player.recentMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            최근 경기
          </h3>
          <div className="space-y-2">
            {player.recentMatches.slice(0, 3).map((match, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    match.gameRank === 1 ? 'bg-yellow-500' : 
                    match.gameRank <= 3 ? 'bg-gray-400' : 'bg-red-500'
                  }`}>
                    {match.gameRank}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {match.character || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.gameMode} • {match.matchingMode}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {match.playTime}분
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(match.startDtm).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 