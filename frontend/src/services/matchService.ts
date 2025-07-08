import { apiClient } from './api';
import { CommonResponse } from '../types/api';
import { PlayerMatches } from '../types/match';

export class MatchService {
  static async getPlayerMatches(userNum: number): Promise<PlayerMatches> {
    const response = await apiClient.get<CommonResponse<PlayerMatches>>(`/api/v1/players/${userNum}/matches`);
    return response.data.data || { matches: [], totalCount: 0 };
  }
} 