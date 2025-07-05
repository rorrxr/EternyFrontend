// src/types/api.ts

// 기본 API 응답 타입
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
  code?: string
}

// 에러 타입
export interface ApiErrorResponse {
  message: string
  code: string
  status: number
  details?: unknown
}

// 사용자 관련 타입
export interface User {
  userNum: number
  nickname: string
  mmr: number
  rank: number
  tier: number
  tierDivision: number
  level: number
}

export interface UserStats {
  seasonId: number
  matchingMode: number
  matchingTeamMode: number
  mmr: number
  nickname: string
  rank: number
  tier: number
  tierDivision: number
  totalGames: number
  totalWins: number
  totalTeamKills: number
  totalDeaths: number
  totalAssists: number
  escapeCount: number
  averageRank: number
  averageKills: number
  averageAssistants: number
  top1: number
  top2: number
  top3: number
  top5: number
  top7: number
}

export interface UserGame {
  userNum: number
  nickname: string
  gameId: number
  seasonId: number
  matchingMode: number
  matchingTeamMode: number
  characterNum: number
  characterLevel: number
  gameRank: number
  playerKill: number
  playerAssistant: number
  monsterKill: number
  bestWeapon: number
  bestWeaponLevel: number
  masteryLevel: Record<string, number>
  equipment: Record<string, number>
  versionMajor: number
  versionMinor: number
  language: string
  clientId: string
  startDtm: string
  duration: number
  mmrBefore: number
  mmrAfter: number
  mmrGain: number
  damageToPlayer: number
  damageFromPlayer: number
  damageToMonster: number
  healAmount: number
  teamNumber: number
  preMade: number
  gainedNormalMmr: number
  gainedRankMmr: number
}

// 메타데이터 타입
export interface Character {
  code: number
  name: string
  engName: string
}

export interface GameMode {
  code: number
  name: string
}

export interface Weapon {
  code: number
  name: string
  weaponType: string
}

export interface Item {
  code: number
  name: string
  itemType: string
}

// 랭킹 관련 타입
export interface RankData {
  seasonId: number
  matchingTeamMode: number
  topRankers: UserStats[]
}

export interface TopRanker extends UserStats {
  // 추가 랭킹 정보가 있다면 여기에
}

// 검색 관련 타입
export interface SearchParams {
  nickname: string
  seasonId?: number
  matchingTeamMode?: number
}

export interface SearchResult {
  user: User
  stats?: UserStats
  recentGames?: UserGame[]
}

// 통계 계산을 위한 타입
export interface PlayerPerformance {
  winRate: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  kda: number
  avgRank: number
  totalGames: number
  totalWins: number
}

export interface CharacterStats {
  characterNum: number
  characterName: string
  totalGames: number
  wins: number
  winRate: number
  avgKills: number
  avgRank: number
}

// UI 관련 타입
export interface TierInfo {
  name: string
  color: string
  level: number
}

export interface GameModeInfo {
  id: number
  name: string
  description: string
}

// 필터 및 정렬 타입
export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  key: string
  order: SortOrder
}

export interface FilterConfig {
  seasonId?: number
  teamMode?: number
  tier?: number
  characterNum?: number
}

// 페이지네이션 타입
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
  next?: number
}

// React Query 관련 타입
export interface QueryConfig {
  staleTime?: number
  cacheTime?: number
  enabled?: boolean
  refetchOnWindowFocus?: boolean
}

// 폼 관련 타입
export interface SearchFormData {
  nickname: string
}

export interface FilterFormData {
  seasonId: number
  teamMode: number
  tier?: number
}

// 상태 관리 타입
export interface AppState {
  recentSearches: string[]
  currentUser?: User
  currentStats?: UserStats
  isLoading: boolean
  error?: string
}

// 유틸리티 타입
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// 상수 타입
export const TIERS = {
  0: 'Iron',
  1: 'Bronze', 
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
  6: 'Titan',
  7: 'Immortal',
} as const

export type TierKey = keyof typeof TIERS
export type TierName = typeof TIERS[TierKey]

export const TEAM_MODES = {
  1: 'Solo',
  2: 'Duo', 
  3: 'Squad',
} as const

export type TeamModeKey = keyof typeof TEAM_MODES
export type TeamModeName = typeof TEAM_MODES[TeamModeKey]

// 이벤트 타입
export interface SearchEvent {
  type: 'search'
  payload: {
    nickname: string
    timestamp: number
  }
}

export interface NavigationEvent {
  type: 'navigation'
  payload: {
    from: string
    to: string
    timestamp: number
  }
}

export type AppEvent = SearchEvent | NavigationEvent

// 성능 최적화를 위한 타입
export interface LazyLoadConfig {
  threshold?: number
  root?: Element | null
  rootMargin?: string
}

export interface VirtualScrollConfig {
  itemHeight: number
  containerHeight: number
  buffer?: number
}

// 기존 타입들 (호환성 유지)
export interface PlayerProfileData {
  nickname: string;
  tier: string;
  wins: number;
  games: number;
  avatarUrl: string;
  kda: number;
  totalDamage: number;
}

export interface CharacterStat {
  name: string;
  winRate: number;
  kda: number;
  matches: number;
}

export interface ItemIcon {
  icon: string;
}

export interface MatchPlayer {
  nickname: string;
  characterIcon: string;
  tk: number;
  kill: number;
  death: number;
  assist: number;
  damage: number;
  animal: number;
  credit: number;
  items: ItemIcon[];
}

export interface MatchTeam {
  players: MatchPlayer[];
}

export interface MatchEntry {
  id: string;
  date: string;
  mode: string;
  teams: MatchTeam[];
}

export interface PlayerStatsResponse {
  profile: PlayerProfileData;
  characterStats: CharacterStat[];
  matchHistory: MatchEntry[];
}
