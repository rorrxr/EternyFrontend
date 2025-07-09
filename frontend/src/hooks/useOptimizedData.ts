// hooks/useOptimizedData.ts - 데이터 최적화 훅
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlayerService } from '../services/playerService';

export const useOptimizedPlayerData = (userNum: number | null) => {
  // 데이터 요청 최적화
  const playerQuery = useQuery({
    queryKey: ['player', userNum],
    queryFn: () => PlayerService.getPlayerDetail(userNum!),
    enabled: !!userNum,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (이전 cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // 계산된 값들 메모이제이션
  const computedStats = useMemo(() => {
    if (!playerQuery.data) return null;
    
    const player = playerQuery.data;
    return {
      winRateColor: player.winRate >= 70 ? 'text-green-500' : 
                   player.winRate >= 50 ? 'text-yellow-500' : 'text-red-500',
      rankDisplay: `${player.tier} ${player.rank}`,
      performanceGrade: player.winRate >= 70 ? 'S' :
                       player.winRate >= 60 ? 'A' :
                       player.winRate >= 50 ? 'B' : 'C',
      isTopPlayer: player.rank <= 100 && player.tier === 'IMMORTAL',
    };
  }, [playerQuery.data]);

  return {
    ...playerQuery,
    computedStats,
  };
}; 