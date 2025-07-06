import React from 'react';
import { User } from 'lucide-react';
import type { BserCharacterStatsDto } from '../types/game';

interface CharacterStatsProps {
  characterStats: BserCharacterStatsDto[];
}

export const CharacterStats: React.FC<CharacterStatsProps> = ({ characterStats }) => {
  if (!characterStats || characterStats.length === 0) {
    return null;
  }

  // 게임 수 기준으로 정렬
  const sortedStats = [...characterStats].sort((a, b) => b.totalGames - a.totalGames);

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 60) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (winRate >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="glass-effect rounded-2xl border border-gray-700/50 overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-600 to-purple-600 p-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6" />
          캐릭터 통계
        </h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStats.slice(0, 9).map((character) => (
            <div 
              key={character.characterCode} 
              className="gaming-card p-4 hover:bg-gray-700/50 transition-all duration-300 hover-scale"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {character.characterName[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{character.characterName}</h4>
                  <p className="text-sm text-gray-400">{character.totalGames}게임</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">승률</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getWinRateColor(character.winRate)}`}>
                    {character.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">평균 순위</span>
                  <span className="font-medium text-white">{character.averageRank.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">평균 킬</span>
                  <span className="font-medium text-white">{character.averageKills.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 