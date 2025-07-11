// 매치 관련 타입들을 match.ts에서 가져오기
import type { 
  Match, 
  Equipment, 
  Consumable, 
  TeamMember, 
  PlayerMatches 
} from './match';

export interface PlayerSearchResult {
  userNum: number;
  nickname: string;
  characterId?: number;
  lastPlayedDate?: string;
  tier?: string;
  rank?: number;
  profileImageUrl?: string;
  isOnline?: boolean;
}

export interface PlayerDetail {
  userNum: number;
  nickname: string;
  tier: string;
  rank: number;
  mmr: number;
  totalGames: number;
  wins: number;
  winRate: number;
  recentMatches: Match[];
  isFromExternalApi?: boolean;
  updatedAt?: string;
  profileImageUrl?: string;
  
  // 추가 통계 정보
  averageRank?: number;
  averageKills?: number;
  averagePlayTime?: number;
  mostPlayedCharacter?: string;
  recentFormRating?: number; // 최근 폼 등급
  
  // 시즌 정보
  currentSeasonStats?: SeasonStats;
  seasonHistory?: SeasonStats[];
}

export interface SeasonStats {
  season: number;
  tier: string;
  rank: number;
  mmr: number;
  totalGames: number;
  wins: number;
  winRate: number;
  topRank?: number;
  peakMMR?: number;
}

// Match 관련 타입들은 match.ts에서 가져옴
export type { Match, Equipment, Consumable, TeamMember, PlayerMatches };

export interface PlayerRank {
  tier: string;
  rank: number;
  mmr: number;
  lp?: number;
  
  // 추가 랭크 정보
  tierDivision?: string;
  promotionProgress?: number;
  isPromotion?: boolean;
  isDemotion?: boolean;
  
  // 랭크 히스토리
  mmrHistory?: MmrHistoryPoint[];
  rankMovement?: RankMovement[];
}

export interface MmrHistoryPoint {
  date: string;
  mmr: number;
  rank: number;
  tier: string;
}

export interface RankMovement {
  date: string;
  fromTier: string;
  toTier: string;
  fromRank: number;
  toRank: number;
  mmrChange: number;
}

// 통계 관련 타입
export interface PlayerStats {
  totalGames: number;
  wins: number;
  winRate: number;
  averageRank: number;
  averageKills: number;
  averageAssists: number;
  averagePlayTime: number;
  
  // 캐릭터별 통계
  characterStats: CharacterStats[];
  
  // 게임 모드별 통계
  gameModeStats: GameModeStats[];
  
  // 최근 성과
  recentPerformance: PerformanceMetrics;
}

export interface CharacterStats {
  characterId: number;
  characterName: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  averageRank: number;
  averageKills: number;
  averagePlayTime: number;
  lastPlayedDate: string;
}

export interface GameModeStats {
  gameMode: string;
  matchingMode: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  averageRank: number;
}

export interface PerformanceMetrics {
  last10Games: {
    wins: number;
    averageRank: number;
    trend: 'up' | 'down' | 'stable';
  };
  last30Days: {
    gamesPlayed: number;
    winRate: number;
    mmrChange: number;
  };
  bestPerformance: {
    bestWinStreak: number;
    bestRank: number;
    bestMMR: number;
  };
} 