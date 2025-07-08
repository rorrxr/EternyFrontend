import { useQuery, useQueries } from '@tanstack/react-query';
import { PlayerService } from '../services/playerService';

export const usePlayerDetail = (userNum: number | null) => {
  const playerDetailQuery = useQuery({
    queryKey: ['playerDetail', userNum],
    queryFn: () => PlayerService.getPlayerDetail(userNum!),
    enabled: !!userNum,
    staleTime: 2 * 60 * 1000,
  });
  const parallelQueries = useQueries({
    queries: [
      {
        queryKey: ['playerMatches', userNum],
        queryFn: () => PlayerService.getPlayerMatches(userNum!),
        enabled: !!userNum,
        staleTime: 1 * 60 * 1000,
      },
      {
        queryKey: ['playerRank', userNum, 22, 1],
        queryFn: () => PlayerService.getPlayerRank(userNum!, 22, 1),
        enabled: !!userNum,
        staleTime: 5 * 60 * 1000,
      }
    ]
  });
  const [matchesQuery, rankQuery] = parallelQueries;
  return {
    player: playerDetailQuery.data,
    matches: matchesQuery.data,
    rank: rankQuery.data,
    isLoading: playerDetailQuery.isLoading || matchesQuery.isLoading || rankQuery.isLoading,
    error: playerDetailQuery.error || matchesQuery.error || rankQuery.error,
    refetch: () => {
      playerDetailQuery.refetch();
      matchesQuery.refetch();
      rankQuery.refetch();
    }
  };
}; 