export interface Match {
  matchId: string;
  character: string;
  gameRank: number;
  gameMode: string;
  matchingMode: string;
  playTime: number;
  startDtm: string;
  nickname?: string;
}

export interface PlayerMatches {
  matches: Match[];
  totalCount: number;
} 