// services/matchService.ts - 매치 관련 API 서비스
import { apiClient } from './api';
import { CommonResponse } from '../types/api';
import { CacheService } from './cacheService';
import { ErrorHandler } from '../utils/errorHandler';
import { 
  Match, 
  MatchDetail, 
  MatchHistoryResponse, 
  MatchSearchParams, 
  MatchFilter,
  MatchStats,
  PlayerMatches 
} from '../types/match';

export class MatchService {
  private static readonly CACHE_TTL = {
    MATCH_HISTORY: 3 * 60 * 1000,    // 3분
    MATCH_DETAIL: 10 * 60 * 1000,    // 10분
    MATCH_STATS: 5 * 60 * 1000,      // 5분
  };

  // 플레이어 매치 히스토리 조회
  static async getPlayerMatches(
    userNum: number, 
    params: Partial<MatchSearchParams> = {}
  ): Promise<MatchHistoryResponse> {
    const cacheKey = CacheService.generateKey('match_history', { userNum, ...params });
    
    // 캐시 확인
    const cached = CacheService.get<MatchHistoryResponse>(cacheKey);
    if (cached) {
      console.log('캐시에서 매치 히스토리 반환:', userNum);
      return cached;
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userNum', userNum.toString());
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.cursor) queryParams.append('cursor', params.cursor);
      
      // 필터 파라미터 추가
      if (params.filter) {
        const filter = params.filter;
        if (filter.gameMode) queryParams.append('gameMode', filter.gameMode);
        if (filter.matchingMode) queryParams.append('matchingMode', filter.matchingMode);
        if (filter.characterId) queryParams.append('characterId', filter.characterId.toString());
        if (filter.season) queryParams.append('season', filter.season.toString());
        if (filter.startDate) queryParams.append('startDate', filter.startDate);
        if (filter.endDate) queryParams.append('endDate', filter.endDate);
        if (filter.minRank) queryParams.append('minRank', filter.minRank.toString());
        if (filter.maxRank) queryParams.append('maxRank', filter.maxRank.toString());
      }

      const response = await apiClient.get<CommonResponse<MatchHistoryResponse>>(
        `/api/v1/matches/history?${queryParams.toString()}`
      );

      const result = response.data.data || {
        matches: [],
        totalCount: 0,
        hasMore: false,
        filters: params.filter
      };

      // 캐시 저장
      CacheService.set(cacheKey, result, this.CACHE_TTL.MATCH_HISTORY);

      return result;
    } catch (error) {
      console.error('매치 히스토리 조회 실패:', error);
      throw ErrorHandler.handleApiError(error);
    }
  }

  // 매치 상세 정보 조회
  static async getMatchDetail(matchId: string): Promise<MatchDetail | null> {
    const cacheKey = CacheService.generateKey('match_detail', { matchId });
    
    // 캐시 확인
    const cached = CacheService.get<MatchDetail>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<MatchDetail>>(
        `/api/v1/matches/${matchId}`
      );

      const result = response.data.data;
      
      if (result) {
        // 캐시 저장
        CacheService.set(cacheKey, result, this.CACHE_TTL.MATCH_DETAIL);
      }

      return result;
    } catch (error) {
      console.error('매치 상세 정보 조회 실패:', error);
      throw ErrorHandler.handleApiError(error);
    }
  }

  // 매치 통계 조회
  static async getMatchStats(
    userNum: number, 
    params: { 
      season?: number; 
      gameMode?: string; 
      period?: 'week' | 'month' | 'season' | 'all' 
    } = {}
  ): Promise<MatchStats | null> {
    const cacheKey = CacheService.generateKey('match_stats', { userNum, ...params });
    
    // 캐시 확인
    const cached = CacheService.get<MatchStats>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userNum', userNum.toString());
      
      if (params.season) queryParams.append('season', params.season.toString());
      if (params.gameMode) queryParams.append('gameMode', params.gameMode);
      if (params.period) queryParams.append('period', params.period);

      const response = await apiClient.get<CommonResponse<MatchStats>>(
        `/api/v1/matches/stats?${queryParams.toString()}`
      );

      const result = response.data.data;
      
      if (result) {
        // 캐시 저장
        CacheService.set(cacheKey, result, this.CACHE_TTL.MATCH_STATS);
      }

      return result;
    } catch (error) {
      console.error('매치 통계 조회 실패:', error);
      throw ErrorHandler.handleApiError(error);
    }
  }

  // 실시간 매치 검색 (최신 매치 확인)
  static async searchRecentMatches(
    userNum: number, 
    limit: number = 10
  ): Promise<Match[]> {
    try {
      const response = await apiClient.get<CommonResponse<{ matches: Match[] }>>(
        `/api/v1/matches/recent?userNum=${userNum}&limit=${limit}`
      );

      return response.data.data?.matches || [];
    } catch (error) {
      console.error('최근 매치 검색 실패:', error);
      return [];
    }
  }

  // 매치 필터 옵션 조회
  static async getFilterOptions(userNum: number): Promise<{
    gameModes: string[];
    matchingModes: string[];
    characters: { id: number; name: string; }[];
    seasons: number[];
  }> {
    const cacheKey = CacheService.generateKey('match_filter_options', { userNum });
    
    // 캐시 확인
    const cached = CacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<any>>(
        `/api/v1/matches/filter-options?userNum=${userNum}`
      );

      const result = response.data.data || {
        gameModes: [],
        matchingModes: [],
        characters: [],
        seasons: []
      };

      // 캐시 저장 (긴 시간)
      CacheService.set(cacheKey, result, 30 * 60 * 1000); // 30분

      return result;
    } catch (error) {
      console.error('필터 옵션 조회 실패:', error);
      return {
        gameModes: ['Normal', 'Ranked', 'Cobalt'],
        matchingModes: ['Solo', 'Duo', 'Squad'],
        characters: [],
        seasons: [22, 21, 20]
      };
    }
  }

  // 매치 비교 (두 매치 간 비교)
  static async compareMatches(
    matchId1: string, 
    matchId2: string
  ): Promise<{
    match1: MatchDetail;
    match2: MatchDetail;
    comparison: {
      performanceDiff: number;
      rankDiff: number;
      killsDiff: number;
      playTimeDiff: number;
    };
  } | null> {
    try {
      const [match1, match2] = await Promise.all([
        this.getMatchDetail(matchId1),
        this.getMatchDetail(matchId2)
      ]);

      if (!match1 || !match2) return null;

      const comparison = {
        performanceDiff: (match1.gameRank || 0) - (match2.gameRank || 0),
        rankDiff: (match1.gameRank || 0) - (match2.gameRank || 0),
        killsDiff: (match1.kills || 0) - (match2.kills || 0),
        playTimeDiff: match1.playTime - match2.playTime
      };

      return {
        match1,
        match2,
        comparison
      };
    } catch (error) {
      console.error('매치 비교 실패:', error);
      return null;
    }
  }

  // 매치 데이터 분석
  static analyzeMatches(matches: Match[]): {
    winRate: number;
    avgRank: number;
    avgKills: number;
    avgPlayTime: number;
    bestPerformance: Match;
    worstPerformance: Match;
    characterFrequency: Record<string, number>;
    gameModeFrequency: Record<string, number>;
    recentTrend: 'improving' | 'declining' | 'stable';
  } {
    if (matches.length === 0) {
      return {
        winRate: 0,
        avgRank: 0,
        avgKills: 0,
        avgPlayTime: 0,
        bestPerformance: {} as Match,
        worstPerformance: {} as Match,
        characterFrequency: {},
        gameModeFrequency: {},
        recentTrend: 'stable'
      };
    }

    const wins = matches.filter(m => m.gameRank === 1).length;
    const avgRank = matches.reduce((sum, m) => sum + m.gameRank, 0) / matches.length;
    const avgKills = matches.reduce((sum, m) => sum + (m.kills || 0), 0) / matches.length;
    const avgPlayTime = matches.reduce((sum, m) => sum + m.playTime, 0) / matches.length;

    const bestPerformance = matches.reduce((best, current) => 
      current.gameRank < best.gameRank ? current : best
    );
    
    const worstPerformance = matches.reduce((worst, current) => 
      current.gameRank > worst.gameRank ? current : worst
    );

    // 캐릭터 사용 빈도
    const characterFrequency = matches.reduce((acc, match) => {
      acc[match.character] = (acc[match.character] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 게임 모드 빈도
    const gameModeFrequency = matches.reduce((acc, match) => {
      const mode = `${match.gameMode}-${match.matchingMode}`;
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 최근 트렌드 분석
    const recentTrend = this.calculateTrend(matches.slice(0, 10));

    return {
      winRate: (wins / matches.length) * 100,
      avgRank: Math.round(avgRank * 10) / 10,
      avgKills: Math.round(avgKills * 10) / 10,
      avgPlayTime: Math.round(avgPlayTime),
      bestPerformance,
      worstPerformance,
      characterFrequency,
      gameModeFrequency,
      recentTrend
    };
  }

  // 트렌드 계산
  private static calculateTrend(matches: Match[]): 'improving' | 'declining' | 'stable' {
    if (matches.length < 5) return 'stable';

    const firstHalf = matches.slice(0, Math.floor(matches.length / 2));
    const secondHalf = matches.slice(Math.floor(matches.length / 2));

    const firstAvg = firstHalf.reduce((sum, m) => sum + m.gameRank, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.gameRank, 0) / secondHalf.length;

    const difference = firstAvg - secondAvg;

    if (difference > 1) return 'improving';
    if (difference < -1) return 'declining';
    return 'stable';
  }

  // 매치 캐시 무효화
  static invalidateCache(userNum: number): void {
    CacheService.invalidate(`match_history:userNum:${userNum}`);
    CacheService.invalidate(`match_stats:userNum:${userNum}`);
  }

  // 매치 데이터 내보내기
  static exportMatches(matches: Match[], format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(matches, null, 2);
    }

    // CSV 형식
    const headers = ['matchId', 'character', 'gameRank', 'gameMode', 'matchingMode', 'playTime', 'kills', 'startDtm'];
    const csvContent = [
      headers.join(','),
      ...matches.map(match => [
        match.matchId,
        match.character,
        match.gameRank,
        match.gameMode,
        match.matchingMode,
        match.playTime,
        match.kills || 0,
        match.startDtm
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  // 매치 데이터 가져오기 (외부 API)
  static async fetchMatchFromExternalAPI(userNum: number, matchId: string): Promise<Match | null> {
    try {
      // 외부 API 호출 시뮬레이션
      const response = await apiClient.get<CommonResponse<Match>>(
        `/api/v1/external/matches/${matchId}?userNum=${userNum}`
      );

      return response.data.data;
    } catch (error) {
      console.error('외부 API 매치 데이터 가져오기 실패:', error);
      return null;
    }
  }

  // 배치 매치 조회 (여러 매치 한 번에)
  static async getBatchMatches(matchIds: string[]): Promise<Record<string, MatchDetail>> {
    const cacheKey = CacheService.generateKey('batch_matches', { matchIds: matchIds.sort() });
    
    // 캐시 확인
    const cached = CacheService.get<Record<string, MatchDetail>>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.post<CommonResponse<Record<string, MatchDetail>>>(
        '/api/v1/matches/batch',
        { matchIds }
      );

      const result = response.data.data || {};

      // 캐시 저장
      CacheService.set(cacheKey, result, this.CACHE_TTL.MATCH_DETAIL);

      return result;
    } catch (error) {
      console.error('배치 매치 조회 실패:', error);
      return {};
    }
  }
} 