// 🎮 이터널리턴 게임 타입 정의

export interface NicknameDto {
  userNum: number;
  nickname: string;
}

export interface Player {
  userNum: number;
  nickname: string;
}

export interface BserUserDetailDto {
  userNum: number;
  nickname: string;
  tier: string;
  rank: number;
  lp: number;
  mmr: number;
  winRate: number;
  averageRank: number;
  averageKills: number;
  averageAssistants: number;
  totalGames: number;
  totalWins: number;
  top1: number;
  top2: number;
  top3: number;
  totalTeamKills: number;
}

export interface BserGameDto {
  gameId: number;
  gameRank: number;
  characterName: string;
  characterNum: number;
  matchingMode: number;
  teamMode: number;
  playerKill: number;
  playerAssistant: number;
  teamKill: number;
  playTime: number;
  bestWeaponName: string;
  bestWeapon: number;
  masteryLevel: { [key: number]: number };
  equipment: Array<{
    itemName: string;
    itemCode?: number;
  }>;
  serverName?: string;
  teamRank?: number;
}

export interface BserCharacterStatsDto {
  characterCode: number;
  characterName: string;
  totalGames: number;
  winRate: number;
  averageRank: number;
  averageKills: number;
  totalWins?: number;
  totalKills?: number;
}

export interface BserRankDto {
  userNum: number;
  seasonId: number;
  tier: string;
  rank: number;
  lp: number;
  mmr: number;
}

export interface Match {
  gameId: number;
  victory: boolean;
  gameRank: number;
  gameMode: string;
  playTime: number;
  characterName: string;
  characterNum: number;
  masteryLevel: { [key: number]: number };
  playerKill: number;
  playerAssistant: number;
  teamKill: number;
  bestWeaponName: string;
  equipment: Array<{
    itemName: string;
  }>;
}

// API 응답 공통 인터페이스
export interface CommonResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

// 레이더 차트 데이터
export interface RadarChartData {
  label: string;
  value: number;
  maxValue: number;
}

// 티어 타입
export type TierType = 
  | "Iron" 
  | "Bronze" 
  | "Silver" 
  | "Gold" 
  | "Platinum" 
  | "Diamond" 
  | "Mythril" 
  | "Titan" 
  | "Immortal"; 