import axios from 'axios';

// Spring Boot 프록시 URL
const BASE_URL = 'http://localhost:8080/api/bser';
console.log('Using Spring Boot proxy server at:', BASE_URL);

const api = axios.create({ baseURL: BASE_URL });

interface CommonResponse<T> {
  code: number;
  message: string;
  status: number;
  data: T;
}

export interface NicknameData {
  userNum: number;
  nickname: string;
}

export interface BserGameDto {
  userNum: number;
  serverCode: number;
  mmr: number;
  serverRank: number;
  nickname: string;
  rank: number;
}

export interface BserRankDto {
  userNum: number;
  serverCode: number;
  mmr: number;
  serverRank: number;
  nickname: string;
  rank: number;
}

export interface UserRankData {
  userNum: number;
  serverCode: number;
  mmr: number;
  serverRank: number;
  nickname: string;
  rank: number;
}

// 1) 닉네임 검색
export const searchUser = async (nickname: string): Promise<NicknameData[]> => {
  const { data: res } = await api.get<CommonResponse<NicknameData[]>>(
    `/user/nickname?query=${encodeURIComponent(nickname)}`
  );
  console.log('Search response:', res);
  if (res.code !== 200) {
    throw new Error(res.message || '유저를 찾을 수 없습니다.');
  }
  return res.data ?? [];
};

/** 백엔드 프록시로 게임 전적만 가져오기 */
export const getBserGames = async (userNum: number): Promise<BserGameDto[]> => {
  const { data: res } = await api.get<CommonResponse<BserGameDto[]>>(`/games/${userNum}`);
  if (res.code !== 200) throw new Error(res.message);
  return res.data;
};

// 3) 랭크 정보 조회
export const getBserRank = async (
  userNum: number,
  seasonId = 31,
  mode = 3
): Promise<BserRankDto> => {
  const { data: res } = await api.get<CommonResponse<BserRankDto>>(
    `/rank/${userNum}/${seasonId}/${mode}`
  );
  if (res.code !== 200) throw new Error(res.message);
  return res.data;
};

export interface UserStats {
  userNum: number;
  nickname: string;
  rank?: number;
  mmr: number;
  totalGames: number;
  wins: number;
  averageRank: number;
  averageKills: number;
  averageAssistants: number;
}
export interface MatchDetail {
  gameId: number;
  userNum: number;
  characterNum: number;
  characterLevel: number;
  gameRank: number;
  playerKill: number;
  playerAssistant: number;
  monsterKill: number;
  bestWeapon: number;
  bestWeaponLevel: number;
  equipment: Record<string, number>;
  startDtm: string;
  duration: number;
  mmrBefore: number;
  mmrGain: number;
  mmrAfter: number;
}
export interface StatsResponse {
  summary: UserStats;
  matches: MatchDetail[];
}

export const getUserStats = async (userNum: number): Promise<StatsResponse> => {
  const res = await api.get<any>(`/user/games/${userNum}`);
  console.log('Stats response:', res.data);
  if (res.data.code !== 200) {
    throw new Error(res.data.message || '전적 정보를 불러올 수 없습니다.');
  }

  const games = res.data.userGames as any[];
  const matches: MatchDetail[] = games.map(g => ({
    gameId: g.gameId,
    userNum: g.userNum,
    characterNum: g.characterNum,
    characterLevel: g.characterLevel,
    gameRank: g.gameRank,
    playerKill: g.playerKill,
    playerAssistant: g.playerAssistant,
    monsterKill: g.monsterKill,
    bestWeapon: g.bestWeapon,
    bestWeaponLevel: g.bestWeaponLevel,
    equipment: g.equipment,
    startDtm: g.startDtm,
    duration: g.duration,
    mmrBefore: g.mmrBefore,
    mmrGain: g.mmrGain,
    mmrAfter: g.mmrAfter,
  }));

  const totalGames = games.length;
  const wins = games.filter(g => g.gameRank === 1).length;
  const sorted = [...games].sort((a,b) => new Date(b.startDtm).getTime() - new Date(a.startDtm).getTime());
  const currentMmr = sorted[0]?.mmrAfter ?? 0;
  const avgKills = totalGames ? games.reduce((s,g)=>s+g.playerKill,0)/totalGames : 0;
  const avgAssts = totalGames ? games.reduce((s,g)=>s+g.playerAssistant,0)/totalGames : 0;
  const avgRank = totalGames ? games.reduce((s,g)=>s+g.gameRank,0)/totalGames : 0;

  const summary: UserStats = {
    userNum,
    nickname: games[0]?.nickname || '',
    mmr: currentMmr,
    totalGames,
    wins,
    averageKills: avgKills,
    averageAssistants: avgAssts,
    averageRank: avgRank,
  };

  return { summary, matches };
};