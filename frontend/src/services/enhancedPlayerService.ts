import { PlayerService } from './playerService';
import { CacheService } from './cacheService';
import { ErrorHandler } from '../utils/errorHandler';
import { PlayerDetail, PlayerMatches, PlayerRank } from '../types/player';

export class EnhancedPlayerService {
  static async getPlayerDetailWithFallback(userNum: number): Promise<PlayerDetail | null> {
    // 캐시 확인
    const cacheKey = `player_detail_${userNum}`;
    const cached = CacheService.get<PlayerDetail>(cacheKey);
    if (cached) return cached;
    try {
      const detail = await PlayerService.getPlayerDetail(userNum);
      if (detail) {
        CacheService.set(cacheKey, detail);
        return detail;
      }
      // Player not found fallback
      return await this.constructPlayerFromExternalApi(userNum);
    } catch (error) {
      return await this.constructPlayerFromExternalApi(userNum);
    }
  }
  private static async constructPlayerFromExternalApi(userNum: number): Promise<PlayerDetail | null> {
    try {
      const [matches, rank] = await Promise.all([
        PlayerService.getPlayerMatches(userNum),
        PlayerService.getPlayerRank(userNum, 22, 1)
      ]);
      if (matches.matches.length > 0) {
        const player: PlayerDetail = {
          userNum,
          nickname: matches.matches[0]?.nickname || 'Unknown',
          tier: rank?.tier || 'UNRANKED',
          rank: rank?.rank || 0,
          mmr: rank?.mmr || 0,
          totalGames: matches.totalCount,
          wins: matches.matches.filter(m => m.gameRank === 1).length,
          winRate: matches.totalCount > 0 ? (matches.matches.filter(m => m.gameRank === 1).length / matches.totalCount) * 100 : 0,
          recentMatches: matches.matches.slice(0, 10),
          isFromExternalApi: true
        };
        CacheService.set(`player_detail_${userNum}`, player, 2 * 60 * 1000);
        return player;
      }
      return null;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      return null;
    }
  }
} 