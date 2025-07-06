import axios from 'axios';
import { 
  User, 
  UserStats, 
  UserGame, 
  RankData, 
  Character, 
  PlayerStatsResponse 
} from '@/types/api';
import { API_ENDPOINTS } from '@/utils/constants';

// 백엔드 API (localhost:8080)
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터로 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 1. 닉네임 → userNum 조회
export const searchPlayer = async (nickname: string) => {
  try {
    const response = await api.get(`/players/search?nickname=${encodeURIComponent(nickname)}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error searching player:', error);
    return [];
  }
};

// 2. 유저 시즌 통계 조회 (V1)
export const getUserStats = async (userNum: number, seasonId: number) => {
  try {
    const response = await api.get(`/stats/user/${userNum}/${seasonId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
};

// 3. 유저 캐릭터별 통계 조회 (V1)
export const getUserCharacterStats = async (userNum: number, seasonId: number) => {
  try {
    const response = await api.get(`/stats/user/${userNum}/${seasonId}/characters`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user character stats:', error);
    return null;
  }
};

// 4. 유저 최근 전적 조회
export const getPlayerMatches = async (userNum: number) => {
  try {
    const response = await api.get(`/players/${userNum}/matches`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching player matches:', error);
    return [];
  }
};

// 5. 랭킹 목록 조회 (내부 DB)
export const getRanking = async (page: number = 0, size: number = 30) => {
  try {
    const response = await api.get(`/ranking?page=${page}&size=${size}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching ranking:', error);
    return [];
  }
};

// 6. 유저 개별 랭크 조회
export const getUserRank = async (userNum: number, seasonId: number, mode: number) => {
  try {
    const response = await api.get(`/bser/rank/${userNum}/${seasonId}/${mode}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return null;
  }
};

// 7. BSER 닉네임 검색 (하위호환)
export const searchPlayerBSER = async (nickname: string) => {
  try {
    const response = await api.get(`/bser/user/nickname?query=${encodeURIComponent(nickname)}`);
    return response.data.data;
  } catch (error) {
    console.error('Error searching player BSER:', error);
    return null;
  }
};

// 8. BSER 전적 조회 (하위호환)
export const getPlayerGamesBSER = async (userNum: number) => {
  try {
    const response = await api.get(`/bser/games/${userNum}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching player games BSER:', error);
    return [];
  }
};

// 9. 게임 상세 정보 (현재 null 반환 중)
export const getMatchDetail = async (gameId: number) => {
  try {
    const response = await api.get(`/matches/${gameId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching match detail:', error);
    return null;
  }
};

export default api;