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

// 사용자 검색 훅
export function useSearchUser(nickname: string, options?: QueryConfig) {
  return useQuery({
    queryKey: queryKeys.user(nickname),
    queryFn: () => api.user.search(nickname),
    enabled: !!nickname && nickname.length >= 2 && (options?.enabled ?? true),
    staleTime: config.cache.userStaleTime,
    retry: (failureCount, error) => {
      // 404 에러는 재시도하지 않음
      if (error instanceof ApiError && error.status === 404) {
        return false
      }
      return failureCount < 2
    },
    ...options,
  })
}

// 사용자 통계 훅
export function useUserStats(
  userNum: number, 
  seasonId = config.game.defaultSeasonId, 
  teamMode = config.game.teamModes.squad,
  options?: QueryConfig
) {
  return useQuery({
    queryKey: queryKeys.userStats(userNum, seasonId, teamMode),
    queryFn: () => api.user.getStats(userNum, seasonId, teamMode),
    enabled: !!userNum && userNum > 0 && (options?.enabled ?? true),
    staleTime: config.cache.userStaleTime,
    ...options,
  })
}

// 사용자 게임 기록 훅
export function useUserGames(userNum: number, next?: number, options?: QueryConfig) {
  return useQuery({
    queryKey: queryKeys.userGames(userNum, next),
    queryFn: () => api.user.getGames(userNum, next),
    enabled: !!userNum && userNum > 0 && (options?.enabled ?? true),
    staleTime: config.cache.userStaleTime,
    ...options,
  })
}

// 무한 스크롤을 위한 사용자 게임 기록 훅
export function useInfiniteUserGames(userNum: number, options?: QueryConfig) {
  return useQuery({
    queryKey: ['userGames', userNum, 'infinite'],
    queryFn: async () => {
      const games: UserGame[] = []
      let next: number | undefined = undefined
      let hasMore = true
      
      // 처음 3페이지만 가져오기
      for (let i = 0; i < 3 && hasMore; i++) {
        const result = await api.user.getGames(userNum, next)
        games.push(...result.userGames)
        next = result.next
        hasMore = result.userGames.length > 0
      }
      
      return { games, next, hasMore }
    },
    enabled: !!userNum && userNum > 0 && (options?.enabled ?? true),
    staleTime: config.cache.userStaleTime,
    ...options,
  })
}

// 랭킹 정보 훅
export function useRanking(
  seasonId = config.game.defaultSeasonId, 
  teamMode = config.game.teamModes.squad,
  options?: QueryConfig
) {
  return useQuery({
    queryKey: queryKeys.ranking(seasonId, teamMode),
    queryFn: () => api.ranking.get(seasonId, teamMode),
    staleTime: config.cache.rankingStaleTime,
    ...options,
  })
}

// 캐릭터 정보 훅
export function useCharacters(options?: QueryConfig) {
  return useQuery({
    queryKey: queryKeys.characters(),
    queryFn: api.metadata.characters,
    staleTime: config.cache.metadataStaleTime,
    ...options,
  })
}

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