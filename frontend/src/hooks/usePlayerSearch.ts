import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlayerService } from '../services/playerService';
import { PlayerSearchResult } from '../types/player';
import { useDebounce } from '../utils/performance';

export const usePlayerSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  // 검색 쿼리
  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError
  } = useQuery({
    queryKey: ['playerSearch', debouncedSearchTerm],
    queryFn: () => PlayerService.searchPlayer(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });

  // 플레이어 상세 정보 Mutation (검색 후 즉시 조회)
  const playerDetailMutation = useMutation({
    mutationFn: (userNum: number) => PlayerService.getPlayerDetail(userNum),
    onSuccess: (data, userNum) => {
      if (data) {
        // 성공 시 캐시에 저장
        queryClient.setQueryData(['playerDetail', userNum], data);
      }
    },
  });

  const searchPlayer = useCallback((nickname: string) => {
    setSearchTerm(nickname);
  }, []);

  const selectPlayer = useCallback(async (player: PlayerSearchResult) => {
    // 플레이어 선택 시 상세 정보 즉시 로드
    try {
      await playerDetailMutation.mutateAsync(player.userNum);
      return player;
    } catch (error) {
      console.error('플레이어 선택 실패:', error);
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