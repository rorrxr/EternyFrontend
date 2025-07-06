// API 관련 상수
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
export const CURRENT_SEASON_ID = 25; // 현재 시즌 ID

// 티어 정보
export const TIERS = [
  { value: '', label: '전체 티어' },
  { value: 'IMMORTAL', label: '이모탈', color: '#ff6b6b' },
  { value: 'TITAN', label: '타이탄', color: '#4ecdc4' },
  { value: 'DIAMOND', label: '다이아몬드', color: '#45b7d1' },
  { value: 'PLATINUM', label: '플래티넘', color: '#96ceb4' },
  { value: 'GOLD', label: '골드', color: '#ffeaa7' },
  { value: 'SILVER', label: '실버', color: '#ddd' },
  { value: 'BRONZE', label: '브론즈', color: '#cd7f32' },
] as const;

// 게임 모드
export const GAME_MODES = {
  1: "솔로",
  2: "듀오", 
  3: "스쿼드"
} as const;

// 매칭 모드
export const MATCHING_MODES = {
  NORMAL: 1,
  RANKED: 2,
  CUSTOM: 3,
} as const;

// 팀 모드
export const TEAM_MODES = {
  SOLO: 1,
  DUO: 2,
  SQUAD: 3,
} as const;

// 캐릭터 코드 (예시)
export const CHARACTERS = {
  1: { name: "재키", engName: "Jackie" },
  2: { name: "아야", engName: "Aya" },
  3: { name: "피오라", engName: "Fiora" },
  4: { name: "매그누스", engName: "Magnus" },
  5: { name: "자히르", engName: "Zahir" },
  6: { name: "나딘", engName: "Nadine" },
  7: { name: "현우", engName: "Hyunwoo" },
  8: { name: "하트", engName: "Hart" },
  9: { name: "아이솔", engName: "Isol" },
  10: { name: "리 다이린", engName: "Li Dailin" },
  11: { name: "유키", engName: "Yuki" },
  12: { name: "혜진", engName: "Hyejin" },
  13: { name: "쇼우", engName: "Shoichi" },
  14: { name: "치아키", engName: "Chiaki" },
  15: { name: "시셀라", engName: "Sissela" },
  16: { name: "실비아", engName: "Silvia" },
  17: { name: "아드리아나", engName: "Adriana" },
  18: { name: "쇼이치", engName: "Shoichi" },
  19: { name: "엠마", engName: "Emma" },
  20: { name: "레녹스", engName: "Lenox" },
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  // BSER API (기존)
  BASE_URL: import.meta.env.VITE_ER_API_URL || 'https://open-api.bser.io',
  SEARCH_USER: '/v1/user/nickname',
  USER_STATS: '/v1/user/stats',
  USER_GAMES: '/v1/user/games',
  RANKING: '/v1/rank',
  CHARACTERS: '/v1/data/Character',
  GAME_MODES: '/v1/data/GameMode',
  
  // 스프링부트 백엔드 API
  SPRING_BASE_URL: import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080',
  SPRING_SEARCH_USER: '/api/v1/players/search',
  SPRING_PLAYER_DETAIL: '/api/v1/players',
  SPRING_PLAYER_MATCHES: '/api/v1/players',
  SPRING_RANKING: '/api/v1/ranking',
  SPRING_TOP_RANKING: '/api/v1/ranking/top',
  SPRING_MATCH_DETAIL: '/api/v1/matches',
  SPRING_USER_STATS: '/api/v1/stats/user',
} as const;

// 페이지네이션
export const PAGE_SIZE = 50;
export const MAX_SEARCH_HISTORY = 10; 