// services/rankService.ts - 랭크 관련 API 서비스
import { apiClient } from './api';
import { CommonResponse } from '../types/api';
import { CacheService } from './cacheService';
import { ErrorHandler } from '../utils/errorHandler';
import { PlayerRank, MmrHistoryPoint, RankMovement } from '../types/player';

export class RankService {
  private static readonly CACHE_TTL = {
    CURRENT_RANK: 15 * 60 * 1000,    // 15분
    RANK_HISTORY: 60 * 60 * 1000,    // 1시간
    LEADERBOARD: 10 * 60 * 1000,     // 10분
    RANK_DISTRIBUTION: 30 * 60 * 1000, // 30분
  };

  // 현재 랭크 정보 조회
  static async getCurrentRank(
    userNum: number, 
    season: number = 22, 
    teamMode: number = 1
  ): Promise<PlayerRank | null> {
    const cacheKey = CacheService.generateKey('current_rank', { userNum, season, teamMode });
    
    // 캐시 확인
    const cached = CacheService.get<PlayerRank>(cacheKey);
    if (cached) {
      console.log('캐시에서 랭크 정보 반환:', userNum);
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<PlayerRank>>(
        `/api/v1/bser/rank/${userNum}/${season}/${teamMode}`
      );

      const result = response.data.data;
      
      if (result) {
        // 캐시 저장
        CacheService.set(cacheKey, result, this.CACHE_TTL.CURRENT_RANK);
      }

      return result;
    } catch (error) {
      console.error('랭크 정보 조회 실패:', error);
      throw ErrorHandler.handleApiError(error);
    }
  }

  // MMR 히스토리 조회
  static async getMmrHistory(
    userNum: number, 
    season: number = 22, 
    teamMode: number = 1,
    period: 'week' | 'month' | 'season' = 'month'
  ): Promise<MmrHistoryPoint[]> {
    const cacheKey = CacheService.generateKey('mmr_history', { userNum, season, teamMode, period });
    
    // 캐시 확인
    const cached = CacheService.get<MmrHistoryPoint[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<{ history: MmrHistoryPoint[] }>>(
        `/api/v1/bser/rank/${userNum}/${season}/${teamMode}/history?period=${period}`
      );

      const result = response.data.data?.history || [];
      
      // 캐시 저장
      CacheService.set(cacheKey, result, this.CACHE_TTL.RANK_HISTORY);

      return result;
    } catch (error) {
      console.error('MMR 히스토리 조회 실패:', error);
      return [];
    }
  }

  // 랭크 변동 히스토리 조회
  static async getRankMovements(
    userNum: number, 
    season: number = 22, 
    teamMode: number = 1,
    limit: number = 10
  ): Promise<RankMovement[]> {
    const cacheKey = CacheService.generateKey('rank_movements', { userNum, season, teamMode, limit });
    
    // 캐시 확인
    const cached = CacheService.get<RankMovement[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<{ movements: RankMovement[] }>>(
        `/api/v1/bser/rank/${userNum}/${season}/${teamMode}/movements?limit=${limit}`
      );

      const result = response.data.data?.movements || [];
      
      // 캐시 저장
      CacheService.set(cacheKey, result, this.CACHE_TTL.RANK_HISTORY);

      return result;
    } catch (error) {
      console.error('랭크 변동 히스토리 조회 실패:', error);
      return [];
    }
  }

