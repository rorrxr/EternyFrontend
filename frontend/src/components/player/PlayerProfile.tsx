import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/common/TierBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { cn } from '@/utils/helpers';
import { 
  User,
  UserStats,
  PlayerProfileData 
} from '@/types/api';
import { 
  formatTierDivision,
  calculateWinRate,
  calculateKDA,
  formatNumber 
} from '@/utils/formatters';
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Star,
  Award
} from 'lucide-react';

interface PlayerProfileProps {
  data: PlayerProfileData | null;
  userData?: User;
  userStats?: UserStats;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({
  data,
  userData,
  userStats,
  isLoading = false,
  onRefresh,
  className
}) => {
  const [selectedMode, setSelectedMode] = useState('3'); // 솔로=1, 듀오=2, 스쿼드=3
  const [selectedSeason, setSelectedSeason] = useState('25');

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data && !userData) {
    return null;
  }

  // 데이터 통합 (기존 방식과 새로운 API 방식 모두 지원)
  const profileData = {
    nickname: data?.nickname || userData?.nickname || '',
    tier: data?.tier || (userData ? formatTierDivision(userData.tier, userData.tierDivision) : ''),
    wins: data?.wins || userStats?.totalWins || 0,
    games: data?.games || userStats?.totalGames || 0,
    kda: data?.kda || (userStats ? calculateKDA(userStats.totalTeamKills, userStats.totalDeaths, userStats.totalAssists) : 0),
    totalDamage: data?.totalDamage || 0,
    mmr: userData?.mmr || 0,
    rank: userData?.rank || 0,
    level: userData?.level || 0,
    averageRank: userStats?.averageRank || 0,
    top1: userStats?.top1 || 0,
    top3: (userStats?.top1 || 0) + (userStats?.top2 || 0) + (userStats?.top3 || 0),
  };

  const winRate = calculateWinRate(profileData.wins, profileData.games);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* 메인 프로필 카드 */}
      <Card className="bg-white border-dakGray-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* 프로필 이미지 */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-dakBlue-500 to-dakBlue-600 flex items-center justify-center text-white text-xl font-bold">
                  {profileData.nickname.slice(0, 2).toUpperCase()}
                </div>
                {profileData.level > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-dakGray-800 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    {profileData.level}
                  </div>
                )}
              </div>

              {/* 기본 정보 */}
              <div>
                <h1 className="text-2xl font-bold text-dakGray-900 mb-1">
                  {profileData.nickname}
                </h1>
                
                <div className="flex items-center gap-3 mb-2">
                  <TierBadge 
                    tier={userData?.tier || 0}
                    division={userData?.tierDivision || 1}
                    size="md"
                  />
                  {profileData.mmr > 0 && (
                    <span className="text-sm font-semibold text-dakGray-700">
                      {profileData.mmr.toLocaleString()} MMR
                    </span>
                  )}
                  {profileData.rank > 0 && (
                    <span className="text-sm text-dakGray-500">
                      #{profileData.rank.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-dakGray-600">
                  <span>{profileData.games}게임</span>
                  <span>{winRate}% 승률</span>
                  <span>{profileData.kda} 평균 KDA</span>
                </div>
              </div>
            </div>

            {/* 새로고침 버튼 */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="border-dakGray-200 hover:bg-dakGray-50"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                갱신
              </Button>
            )}
          </div>
        </CardHeader>

        {/* 시즌/모드 선택 */}
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <Tabs value={selectedMode} onValueChange={setSelectedMode}>
              <TabsList>
                <TabsTrigger value="1">솔로</TabsTrigger>
                <TabsTrigger value="2">듀오</TabsTrigger>
                <TabsTrigger value="3">스쿼드</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={selectedSeason} onValueChange={setSelectedSeason}>
              <TabsList>
                <TabsTrigger value="25">시즌 25</TabsTrigger>
                <TabsTrigger value="24">시즌 24</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 통계 카드들 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 승률 */}
            <div className="bg-dakGray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-dakBlue-600" />
                <span className="text-sm font-medium text-dakGray-600">승률</span>
              </div>
              <div className="text-2xl font-bold text-dakGray-900">
                {winRate}%
              </div>
              <div className="text-xs text-dakGray-500">
                {profileData.wins}승 {profileData.games - profileData.wins}패
              </div>
            </div>

            {/* 평균 KDA */}
            <div className="bg-dakGray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-dakGray-600">평균 KDA</span>
              </div>
              <div className="text-2xl font-bold text-dakGray-900">
                {profileData.kda}
              </div>
              <div className="text-xs text-dakGray-500">
                {userStats ? `${userStats.averageKills.toFixed(1)} / ${(userStats.totalDeaths / userStats.totalGames).toFixed(1)} / ${userStats.averageAssistants.toFixed(1)}` : 'K/D/A'}
              </div>
            </div>

            {/* 평균 순위 */}
            <div className="bg-dakGray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-dakGray-600">평균 순위</span>
              </div>
              <div className="text-2xl font-bold text-dakGray-900">
                {profileData.averageRank > 0 ? `#${profileData.averageRank.toFixed(1)}` : '-'}
              </div>
              <div className="text-xs text-dakGray-500">
                1등 {profileData.top1}회
              </div>
            </div>

            {/* TOP 3 */}
            <div className="bg-dakGray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-dakGray-600">TOP 3</span>
              </div>
              <div className="text-2xl font-bold text-dakGray-900">
                {profileData.games > 0 ? `${((profileData.top3 / profileData.games) * 100).toFixed(1)}%` : '0%'}
              </div>
              <div className="text-xs text-dakGray-500">
                {profileData.top3}회
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상세 통계 카드 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 최근 성과 */}
        <Card className="bg-white border-dakGray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-dakBlue-600" />
              <h3 className="font-semibold text-dakGray-900">최근 성과</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dakGray-600">최근 10게임 승률</span>
                <span className="font-medium text-dakGray-900">70%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dakGray-600">연속 승리</span>
                <span className="font-medium text-green-600">3게임</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dakGray-600">최고 순위</span>
                <span className="font-medium text-dakGray-900">#1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 플레이 정보 */}
        <Card className="bg-white border-dakGray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-dakBlue-600" />
              <h3 className="font-semibold text-dakGray-900">플레이 정보</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dakGray-600">총 플레이 시간</span>
                <span className="font-medium text-dakGray-900">124시간</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dakGray-600">선호 실험체</span>
                <span className="font-medium text-dakGray-900">아드리아나</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dakGray-600">마지막 접속</span>
                <span className="font-medium text-dakGray-900">2시간 전</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 