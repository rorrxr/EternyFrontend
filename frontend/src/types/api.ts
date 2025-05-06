// src/types/api.ts

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
