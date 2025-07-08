import { apiClient } from './api';
import { CommonResponse } from '../types/api';
import { PlayerSearchResult, PlayerDetail, PlayerMatches, PlayerRank } from '../types/player';

export class PlayerService {
  static async searchPlayer(nickname: string): Promise<PlayerSearchResult[]> {
    const response = await apiClient.get<CommonResponse<PlayerSearchResult[]>>(`/api/v1/players/search?nickname=${encodeURIComponent(nickname)}`);
    return response.data.data || [];
  }
  static async getPlayerDetail(userNum: number): Promise<PlayerDetail | null> {
    const response = await apiClient.get<CommonResponse<PlayerDetail>>(`/api/v1/players/${userNum}`);
    return response.data.data || null;
  }
  static async getPlayerMatches(userNum: number): Promise<PlayerMatches> {
    const response = await apiClient.get<CommonResponse<PlayerMatches>>(`/api/v1/players/${userNum}/matches`);
    return response.data.data || { matches: [], totalCount: 0 };
  }
  static async getPlayerRank(userNum: number, season: number, teamMode: number): Promise<PlayerRank | null> {
    const response = await apiClient.get<CommonResponse<PlayerRank>>(`/api/v1/bser/rank/${userNum}/${season}/${teamMode}`);
    return response.data.data || null;
  }
} 