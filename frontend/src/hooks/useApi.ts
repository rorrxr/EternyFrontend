import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../lib/api/client'
import { config } from '../lib/config'
import type { 
  User, 
  UserStats, 
  UserGame, 
  RankData, 
  Character, 
  GameMode,
  QueryConfig 
} from '../types/api'
import { apiService } from '@/services/api'

// 쿼리 키 팩토리
export const queryKeys = {
  // 사용자 관련
  user: (nickname: string) => ['user', nickname] as const,
  userStats: (userNum: number, seasonId: number, teamMode: number) => 
    ['userStats', userNum, seasonId, teamMode] as const,
  userGames: (userNum: number, next?: number) => 
    ['userGames', userNum, next] as const,
  
  // 랭킹 관련
  ranking: (seasonId: number, teamMode: number) => 
    ['ranking', seasonId, teamMode] as const,
  
  // 메타데이터
  characters: () => ['characters'] as const,
  gameModes: () => ['gameModes'] as const,
} as const

// 플레이어 전적 검색 (기존 방식)
export const usePlayerStats = (nickname: string, enabled = true) => {
  return useQuery({
    queryKey: ['playerStats', nickname],
    queryFn: () => apiService.getPlayerStats(nickname),
    enabled: enabled && !!nickname.trim(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: 1,
  });
};

// 사용자 검색 (실제 API)
export const useSearchUser = (nickname: string, enabled = true) => {
  return useQuery({
    queryKey: ['searchUser', nickname],
    queryFn: () => apiService.searchUser(nickname),
    enabled: enabled && !!nickname.trim(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// 사용자 통계
export const useUserStats = (userNum: number, seasonId: number, teamMode: number, enabled = true) => {
  return useQuery({
    queryKey: ['userStats', userNum, seasonId, teamMode],
    queryFn: () => apiService.getUserStats(userNum, seasonId, teamMode),
    enabled: enabled && !!userNum,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// 사용자 게임 기록
export const useUserGames = (userNum: number, enabled = true) => {
  return useQuery({
    queryKey: ['userGames', userNum],
    queryFn: () => apiService.getUserGames(userNum),
    enabled: enabled && !!userNum,
    staleTime: 1 * 60 * 1000,
    retry: 1,
  });
};

// 랭킹 데이터
export const useRanking = (seasonId: number, teamMode: number) => {
  return useQuery({
    queryKey: ['ranking', seasonId, teamMode],
    queryFn: () => apiService.getRanking(seasonId, teamMode),
    staleTime: 10 * 60 * 1000, // 10분
    retry: 1,
  });
};

// 캐릭터 목록
export const useCharacters = () => {
  return useQuery({
    queryKey: ['characters'],
    queryFn: () => apiService.getCharacters(),
    staleTime: 60 * 60 * 1000, // 1시간
    retry: 1,
  });
};

// 게임 모드 정보 훅
export function useGameModes(options?: QueryConfig) {
  return useQuery({
    queryKey: queryKeys.gameModes(),
    queryFn: api.metadata.gameModes,
    staleTime: config.cache.metadataStaleTime,
    ...options,
  })
}

// 사용자 검색 뮤테이션 (최근 검색어 저장 포함)
export function useSearchUserMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (nickname: string) => {
      const user = await api.user.search(nickname)
      
      // 최근 검색어에 추가 (로컬 스토리지)
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      const updated = [nickname, ...recent.filter((n: string) => n !== nickname)]
        .slice(0, config.game.maxRecentSearches)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      
      return user
    },
    onSuccess: (user) => {
      // 성공 시 사용자 정보를 캐시에 저장
      queryClient.setQueryData(queryKeys.user(user.nickname), user)
      
      // 간단한 알림 (실제 프로젝트에서는 toast 라이브러리 사용)
      console.log(`검색 완료: ${user.nickname} 플레이어를 찾았습니다.`)
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        console.error('검색 실패:', error.message)
      } else {
        console.error('오류 발생:', '예상치 못한 오류가 발생했습니다.')
      }
    },
  })
}

// 플레이어 종합 정보 훅 (사용자 + 통계 + 최근 게임)
export function usePlayerProfile(
  nickname: string,
  seasonId = config.game.defaultSeasonId,
  teamMode = config.game.teamModes.squad
) {
  const { data: user, isLoading: userLoading, error: userError } = useSearchUser(nickname)
  
  const { data: stats, isLoading: statsLoading } = useUserStats(
    user?.userNum || 0,
    seasonId,
    teamMode,
    { enabled: !!user?.userNum }
  )
  
  const { data: gamesData, isLoading: gamesLoading } = useUserGames(
    user?.userNum || 0,
    undefined,
    { enabled: !!user?.userNum }
  )
  
  return {
    user,
    stats,
    games: gamesData?.userGames || [],
    isLoading: userLoading || statsLoading || gamesLoading,
    error: userError,
    hasData: !!user,
  }
}

// 캐시 무효화 유틸리티
export function useInvalidateQueries() {
  const queryClient = useQueryClient()
  
  return {
    invalidateUser: (nickname: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(nickname) })
    },
    invalidateUserStats: (userNum: number, seasonId: number, teamMode: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userStats(userNum, seasonId, teamMode) })
    },
    invalidateUserGames: (userNum: number) => {
      queryClient.invalidateQueries({ queryKey: ['userGames', userNum] })
    },
    invalidateRanking: (seasonId: number, teamMode: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ranking(seasonId, teamMode) })
    },
    invalidateAll: () => {
      queryClient.invalidateQueries()
    },
  }
}

// 프리페치 유틸리티
export function usePrefetchQueries() {
  const queryClient = useQueryClient()
  
  return {
    prefetchUser: (nickname: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.user(nickname),
        queryFn: () => api.user.search(nickname),
        staleTime: config.cache.userStaleTime,
      })
    },
    prefetchRanking: (seasonId: number, teamMode: number) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.ranking(seasonId, teamMode),
        queryFn: () => api.ranking.get(seasonId, teamMode),
        staleTime: config.cache.rankingStaleTime,
      })
    },
  }
} 