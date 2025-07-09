// components/rank/RankChart.tsx - 랭크 차트 컴포넌트
import React from 'react';
import { PlayerRank } from '../../types/rank';
import { TrendingUp, Award, Target } from 'lucide-react';

interface RankChartProps {
  rankData: PlayerRank;
}

export const RankChart: React.FC<RankChartProps> = ({ rankData }) => {
  const getTierInfo = (tier: string) => {
    const tierMap: Record<string, { color: string; icon: string }> = {
      'IRON': { color: 'text-yellow-600', icon: '🥉' },
      'BRONZE': { color: 'text-orange-600', icon: '🥉' },
      'SILVER': { color: 'text-gray-600', icon: '🥈' },
      'GOLD': { color: 'text-yellow-500', icon: '🥇' },
      'PLATINUM': { color: 'text-emerald-600', icon: '💎' },
      'DIAMOND': { color: 'text-blue-600', icon: '💎' },
      'MYTHRIL': { color: 'text-pink-600', icon: '⭐' },
      'TITAN': { color: 'text-red-600', icon: '👑' },
      'IMMORTAL': { color: 'text-purple-600', icon: '🏆' },
    };
    return tierMap[tier] || { color: 'text-gray-500', icon: '🎯' };
  };

  const tierInfo = getTierInfo(rankData.tier);

  return (
    <div className="space-y-4">
      {/* 현재 랭크 정보 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{tierInfo.icon}</span>
          <div>
            <h4 className={`text-lg font-bold ${tierInfo.color}`}>
              {rankData.tier}
            </h4>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
               현재 시즌
             </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-500">랭크</span>
            </div>
            <div className="font-bold text-gray-900 dark:text-white">
              #{rankData.rank}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-500">MMR</span>
            </div>
            <div className="font-bold text-gray-900 dark:text-white">
              {rankData.mmr?.toLocaleString() || 'N/A'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-gray-500">LP</span>
            </div>
                         <div className="font-bold text-gray-900 dark:text-white">
               0
             </div>
          </div>
        </div>
      </div>

             {/* 추가 정보 */}
       <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
         <div className="flex justify-between items-center">
           <span className="text-sm text-gray-600 dark:text-gray-400">평균 순위</span>
           <span className="font-medium text-gray-900 dark:text-white">
             #{((rankData.rank || 0) + 1).toFixed(1)}
           </span>
         </div>
       </div>
    </div>
  );
}; 