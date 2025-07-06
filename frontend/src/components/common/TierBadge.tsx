import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TIERS } from '@/utils/constants';
import { formatTierDivision } from '@/utils/formatters';
import { cn } from '@/utils/helpers';

interface TierBadgeProps {
  tier: number;
  division?: number;
  mmr?: number;
  rank?: number;
  size?: 'sm' | 'md' | 'lg';
  showMMR?: boolean;
  showRank?: boolean;
  className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  division = 1,
  mmr,
  rank,
  size = 'md',
  showMMR = false,
  showRank = false,
  className
}) => {
  const tierInfo = TIERS[tier as keyof typeof TIERS] || TIERS[0];
  const tierName = formatTierDivision(tier, division);
  
  const badgeVariant = {
    0: 'iron',
    1: 'bronze', 
    2: 'silver',
    3: 'gold',
    4: 'platinum',
    5: 'diamond',
    6: 'titan',
    7: 'immortal'
  }[tier] as 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'titan' | 'immortal' || 'iron';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5', 
    lg: 'text-base px-3 py-1'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant={badgeVariant}
        className={cn(sizeClasses[size], "font-semibold text-gradient-pink shadow-pink")}
      >
        {tierName}
      </Badge>
      
      {showMMR && mmr && (
        <span className="text-sm font-medium text-dakGray-700">
          {mmr.toLocaleString()} MMR
        </span>
      )}
      
      {showRank && rank && (
        <span className="text-sm text-dakGray-500">
          #{rank.toLocaleString()}
        </span>
      )}
    </div>
  );
}; 