  // 리더보드 조회
  static async getLeaderboard(
    season: number = 22, 
    teamMode: number = 1,
    page: number = 1,
    limit: number = 100
  ): Promise<{
    rankings: Array<{
      rank: number;
      userNum: number;
      nickname: string;
      tier: string;
      mmr: number;
      lp?: number;
      winRate: number;
      totalGames: number;
    }>;
    totalCount: number;
    hasMore: boolean;
  }> {
    const cacheKey = CacheService.generateKey('leaderboard', { season, teamMode, page, limit });
    
    // 캐시 확인
    const cached = CacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<any>>(
        `/api/v1/bser/rank/leaderboard/${season}/${teamMode}?page=${page}&limit=${limit}`
      );

      const result = response.data.data || {
        rankings: [],
        totalCount: 0,
        hasMore: false
      };
      
      // 캐시 저장
      CacheService.set(cacheKey, result, this.CACHE_TTL.LEADERBOARD);

      return result;
    } catch (error) {
      console.error('리더보드 조회 실패:', error);
      return {
        rankings: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  // 랭크 분포 조회
  static async getRankDistribution(
    season: number = 22, 
    teamMode: number = 1
  ): Promise<{
    distribution: Array<{
      tier: string;
      count: number;
      percentage: number;
    }>;
    totalPlayers: number;
  }> {
    const cacheKey = CacheService.generateKey('rank_distribution', { season, teamMode });
    
    // 캐시 확인
    const cached = CacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<any>>(
        `/api/v1/bser/rank/distribution/${season}/${teamMode}`
      );

      const result = response.data.data || {
        distribution: [],
        totalPlayers: 0
      };
      
      // 캐시 저장
      CacheService.set(cacheKey, result, this.CACHE_TTL.RANK_DISTRIBUTION);

      return result;
    } catch (error) {
      console.error('랭크 분포 조회 실패:', error);
      return {
        distribution: this.getDefaultDistribution(),
        totalPlayers: 0
      };
    }
  }

  // 사용자 랭크 주변 플레이어 조회
  static async getNearbyPlayers(
    userNum: number, 
    season: number = 22, 
    teamMode: number = 1,
    range: number = 5
  ): Promise<Array<{
    rank: number;
    userNum: number;
    nickname: string;
    tier: string;
    mmr: number;
    isCurrentUser: boolean;
  }>> {
    const cacheKey = CacheService.generateKey('nearby_players', { userNum, season, teamMode, range });
    
    // 캐시 확인
    const cached = CacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<any>>(
        `/api/v1/bser/rank/${userNum}/${season}/${teamMode}/nearby?range=${range}`
      );

      const result = response.data.data || [];
      
      // 캐시 저장
      CacheService.set(cacheKey, result, this.CACHE_TTL.CURRENT_RANK);

      return result;
    } catch (error) {
      console.error('주변 플레이어 조회 실패:', error);
      return [];
    }
  }

