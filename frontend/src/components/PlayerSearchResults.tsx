import React from 'react';
import { User } from 'lucide-react';
import type { NicknameDto } from '../types/game';

interface PlayerSearchResultsProps {
  players: NicknameDto[];
  onSelectPlayer: (userNum: number) => void;
  isLoading?: boolean;
}

export const PlayerSearchResults: React.FC<PlayerSearchResultsProps> = ({
  players,
  onSelectPlayer,
  isLoading = false,
}) => {
  if (!players || players.length === 0) {
    return null;
  }

  return (
    <div className="glass-effect rounded-2xl border border-gray-700/50 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-cyan-600 to-purple-600 p-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6" />
          검색 결과
        </h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.userNum}
              className="flex items-center justify-between p-4 gaming-card hover:bg-gray-700/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {player.nickname[0].toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-white">{player.nickname}</span>
                  <span className="text-sm text-gray-400 ml-2">#{player.userNum}</span>
                </div>
              </div>
              <button
                onClick={() => onSelectPlayer(player.userNum)}
                disabled={isLoading}
                className="btn-gaming px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                선택
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 