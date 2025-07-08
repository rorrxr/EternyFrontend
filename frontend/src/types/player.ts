export interface PlayerSearchResult {
  userNum: number;
  nickname: string;
  characterId?: number;
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
  recentMatches: any[];
  isFromExternalApi?: boolean;
}

export interface PlayerMatches {
  matches: any[];
  totalCount: number;
}

export interface PlayerRank {
  tier: string;
  rank: number;
  mmr: number;
} 