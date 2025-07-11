// hooks/useOptimizedData.ts - 데이터 최적화 훅
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlayerService } from '../services/playerService';
import { EnhancedPlayerService } from '../services/enhancedPlayerService';
import { PlayerDetail } from '../types/player';

export const useOptimizedPlayerData = (userNum: number | null) => {
  // 데이터 요청 최적화
  const playerQuery = useQuery({
    queryKey: ['player', userNum],
    queryFn: () => EnhancedPlayerService.getPlayerDetailWithFallback(userNum!),
    enabled: !!userNum,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (이전 cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // 계산된 값들 메모이제이션
  const computedStats = useMemo(() => {
    if (!playerQuery.data) return null;
    
    const player = playerQuery.data;
    return {
      winRateColor: player.winRate >= 70 ? 'text-green-500' : 
                   player.winRate >= 50 ? 'text-yellow-500' : 'text-red-500',
      rankDisplay: `${player.tier} ${player.rank}`,
      performanceGrade: player.winRate >= 70 ? 'S' :
                       player.winRate >= 60 ? 'A' :
                       player.winRate >= 50 ? 'B' : 'C',
      isTopPlayer: player.rank <= 100 && player.tier === 'IMMORTAL',
      
      // 추가 계산된 통계
      avgKillsPerGame: player.averageKills || 0,
      avgPlayTimeMinutes: player.averagePlayTime || 0,
      recentFormTrend: player.recentFormRating || 0,
      
      // 티어별 색상 클래스
      tierColorClass: getTierColorClass(player.tier),
      
      // 성과 평가
      overallRating: calculateOverallRating(player),
      
      // 최근 활동 상태
      activityStatus: getActivityStatus(player),
    };
  }, [playerQuery.data]);

  return {
    ...playerQuery,
    computedStats,
  };
};

// 티어별 색상 클래스 반환
function getTierColorClass(tier: string): string {
  const tierColorMap: Record<string, string> = {
    'IRON': 'text-amber-600 bg-amber-50 border-amber-200',
    'BRONZE': 'text-orange-600 bg-orange-50 border-orange-200',
    'SILVER': 'text-gray-600 bg-gray-50 border-gray-200',
    'GOLD': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'PLATINUM': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'DIAMOND': 'text-blue-600 bg-blue-50 border-blue-200',
    'MYTHRIL': 'text-pink-600 bg-pink-50 border-pink-200',
    'TITAN': 'text-red-600 bg-red-50 border-red-200',
    'IMMORTAL': 'text-purple-600 bg-purple-50 border-purple-200',
  };
  
  return tierColorMap[tier] || tierColorMap['IRON'];
}

// 전체 평가 계산
function calculateOverallRating(player: PlayerDetail): number {
  const winRateScore = Math.min(player.winRate / 100, 1) * 40; // 최대 40점
  const rankScore = player.rank > 0 ? Math.max(0, (1000 - player.rank) / 1000) * 30 : 0; // 최대 30점
  const gamesScore = Math.min(player.totalGames / 100, 1) * 20; // 최대 20점
  const killsScore = Math.min((player.averageKills || 0) / 5, 1) * 10; // 최대 10점
  
  return Math.round(winRateScore + rankScore + gamesScore + killsScore);
}

// 활동 상태 계산
function getActivityStatus(player: PlayerDetail): 'active' | 'inactive' | 'casual' {
  const now = new Date();
  const lastUpdate = player.updatedAt ? new Date(player.updatedAt) : now;
  const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceUpdate < 1) return 'active';
  if (daysSinceUpdate < 7) return 'casual';
  return 'inactive';
}

// 매치 데이터 최적화 훅
export const useOptimizedMatchData = (userNum: number | null, limit: number = 20) => {
  const matchQuery = useQuery({
    queryKey: ['playerMatches', userNum, limit],
    queryFn: () => EnhancedPlayerService.getPlayerMatchesWithCache(userNum!),
    enabled: !!userNum,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });

  // 매치 통계 계산
  const matchStats = useMemo(() => {
    if (!matchQuery.data?.matches) return null;
    
    const matches = matchQuery.data.matches.slice(0, limit);
    const totalMatches = matches.length;
    
    if (totalMatches === 0) return null;
    
    const wins = matches.filter(m => m.gameRank === 1).length;
    const top3 = matches.filter(m => m.gameRank <= 3).length;
    const avgRank = matches.reduce((sum, m) => sum + m.gameRank, 0) / totalMatches;
    const avgKills = matches.reduce((sum, m) => sum + (m.kills || 0), 0) / totalMatches;
    const avgPlayTime = matches.reduce((sum, m) => sum + m.playTime, 0) / totalMatches;
    
    // 최근 폼 계산 (최근 10게임 기준)
    const recentMatches = matches.slice(0, 10);
    const recentWins = recentMatches.filter(m => m.gameRank === 1).length;
    const recentTop3 = recentMatches.filter(m => m.gameRank <= 3).length;
    
    // 캐릭터 사용률 계산
    const characterUsage = matches.reduce((acc, match) => {
      const char = match.character;
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCharacters = Object.entries(characterUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([char, count]) => ({ character: char, count, percentage: (count / totalMatches) * 100 }));
    
    return {
      totalMatches,
      wins,
      winRate: (wins / totalMatches) * 100,
      top3Rate: (top3 / totalMatches) * 100,
      avgRank: Math.round(avgRank * 10) / 10,
      avgKills: Math.round(avgKills * 10) / 10,
      avgPlayTime: Math.round(avgPlayTime),
      
      // 최근 폼
      recentForm: {
        wins: recentWins,
        winRate: recentMatches.length > 0 ? (recentWins / recentMatches.length) * 100 : 0,
        top3Rate: recentMatches.length > 0 ? (recentTop3 / recentMatches.length) * 100 : 0,
        trend: calculateTrend(recentMatches),
      },
      
      // 캐릭터 통계
      topCharacters,
      
      // 게임 모드 분석
      gameModes: analyzeGameModes(matches),
      
      // 성과 분석
      performance: analyzePerformance(matches),
    };
  }, [matchQuery.data, limit]);

  return {
    ...matchQuery,
    matchStats,
  };
};

// 트렌드 계산 함수
function calculateTrend(matches: any[]): 'improving' | 'declining' | 'stable' {
  if (matches.length < 5) return 'stable';
  
  const firstHalf = matches.slice(0, Math.floor(matches.length / 2));
  const secondHalf = matches.slice(Math.floor(matches.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.gameRank, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.gameRank, 0) / secondHalf.length;
  
  const difference = firstHalfAvg - secondHalfAvg;
  
  if (difference > 1) return 'improving';
  if (difference < -1) return 'declining';
  return 'stable';
}

// 게임 모드 분석
function analyzeGameModes(matches: any[]) {
  const modes = matches.reduce((acc, match) => {
    const key = `${match.gameMode}-${match.matchingMode}`;
    if (!acc[key]) {
      acc[key] = {
        gameMode: match.gameMode,
        matchingMode: match.matchingMode,
        count: 0,
        wins: 0,
        totalRank: 0,
      };
    }
    acc[key].count++;
    if (match.gameRank === 1) acc[key].wins++;
    acc[key].totalRank += match.gameRank;
    return acc;
  }, {} as Record<string, any>);
  
  return Object.values(modes).map((mode: any) => ({
    ...mode,
    winRate: (mode.wins / mode.count) * 100,
    avgRank: mode.totalRank / mode.count,
  }));
}

// 성과 분석
function analyzePerformance(matches: any[]) {
  const killCounts = matches.map(m => m.kills || 0);
  const playTimes = matches.map(m => m.playTime);
  
  return {
    bestRank: Math.min(...matches.map(m => m.gameRank)),
    worstRank: Math.max(...matches.map(m => m.gameRank)),
    maxKills: Math.max(...killCounts),
    longestGame: Math.max(...playTimes),
    shortestGame: Math.min(...playTimes),
    
    // 일관성 지표
    rankVariance: calculateVariance(matches.map(m => m.gameRank)),
    killVariance: calculateVariance(killCounts),
  };
}

// 분산 계산
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  
  return Math.round(Math.sqrt(variance) * 100) / 100;
}

// 랭크 데이터 최적화 훅
export const useOptimizedRankData = (userNum: number | null, season: number = 22, teamMode: number = 1) => {
  const rankQuery = useQuery({
    queryKey: ['playerRank', userNum, season, teamMode],
    queryFn: () => EnhancedPlayerService.getPlayerRankWithCache(userNum!, season, teamMode),
    enabled: !!userNum,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  });

  // 랭크 분석
  const rankAnalysis = useMemo(() => {
    if (!rankQuery.data) return null;
    
    const rank = rankQuery.data;
    
    return {
      tierInfo: {
        tier: rank.tier,
        rank: rank.rank,
        mmr: rank.mmr,
        isTopTier: ['TITAN', 'IMMORTAL'].includes(rank.tier),
        isPromotion: rank.isPromotion,
        isDemotion: rank.isDemotion,
      },
      
      // MMR 분석
      mmrAnalysis: {
        current: rank.mmr,
        percentile: calculatePercentile(rank.mmr, rank.tier),
        isHigh: rank.mmr > getAverageMMR(rank.tier),
        trend: rank.mmrHistory ? analyzeMmrTrend(rank.mmrHistory) : 'stable',
      },
      
      // 랭크 진행 상황
      progression: {
        promotionProgress: rank.promotionProgress || 0,
        nextTier: getNextTier(rank.tier),
        rankMovement: rank.rankMovement?.slice(0, 5) || [],
      },
    };
  }, [rankQuery.data]);

  return {
    ...rankQuery,
    rankAnalysis,
  };
};

// 퍼센타일 계산 (임시 구현)
function calculatePercentile(mmr: number, tier: string): number {
  const tierMMRRanges: Record<string, [number, number]> = {
    'IRON': [0, 1000],
    'BRONZE': [1000, 1200],
    'SILVER': [1200, 1400],
    'GOLD': [1400, 1600],
    'PLATINUM': [1600, 1800],
    'DIAMOND': [1800, 2000],
    'MYTHRIL': [2000, 2200],
    'TITAN': [2200, 2400],
    'IMMORTAL': [2400, 3000],
  };
  
  const [min, max] = tierMMRRanges[tier] || [0, 1000];
  return Math.min(100, Math.max(0, ((mmr - min) / (max - min)) * 100));
}

// 평균 MMR 계산 (임시 구현)
function getAverageMMR(tier: string): number {
  const averageMMRs: Record<string, number> = {
    'IRON': 500,
    'BRONZE': 1100,
    'SILVER': 1300,
    'GOLD': 1500,
    'PLATINUM': 1700,
    'DIAMOND': 1900,
    'MYTHRIL': 2100,
    'TITAN': 2300,
    'IMMORTAL': 2500,
  };
  
  return averageMMRs[tier] || 1000;
}

// 다음 티어 계산
function getNextTier(currentTier: string): string {
  const tierOrder = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MYTHRIL', 'TITAN', 'IMMORTAL'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
    return currentTier;
  }
  
  return tierOrder[currentIndex + 1];
}

// MMR 트렌드 분석
function analyzeMmrTrend(mmrHistory: any[]): 'rising' | 'falling' | 'stable' {
  if (mmrHistory.length < 3) return 'stable';
  
  const recent = mmrHistory.slice(-5);
  const first = recent[0].mmr;
  const last = recent[recent.length - 1].mmr;
  const difference = last - first;
  
  if (difference > 50) return 'rising';
  if (difference < -50) return 'falling';
  return 'stable';
} 