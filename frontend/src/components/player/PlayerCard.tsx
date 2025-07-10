// components/player/PlayerCard.tsx - 플레이어 카드 컴포넌트
import React, { memo, useCallback } from 'react';
import { User, Trophy, TrendingUp, Clock, Star } from 'lucide-react';
import { PlayerSearchResult } from '../../types/player';
import { usePlayerStore } from '../../store/playerStore';

interface PlayerCardProps {
  player: PlayerSearchResult;
  onSelect: (player: PlayerSearchResult) => void;
  isSelected?: boolean;
  isLoading?: boolean;
  variant?: 'compact' | 'detailed';
  showStats?: boolean;
}

export const PlayerCard = memo<PlayerCardProps>(({ 
  player, 
  onSelect, 
  isSelected = false,
  isLoading = false,
  variant = 'detailed',
  showStats = true
}) => {
  const { addToRecentPlayers } = usePlayerStore();

  const handleClick = useCallback(() => {
    if (!isLoading) {
      addToRecentPlayers(player);
      onSelect(player);
    }
  }, [player, onSelect, isLoading, addToRecentPlayers]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // 플레이어 아바타 생성
  const getPlayerAvatar = () => {
    const colors = [
      'from-cyan-400 to-blue-600',
      'from-purple-400 to-pink-600',
      'from-green-400 to-emerald-600',
      'from-orange-400 to-red-600',
      'from-indigo-400 to-purple-600',
    ];
    const colorIndex = player.userNum % colors.length;
    const initial = player.nickname[0]?.toUpperCase() || 'U';
    
    return (
      <div className={`w-12 h-12 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
        {initial}
      </div>
    );
  };

  // 컴팩트 버전
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
          isSelected 
            ? 'bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-2 border-cyan-400/50' 
            : 'gaming-card hover:bg-gray-700/50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover-scale'}`}
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        tabIndex={0}
        role="button"
        aria-label={`플레이어 ${player.nickname} 선택`}
      >
        {getPlayerAvatar()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{player.nickname}</span>
          </div>
          <span className="text-sm text-gray-400">#{player.userNum}</span>
        </div>
        {isLoading && (
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    );
  }

  // 상세 버전
  return (
    <div
      className={`gaming-card p-4 cursor-pointer transition-all duration-300 relative ${
        isSelected 
          ? 'bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-2 border-cyan-400/50' 
          : 'hover:bg-gray-700/50'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover-scale'}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`플레이어 ${player.nickname} 선택`}
    >
      <div className="flex items-start gap-4">
        {getPlayerAvatar()}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{player.nickname}</h3>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              #{player.userNum}
            </span>
            {player.characterId && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                캐릭터 #{player.characterId}
              </span>
            )}
          </div>

          {/* 기본 정보만 표시 - 상세 정보는 PlayerDetail 컴포넌트에서 처리 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-cyan-400">
              <Trophy className="w-4 h-4" />
              <span>상세 정보 보기</span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 선택 상태 표시 */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
      )}
    </div>
  );
});

PlayerCard.displayName = 'PlayerCard'; 