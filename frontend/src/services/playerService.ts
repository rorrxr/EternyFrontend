import { apiClient } from './api';
import { CommonResponse } from '../types/api';
import { PlayerSearchResult, PlayerDetail, PlayerMatches, PlayerRank } from '../types/player';

export class PlayerService {
  static async searchPlayer(nickname: string): Promise<PlayerSearchResult[]> {
    try {
      const response = await apiClient.get<CommonResponse<PlayerSearchResult[]>>(`/api/v1/players/search?nickname=${encodeURIComponent(nickname)}`);
      return response.data.data || [];
    } catch (error) {
      console.error('플레이어 검색 실패:', error);
      return [];
    }
  }

  static async getPlayerDetail(userNum: number): Promise<PlayerDetail | null> {
    try {
      const response = await apiClient.get<CommonResponse<PlayerDetail>>(`/api/v1/players/${userNum}`);
      
      if (response.data.code === 404 && response.data.message === 'Player not found') {
        return await this.fetchAndCreatePlayer(userNum);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('플레이어 상세 정보 조회 실패:', error);
      return null;
    }
  }

  static async getPlayerMatches(userNum: number): Promise<PlayerMatches> {
    try {
      const response = await apiClient.get<CommonResponse<PlayerMatches>>(`/api/v1/players/${userNum}/matches`);
      return response.data.data || { matches: [], totalCount: 0 };
    } catch (error) {
      console.error('매치 히스토리 조회 실패:', error);
      return { matches: [], totalCount: 0 };
    }
  }

  static async getPlayerRank(userNum: number, season: number, teamMode: number): Promise<PlayerRank | null> {
    try {
      const response = await apiClient.get<CommonResponse<PlayerRank>>(`/api/v1/bser/rank/${userNum}/${season}/${teamMode}`);
      return response.data.data;
    } catch (error) {
      console.error('랭크 정보 조회 실패:', error);
      return null;
    }
  }

  private static async fetchAndCreatePlayer(userNum: number): Promise<PlayerDetail | null> {
    try {
      const [matchesResponse, rankResponse] = await Promise.allSettled([
        this.getPlayerMatches(userNum),
        this.getPlayerRank(userNum, 22, 1)
      ]);

      if (matchesResponse.status === 'fulfilled' && rankResponse.status === 'fulfilled') {
        return this.constructPlayerFromExternalData(userNum, matchesResponse.value, rankResponse.value);
      }
      
      return null;
    } catch (error) {
      console.error('외부 데이터로 플레이어 생성 실패:', error);
      return null;
    }
  }

  private static constructPlayerFromExternalData(
    userNum: number, 
    matches: PlayerMatches, 
    rank: PlayerRank | null
  ): PlayerDetail {
    return {
      userNum,
      nickname: matches.matches[0]?.nickname || 'Unknown',
      tier: rank?.tier || 'Unranked',
      rank: rank?.rank || 0,
      mmr: rank?.mmr || 0,
      totalGames: matches.totalCount,
      wins: matches.matches.filter(m => m.gameRank === 1).length,
      winRate: matches.totalCount > 0 ? 
        (matches.matches.filter(m => m.gameRank === 1).length / matches.totalCount) * 100 : 0,
      recentMatches: matches.matches.slice(0, 10)
    };
  }
} 