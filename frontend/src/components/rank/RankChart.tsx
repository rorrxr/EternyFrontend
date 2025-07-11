// components/rank/RankChart.tsx - 랭크 차트 컴포넌트
import React, { useMemo, useState } from 'react';
import { PlayerRank, MmrHistoryPoint } from '../../types/player';
import { TrendingUp, TrendingDown, Award, Target, BarChart3, Activity, Calendar } from 'lucide-react';

interface RankChartProps {
  rankData: PlayerRank;
  mmrHistory?: MmrHistoryPoint[];
  showMmrChart?: boolean;
  showRankProgress?: boolean;
}

export const RankChart: React.FC<RankChartProps> = ({ 
  rankData, 
  mmrHistory = [],
  showMmrChart = true,
  showRankProgress = true 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'history'>('overview');

  const getTierInfo = (tier: string) => {
    const tierMap: Record<string, { color: string; bgColor: string; icon: string; description: string }> = {
      'IRON': { 
        color: 'text-amber-600', 
        bgColor: 'bg-amber-50 dark:bg-amber-900/20', 
        icon: '🥉', 
        description: '아이언 티어'
      },
      'BRONZE': { 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-50 dark:bg-orange-900/20', 
        icon: '🥉', 
        description: '브론즈 티어'
      },
      'SILVER': { 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-50 dark:bg-gray-900/20', 
        icon: '🥈', 
        description: '실버 티어'
      },
      'GOLD': { 
        color: 'text-yellow-500', 
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', 
        icon: '🥇', 
        description: '골드 티어'
      },
      'PLATINUM': { 
        color: 'text-emerald-600', 
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', 
        icon: '💎', 
        description: '플래티넘 티어'
      },
      'DIAMOND': { 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50 dark:bg-blue-900/20', 
        icon: '💎', 
        description: '다이아몬드 티어'
      },
      'MYTHRIL': { 
        color: 'text-pink-600', 
        bgColor: 'bg-pink-50 dark:bg-pink-900/20', 
        icon: '⭐', 
        description: '미스릴 티어'
      },
      'TITAN': { 
        color: 'text-red-600', 
        bgColor: 'bg-red-50 dark:bg-red-900/20', 
        icon: '👑', 
        description: '타이탄 티어'
      },
      'IMMORTAL': { 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50 dark:bg-purple-900/20', 
        icon: '🏆', 
        description: '이모탈 티어'
      },
    };
    return tierMap[tier] || { 
      color: 'text-gray-500', 
      bgColor: 'bg-gray-50 dark:bg-gray-900/20', 
      icon: '🎯', 
      description: '언랭크'
    };
  };

  const tierInfo = getTierInfo(rankData.tier);

  // MMR 트렌드 계산
  const mmrTrend = useMemo(() => {
    if (mmrHistory.length < 2) return { direction: 'stable', change: 0, percentage: 0 };
    
    const recent = mmrHistory.slice(-5);
    const firstMmr = recent[0]?.mmr || 0;
    const lastMmr = recent[recent.length - 1]?.mmr || 0;
    const change = lastMmr - firstMmr;
    const percentage = firstMmr > 0 ? (change / firstMmr) * 100 : 0;
    
    return {
      direction: change > 10 ? 'up' : change < -10 ? 'down' : 'stable',
      change,
      percentage: Math.abs(percentage)
    };
  }, [mmrHistory]);

  // 승급/강등 진행률 계산
  const progressInfo = useMemo(() => {
    if (!rankData.promotionProgress) return null;
    
    const progress = Math.min(100, Math.max(0, rankData.promotionProgress));
    const isPromotion = rankData.isPromotion;
    const isDemotion = rankData.isDemotion;
    
    return {
      progress,
      isPromotion,
      isDemotion,
      status: isPromotion ? '승급전' : isDemotion ? '강등 위험' : '일반'
    };
  }, [rankData]);

  // 간단한 MMR 차트 렌더링
  const renderMmrChart = () => {
    if (mmrHistory.length < 2) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p>MMR 히스토리가 부족합니다</p>
        </div>
      );
    }

    const maxMmr = Math.max(...mmrHistory.map(h => h.mmr));
    const minMmr = Math.min(...mmrHistory.map(h => h.mmr));
    const range = maxMmr - minMmr || 1;

    return (
      <div className="relative h-32 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-end justify-between h-full space-x-1">
          {mmrHistory.slice(-10).map((point, index) => {
            const height = ((point.mmr - minMmr) / range) * 80 + 10;
            const isLast = index === mmrHistory.slice(-10).length - 1;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isLast ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(point.date).getMonth() + 1}/{new Date(point.date).getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Y축 라벨 */}
        <div className="absolute left-0 top-0 text-xs text-gray-500">
          {maxMmr.toLocaleString()}
        </div>
        <div className="absolute left-0 bottom-8 text-xs text-gray-500">
          {minMmr.toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          개요
        </button>
        {showRankProgress && (
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'progress'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            진행률
          </button>
        )}
        {showMmrChart && mmrHistory.length > 0 && (
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            히스토리
          </button>
        )}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* 현재 랭크 정보 */}
          <div className={`${tierInfo.bgColor} p-4 rounded-xl border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{tierInfo.icon}</span>
              <div className="flex-1">
                <h4 className={`text-xl font-bold ${tierInfo.color}`}>
                  {rankData.tier}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tierInfo.description}
                </p>
              </div>
              {mmrTrend.direction !== 'stable' && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  mmrTrend.direction === 'up' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {mmrTrend.direction === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {mmrTrend.percentage.toFixed(1)}%
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">랭크</span>
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  #{rankData.rank.toLocaleString()}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">MMR</span>
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {rankData.mmr?.toLocaleString() || 'N/A'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">LP</span>
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {rankData.lp || 0}
                </div>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">티어 분위</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  상위 {Math.max(1, Math.floor((rankData.rank / 10000) * 100))}%
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">MMR 변화</span>
                <span className={`font-medium ${
                  mmrTrend.change > 0 ? 'text-green-600' : 
                  mmrTrend.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {mmrTrend.change > 0 ? '+' : ''}{mmrTrend.change}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && progressInfo && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${
            progressInfo.isPromotion 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : progressInfo.isDemotion
              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-gray-900 dark:text-white">
                랭크 진행 상황
              </h5>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                progressInfo.isPromotion 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : progressInfo.isDemotion
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {progressInfo.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">진행도</span>
                <span className="font-medium">{progressInfo.progress.toFixed(1)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    progressInfo.isPromotion 
                      ? 'bg-green-500'
                      : progressInfo.isDemotion
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${progressInfo.progress}%` }}
                />
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {progressInfo.isPromotion && '승급까지 조금 더 승리가 필요합니다'}
                {progressInfo.isDemotion && '강등을 피하기 위해 승리가 필요합니다'}
                {!progressInfo.isPromotion && !progressInfo.isDemotion && '현재 안정적인 상태입니다'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-gray-900 dark:text-white">
              MMR 히스토리
            </h5>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              최근 10경기
            </div>
          </div>
          
          {renderMmrChart()}
          
          {/* MMR 통계 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.max(...mmrHistory.map(h => h.mmr)).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">최고 MMR</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.min(...mmrHistory.map(h => h.mmr)).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">최저 MMR</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(mmrHistory.reduce((sum, h) => sum + h.mmr, 0) / mmrHistory.length).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">평균 MMR</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 