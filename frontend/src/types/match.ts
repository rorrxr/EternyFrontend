// 매치 관련 기본 타입들 (player.ts와 동일하게 유지)
export interface Match {
  matchId: string;
  character: string;
  characterId: number;
  gameRank: number;
  gameMode: string;
  matchingMode: string;
  playTime: number;
  startDtm: string;
  nickname?: string;
  
  // 추가 매치 정보
  kills?: number;
  assists?: number;
  teamKills?: number;
  damageDealt?: number;
  damageTaken?: number;
  healAmount?: number;
  escapeCount?: number;
  
  // 아이템 정보
  equipment?: Equipment[];
  consumables?: Consumable[];
  
  // 팀 정보
  teamMode?: number;
  teamData?: TeamMember[];
  
  // 위치 정보
  routeIdOfStart?: number;
  routeIdOfEnd?: number;
  mmrBefore?: number;
  mmrAfter?: number;
  mmrGain?: number;
}

export interface Equipment {
  itemId: number;
  itemName: string;
  itemGrade: number;
  slotId: number;
}

export interface Consumable {
  itemId: number;
  itemName: string;
  stackCount: number;
}

export interface TeamMember {
  userNum: number;
  nickname: string;
  characterId: number;
  characterName: string;
  gameRank: number;
  kills: number;
  assists: number;
  damageDealt: number;
}

export interface PlayerMatches {
  matches: Match[];
  totalCount: number;
  hasMore?: boolean;
  nextCursor?: string;
}

// 매치 검색 및 필터링 관련 타입
export interface MatchFilter {
  gameMode?: string;
  matchingMode?: string;
  characterId?: number;
  season?: number;
  startDate?: string;
  endDate?: string;
  minRank?: number;
  maxRank?: number;
}

export interface MatchSearchParams {
  userNum: number;
  filter?: MatchFilter;
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface MatchHistoryResponse {
  matches: Match[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
  filters?: MatchFilter;
}

// 매치 통계 관련 타입
export interface MatchStats {
  totalMatches: number;
  recentMatches: number;
  winRate: number;
  averageRank: number;
  averageKills: number;
  averagePlayTime: number;
  
  // 게임 모드별 통계
  gameModeBreakdown: GameModeBreakdown[];
  
  // 캐릭터별 통계
  characterUsage: CharacterUsage[];
  
  // 최근 성과
  recentPerformance: RecentPerformance;
}

export interface GameModeBreakdown {
  gameMode: string;
  matchingMode: string;
  count: number;
  winRate: number;
  averageRank: number;
}

export interface CharacterUsage {
  characterId: number;
  characterName: string;
  count: number;
  winRate: number;
  averageRank: number;
  lastUsed: string;
}

export interface RecentPerformance {
  last10Games: {
    wins: number;
    averageRank: number;
    trend: 'improving' | 'declining' | 'stable';
    winStreak: number;
  };
  last24Hours: {
    gamesPlayed: number;
    winRate: number;
    averageRank: number;
  };
  lastWeek: {
    gamesPlayed: number;
    winRate: number;
    mmrChange: number;
  };
}

// 매치 상세 정보 관련 타입
export interface MatchDetail extends Match {
  // 추가 상세 정보
  serverName?: string;
  gameVersion?: string;
  weatherType?: string;
  restrictedAreas?: number[];
  
  // 전체 참가자 정보
  participants: ParticipantInfo[];
  
  // 타임라인 정보
  timeline?: MatchTimeline;
  
  // 이벤트 정보
  events?: MatchEvent[];
}

export interface ParticipantInfo {
  userNum: number;
  nickname: string;
  characterId: number;
  characterName: string;
  gameRank: number;
  kills: number;
  assists: number;
  damageDealt: number;
  damageTaken: number;
  healAmount: number;
  playTime: number;
  escapeCount: number;
  equipment: Equipment[];
  consumables: Consumable[];
  mmrBefore: number;
  mmrAfter: number;
  mmrGain: number;
  tier: string;
  rank: number;
}

export interface MatchTimeline {
  events: TimelineEvent[];
  duration: number;
}

export interface TimelineEvent {
  timestamp: number;
  type: 'kill' | 'death' | 'item_craft' | 'area_move' | 'level_up' | 'game_end';
  playerId?: number;
  details?: any;
}

export interface MatchEvent {
  type: 'first_blood' | 'multi_kill' | 'escape' | 'craft_legendary' | 'solo_carry';
  playerId: number;
  timestamp: number;
  description: string;
  value?: number;
} 