  // 티어별 통계 조회
  static async getTierStats(
    tier: string, 
    season: number = 22, 
    teamMode: number = 1
  ): Promise<{
    tier: string;
    totalPlayers: number;
    averageMMR: number;
    minMMR: number;
    maxMMR: number;
    averageWinRate: number;
    averageGamesPlayed: number;
    topPlayers: Array<{
      userNum: number;
      nickname: string;
      rank: number;
      mmr: number;
    }>;
  }> {
    const cacheKey = CacheService.generateKey('tier_stats', { tier, season, teamMode });
    
    // 캐시 확인
    const cached = CacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<any>>(
        `/api/v1/bser/rank/tier/${tier}/${season}/${teamMode}/stats`
      );

      const result = response.data.data || {
        tier,
        totalPlayers: 0,
        averageMMR: 0,
        minMMR: 0,
        maxMMR: 0,
        averageWinRate: 0,
        averageGamesPlayed: 0,
        topPlayers: []
      };
      
      // 캐시 저장
      CacheService.set(cacheKey, result, this.CACHE_TTL.RANK_DISTRIBUTION);

      return result;
    } catch (error) {
      console.error('티어 통계 조회 실패:', error);
      return {
        tier,
        totalPlayers: 0,
        averageMMR: 0,
        minMMR: 0,
        maxMMR: 0,
        averageWinRate: 0,
        averageGamesPlayed: 0,
        topPlayers: []
      };
    }
  }

  // 랭크 예측 (현재 MMR 기반)
  static async predictRank(
    userNum: number, 
    season: number = 22, 
    teamMode: number = 1,
    targetWins: number = 10
  ): Promise<{
    currentRank: number;
    currentMMR: number;
    predictedRank: number;
    predictedMMR: number;
    mmrNeeded: number;
    estimatedGames: number;
    confidence: number;
  } | null> {
    const cacheKey = CacheService.generateKey('rank_prediction', { userNum, season, teamMode, targetWins });
    
    // 캐시 확인
    const cached = CacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<any>>(
        `/api/v1/bser/rank/${userNum}/${season}/${teamMode}/predict?targetWins=${targetWins}`
      );

      const result = response.data.data;
      
      if (result) {
        // 캐시 저장 (짧은 시간)
        CacheService.set(cacheKey, result, 5 * 60 * 1000);
      }

      return result;
    } catch (error) {
      console.error('랭크 예측 실패:', error);
      return null;
    }
  }

  // 랭크 시즌 정보 조회
  static async getSeasonInfo(season: number = 22): Promise<{
    season: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    totalPlayers: number;
    averageMMR: number;
    topTierThreshold: number;
  }> {
    const cacheKey = CacheService.generateKey('season_info', { season });
    
    // 캐시 확인
    const cached = CacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get<CommonResponse<any>>(
        `/api/v1/bser/season/${season}/info`
      );

      const result = response.data.data || {
        season,
        startDate: '',
        endDate: '',
        isActive: false,
        totalPlayers: 0,
        averageMMR: 0,
        topTierThreshold: 0
      };
      
      // 캐시 저장 (긴 시간)
      CacheService.set(cacheKey, result, 60 * 60 * 1000);

      return result;
    } catch (error) {
      console.error('시즌 정보 조회 실패:', error);
      return {
        season,
        startDate: '',
        endDate: '',
        isActive: false,
        totalPlayers: 0,
        averageMMR: 0,
        topTierThreshold: 0
      };
    }
  }

  // 랭크 분석 (종합)
  static analyzeRank(
    rank: PlayerRank, 
    mmrHistory: MmrHistoryPoint[], 
    rankMovements: RankMovement[]
  ): {
    currentStatus: 'rising' | 'falling' | 'stable';
    mmrTrend: 'increasing' | 'decreasing' | 'stable';
    volatility: 'high' | 'medium' | 'low';
    consistency: number;
    peakMMR: number;
    lowestMMR: number;
    averageChange: number;
    recentPerformance: 'excellent' | 'good' | 'average' | 'poor';
    projectedTier: string;
  } {
    // MMR 트렌드 분석
    const mmrTrend = this.analyzeMmrTrend(mmrHistory);
    
    // 변동성 분석
    const volatility = this.analyzeVolatility(mmrHistory);
    
    // 일관성 분석
    const consistency = this.calculateConsistency(mmrHistory);
    
    // 피크/최저 MMR
    const mmrValues = mmrHistory.map(h => h.mmr);
    const peakMMR = Math.max(...mmrValues);
    const lowestMMR = Math.min(...mmrValues);
    
    // 평균 변화량
    const averageChange = this.calculateAverageChange(mmrHistory);
    
    // 최근 성과
    const recentPerformance = this.assessRecentPerformance(mmrHistory.slice(-10));
    
    // 예상 티어
    const projectedTier = this.predictTier(rank.mmr, mmrTrend);
    
    // 현재 상태
    const currentStatus = rankMovements.length > 0 ? 
      this.determineCurrentStatus(rankMovements) : 'stable';

    return {
      currentStatus,
      mmrTrend,
      volatility,
      consistency,
      peakMMR,
      lowestMMR,
      averageChange,
      recentPerformance,
      projectedTier
    };
  }

  // MMR 트렌드 분석
  private static analyzeMmrTrend(mmrHistory: MmrHistoryPoint[]): 'increasing' | 'decreasing' | 'stable' {
    if (mmrHistory.length < 3) return 'stable';
    
    const recent = mmrHistory.slice(-5);
    const first = recent[0].mmr;
    const last = recent[recent.length - 1].mmr;
    const difference = last - first;
    
    if (difference > 50) return 'increasing';
    if (difference < -50) return 'decreasing';
    return 'stable';
  }

  // 변동성 분석
  private static analyzeVolatility(mmrHistory: MmrHistoryPoint[]): 'high' | 'medium' | 'low' {
    if (mmrHistory.length < 5) return 'low';
    
    const mmrValues = mmrHistory.map(h => h.mmr);
    const variance = this.calculateVariance(mmrValues);
    
    if (variance > 100) return 'high';
    if (variance > 50) return 'medium';
    return 'low';
  }

  // 일관성 계산
  private static calculateConsistency(mmrHistory: MmrHistoryPoint[]): number {
    if (mmrHistory.length < 5) return 50;
    
    const mmrValues = mmrHistory.map(h => h.mmr);
    const variance = this.calculateVariance(mmrValues);
    
    // 변동성이 낮을수록 일관성이 높음
    return Math.max(0, Math.min(100, 100 - variance));
  }

  // 분산 계산
  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  // 평균 변화량 계산
  private static calculateAverageChange(mmrHistory: MmrHistoryPoint[]): number {
    if (mmrHistory.length < 2) return 0;
    
    let totalChange = 0;
    for (let i = 1; i < mmrHistory.length; i++) {
      totalChange += Math.abs(mmrHistory[i].mmr - mmrHistory[i - 1].mmr);
    }
    
    return totalChange / (mmrHistory.length - 1);
  }

  // 최근 성과 평가
  private static assessRecentPerformance(recentHistory: MmrHistoryPoint[]): 'excellent' | 'good' | 'average' | 'poor' {
    if (recentHistory.length < 3) return 'average';
    
    const first = recentHistory[0].mmr;
    const last = recentHistory[recentHistory.length - 1].mmr;
    const gain = last - first;
    
    if (gain > 100) return 'excellent';
    if (gain > 50) return 'good';
    if (gain > -50) return 'average';
    return 'poor';
  }

  // 티어 예측
  private static predictTier(currentMMR: number, trend: 'increasing' | 'decreasing' | 'stable'): string {
    const tierThresholds = {
      'IRON': 0,
      'BRONZE': 1000,
      'SILVER': 1200,
      'GOLD': 1400,
      'PLATINUM': 1600,
      'DIAMOND': 1800,
      'MYTHRIL': 2000,
      'TITAN': 2200,
      'IMMORTAL': 2400
    };

    let projectedMMR = currentMMR;
    
    if (trend === 'increasing') {
      projectedMMR += 50;
    } else if (trend === 'decreasing') {
      projectedMMR -= 50;
    }

    const tiers = Object.entries(tierThresholds).reverse();
    for (const [tier, threshold] of tiers) {
      if (projectedMMR >= threshold) {
        return tier;
      }
    }
    
    return 'IRON';
  }

  // 현재 상태 결정
  private static determineCurrentStatus(rankMovements: RankMovement[]): 'rising' | 'falling' | 'stable' {
    if (rankMovements.length === 0) return 'stable';
    
    const recentMovements = rankMovements.slice(0, 3);
    const totalChange = recentMovements.reduce((sum, movement) => sum + movement.mmrChange, 0);
    
    if (totalChange > 30) return 'rising';
    if (totalChange < -30) return 'falling';
    return 'stable';
  }

  // 기본 랭크 분포 (fallback)
  private static getDefaultDistribution() {
    return [
      { tier: 'IRON', count: 0, percentage: 15 },
      { tier: 'BRONZE', count: 0, percentage: 20 },
      { tier: 'SILVER', count: 0, percentage: 25 },
      { tier: 'GOLD', count: 0, percentage: 18 },
      { tier: 'PLATINUM', count: 0, percentage: 12 },
      { tier: 'DIAMOND', count: 0, percentage: 7 },
      { tier: 'MYTHRIL', count: 0, percentage: 2 },
      { tier: 'TITAN', count: 0, percentage: 0.8 },
      { tier: 'IMMORTAL', count: 0, percentage: 0.2 }
    ];
  }

  // 캐시 무효화
  static invalidateCache(userNum: number, season: number = 22): void {
    CacheService.invalidate(`current_rank:userNum:${userNum}:season:${season}`);
    CacheService.invalidate(`mmr_history:userNum:${userNum}:season:${season}`);
    CacheService.invalidate(`rank_movements:userNum:${userNum}:season:${season}`);
  }
} 