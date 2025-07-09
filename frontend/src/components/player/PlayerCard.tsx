// components/player/PlayerCard.tsx - 플레이어 카드 컴포넌트
import React, { memo, useCallback } from 'react';
import { PlayerSearchResult } from '../../types/player';
import { LazyImage } from '../optimized/LazyImage';

interface PlayerCardProps {
  player: PlayerSearchResult;
  onSelect: (player: PlayerSearchResult) => void;
  isSelected?: boolean;
}

export const PlayerCard = memo<PlayerCardProps>(({ 
  player, 
  onSelect, 
  isSelected = false 
}) => {
  const handleClick = useCallback(() => {
    onSelect(player);
  }, [player, onSelect]);

  return (
    <div 
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-blue-100 border-2 border-blue-500' 
          : 'bg-white hover:bg-gray-50 border border-gray-200'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <LazyImage
          src={`/images/characters/${player.characterId || 'default'}.png`}
          alt={player.nickname}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="font-semibold text-gray-900">{player.nickname}</h3>
          <p className="text-sm text-gray-500">#{player.userNum}</p>
        </div>
      </div>
    </div>
  );
});

PlayerCard.displayName = 'PlayerCard'; 