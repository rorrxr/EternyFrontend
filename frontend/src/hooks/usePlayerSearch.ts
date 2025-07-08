import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlayerService } from '../services/playerService';
import { PlayerSearchResult } from '../types/player';
import { useDebounce } from '../utils/performance';

export const usePlayerSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(setSearchTerm, 500);
  const queryClient = useQueryClient();
  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError
  } = useQuery({
    queryKey: ['playerSearch', debouncedSearchTerm],
    queryFn: () => PlayerService.searchPlayer(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
  const playerDetailMutation = useMutation({
    mutationFn: (userNum: number) => PlayerService.getPlayerDetail(userNum),
    onSuccess: (data, userNum) => {
      if (data) queryClient.setQueryData(['playerDetail', userNum], data);
    },
  });
  const searchPlayer = useCallback((nickname: string) => {
    setSearchTerm(nickname);
  }, []);
  const selectPlayer = useCallback(async (player: PlayerSearchResult) => {
    try {
      await playerDetailMutation.mutateAsync(player.userNum);
      return player;
    } catch (error) {
      throw error;
    }
  }, [playerDetailMutation]);
  return {
    searchTerm,
    searchResults,
    isSearching,
    searchError,
    searchPlayer,
    selectPlayer,
    isSelectingPlayer: playerDetailMutation.isPending,
    selectPlayerError: playerDetailMutation.error
  };
}; 