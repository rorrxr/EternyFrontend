import axios from 'axios';

// BSER API 직접 호출 (프록시 없이)
const bserApi = axios.create({
  baseURL: 'https://open-api.bser.io',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터로 에러 처리
bserApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('BSER API Error:', error);
    return Promise.reject(error);
  }
);

// BSER API - 유저 검색 (Get User Number)
export async function searchPlayer(nickname: string) {
  try {
    const response = await bserApi.get(`/v1/user/nickname?query=${encodeURIComponent(nickname)}`);
    return response.data.user ? [response.data.user] : [];
  } catch (error) {
    console.error('Error searching player:', error);
    return [];
  }
}

// BSER API - Top Rankers
export async function fetchTopRankers(seasonId: number, teamMode: number) {
  try {
    const response = await bserApi.get(`/v1/rank/top/${seasonId}/${teamMode}`);
    return response.data.topRanks || [];
  } catch (error) {
    console.error('Error fetching top rankers:', error);
    // API 에러 시 임시 데이터 반환
    return [
      { userNum: 1, nickname: "Player1", rank: 1, mmr: 2500 },
      { userNum: 2, nickname: "Player2", rank: 2, mmr: 2400 },
      { userNum: 3, nickname: "Player3", rank: 3, mmr: 2300 },
      { userNum: 4, nickname: "Player4", rank: 4, mmr: 2200 },
      { userNum: 5, nickname: "Player5", rank: 5, mmr: 2100 },
    ];
  }
}

// BSER API - 유저 랭크 조회
export async function getUserRank(userNum: number, seasonId: number, teamMode: number) {
  try {
    const response = await bserApi.get(`/v1/rank/${userNum}/${seasonId}/${teamMode}`);
    return response.data.userRank;
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return null;
  }
}

// BSER API - 유저 통계 조회
export async function getUserStats(userNum: number, seasonId: number) {
  try {
    const response = await bserApi.get(`/v1/user/stats/${userNum}/${seasonId}`);
    return response.data.userStats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
}

// BSER API - 유저 게임 기록 조회
export async function getUserGames(userNum: number) {
  try {
    const response = await bserApi.get(`/v1/user/games/${userNum}`);
    return response.data.userGames || [];
  } catch (error) {
    console.error('Error fetching user games:', error);
    return [];
  }
}

// BSER API - 게임 상세 정보 조회
export async function getGameDetail(gameId: number) {
  try {
    const response = await bserApi.get(`/v1/games/${gameId}`);
    return response.data.userGames || [];
  } catch (error) {
    console.error('Error fetching game detail:', error);
    return [];
  }
}

export default bserApi; 