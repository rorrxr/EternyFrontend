import { apiClient } from './api';
import { CommonResponse } from '../types/api';
import { PlayerRank } from '../types/rank';

export class RankService {
  static async getPlayerRank(userNum: number, season: number, teamMode: number): Promise<PlayerRank | null> {
    const response = await apiClient.get<CommonResponse<PlayerRank>>(`/api/v1/bser/rank/${userNum}/${season}/${teamMode}`);
    return response.data.data || null;
  }
} 