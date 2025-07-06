import { TIERS } from './constants';

/**
 * 티어와 디비전을 포맷팅
 */
export const formatTierDivision = (tier: number, division: number = 1): string => {
  const tierName = TIERS[tier as keyof typeof TIERS] || TIERS[0];
  return `${tierName} ${division}`;
};

/**
 * 승률 계산
 */
export const calculateWinRate = (wins: number, totalGames: number): number => {
  if (totalGames === 0) return 0;
  return Math.round((wins / totalGames) * 100);
};

/**
 * KDA 계산
 */
export const calculateKDA = (kills: number, deaths: number, assists: number): number => {
  if (deaths === 0) return kills + assists;
  return (kills + assists) / deaths;
};

/**
 * 숫자 포맷팅 (천 단위 콤마)
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR');
};

/**
 * 시간 포맷팅
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * 날짜 포맷팅
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};

/**
 * 순위 포맷팅
 */
export const formatRank = (rank: number): string => {
  if (rank === 1) return '🥇 1위';
  if (rank === 2) return '🥈 2위';
  if (rank === 3) return '🥉 3위';
  return `#${rank}`;
};

/**
 * 팀 모드 포맷팅
 */
export const formatTeamMode = (mode: number): string => {
  const modes = {
    1: '솔로',
    2: '듀오',
    3: '스쿼드'
  };
  return modes[mode as keyof typeof modes] || '알 수 없음';
};

/**
 * 시즌 포맷팅
 */
export const formatSeason = (seasonId: number): string => {
  return `시즌 ${seasonId}`;
}; 