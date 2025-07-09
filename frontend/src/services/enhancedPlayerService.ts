import { apiClient } from './api';
import { PlayerService } from './playerService';
import { CacheService } from './cacheService';
import { ErrorHandler, ErrorType } from '../utils/errorHandler';
import { CommonResponse } from '../types/api';
import { PlayerSearchResult, PlayerDetail, PlayerMatches, PlayerRank } from '../types/player';

export class EnhancedPlayerService {
  private static readonly CACHE_TTL = {
    SEARCH: 5 * 60 * 1000,      // 5분
    PLAYER_DETAIL: 10 * 60 * 1000, // 10분
    MATCHES: 3 * 60 * 1000,      // 3분
    RANK: 15 * 60 * 1000         // 15분
  };

  static async searchPlayerWithCache(nickname: string): Promise<PlayerSearchResult[]> {
    const cacheKey = CacheService.generateKey('player_search', { nickname });
    
    // 캐시 확인
    const cached = CacheService.get<PlayerSearchResult[]>(cacheKey);
    if (cached) {
      console.log('캐시에서 검색 결과 반환:', nickname);
      return cached;
    }

    try {
      const result = await PlayerService.searchPlayer(nickname);
      
      // 결과가 있을 때만 캐시 저장
      if (result.length > 0) {
        CacheService.set(cacheKey, result, this.CACHE_TTL.SEARCH);
      }
      
      return result;
    } catch (error) {
      // 네트워크 오류 시 캐시된 데이터라도 반환 시도
      const staleCache = CacheService.getLocal<PlayerSearchResult[]>(cacheKey);
      if (staleCache) {
        console.warn('네트워크 오류로 stale 캐시 데이터 반환');
        return staleCache;
      }
      
      throw ErrorHandler.handleApiError(error);
    }
  }

  static async getPlayerDetailWithFallback(userNum: number): Promise<PlayerDetail | null> {
    const cacheKey = CacheService.generateKey('player_detail', { userNum });
    
    // 캐시 확인
    const cached = CacheService.get<PlayerDetail>(cacheKey);
    if (cached) return cached;

    try {
      // 1차: 내부 DB에서 조회
      const response = await apiClient.get<CommonResponse<PlayerDetail>>(
        `/api/v1/players/${userNum}`
      );

      if (response.data.data) {
        CacheService.set(cacheKey, response.data.data, this.CACHE_TTL.PLAYER_DETAIL);
        return response.data.data;
      }

      // 2차: "Player not found" 케이스 - 외부 API에서 데이터 구성
      if (response.data.code === 404 && response.data.message === 'Player not found') {
        console.log('내부 DB에 없는 플레이어, 외부 API에서 데이터 구성 시도');
        return await this.constructPlayerFromExternalApi(userNum);
      }

      return null;
    } catch (error) {
      // 심각한 오류 시에도 외부 API 시도
      console.warn('플레이어 상세 조회 실패, 외부 API 폴백 시도');
      return await this.constructPlayerFromExternalApi(userNum);
    }
  }

  private static async constructPlayerFromExternalApi(userNum: number): Promise<PlayerDetail | null> {
    try {
      // 병렬로 매치와 랭크 데이터 요청
      const [matches, rank] = await Promise.allSettled([
        this.getPlayerMatchesWithCache(userNum),
        this.getPlayerRankWithCache(userNum, 22, 1)
      ]);

      if (matches.status === 'fulfilled' && matches.value.matches.length > 0) {
        const constructedPlayer = this.buildPlayerFromExternalData(
          userNum,
          matches.value,
          rank.status === 'fulfilled' ? rank.value : null
        );

        // 외부 API로 구성한 데이터도 캐시에 저장 (짧은 TTL)
        const cacheKey = CacheService.generateKey('player_detail', { userNum });
        CacheService.set(cacheKey, constructedPlayer, 2 * 60 * 1000); // 2분만 캐시

        return constructedPlayer;
      }

      throw ErrorHandler.createError(
        ErrorType.PLAYER_NOT_FOUND,
        '플레이어 데이터를 찾을 수 없습니다.'
      );
    } catch (error) {
      console.error('외부 API를 통한 플레이어 데이터 구성 실패:', error);
      return null;
    }
  }

  // 나머지 메서드들도 비슷하게 캐싱 적용...
  static async getPlayerMatchesWithCache(userNum: number): Promise<PlayerMatches> {
    const cacheKey = CacheService.generateKey('player_matches', { userNum });
    
    const cached = CacheService.get<PlayerMatches>(cacheKey);
    if (cached) return cached;

    try {
      const result = await PlayerService.getPlayerMatches(userNum);
      CacheService.set(cacheKey, result, this.CACHE_TTL.MATCHES);
      return result;
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  static async getPlayerRankWithCache(userNum: number, season: number, teamMode: number): Promise<PlayerRank | null> {
    const cacheKey = CacheService.generateKey('player_rank', { userNum, season, teamMode });
    
    const cached = CacheService.get<PlayerRank>(cacheKey);
    if (cached) return cached;

    try {
      const result = await PlayerService.getPlayerRank(userNum, season, teamMode);
      if (result) {
        CacheService.set(cacheKey, result, this.CACHE_TTL.RANK);
      }
      return result;
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  private static buildPlayerFromExternalData(
    userNum: number, 
    matches: PlayerMatches, 
    rank: PlayerRank | null
  ): PlayerDetail {
    const recentMatches = matches.matches.slice(0, 10);
    const wins = recentMatches.filter(m => m.gameRank === 1).length;
    
    return {
      userNum,
      nickname: recentMatches[0]?.nickname || 'Unknown',
      tier: rank?.tier || 'UNRANKED',
      rank: rank?.rank || 0,
      mmr: rank?.mmr || 0,
      totalGames: matches.totalCount,
      wins,
      winRate: matches.totalCount > 0 ? (wins / recentMatches.length) * 100 : 0,
      recentMatches,
      isFromExternalApi: true // 외부 API 데이터임을 표시
    };
  }
} 