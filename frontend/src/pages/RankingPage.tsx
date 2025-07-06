import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Medal,
  Crown,
  Award
} from 'lucide-react';
import { getRanking } from '@/services/api';

export default function RankingPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(30);

  const { data: rankingData, isLoading, error } = useQuery({
    queryKey: ['ranking', page, size],
    queryFn: () => getRanking(page, size),
    placeholderData: (previousData) => previousData,
  });

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
    return <span className="text-lg font-bold text-slate-600">#{rank}</span>;
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case '이터널':
        return 'bg-purple-100 text-purple-800';
      case '다이아몬드':
        return 'bg-blue-100 text-blue-800';
      case '플래티넘':
        return 'bg-green-100 text-green-800';
      case '골드':
        return 'bg-yellow-100 text-yellow-800';
      case '실버':
        return 'bg-gray-100 text-gray-800';
      case '브론즈':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">랭킹을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-500">랭킹을 불러오는데 실패했습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-gradient-pink text-3xl font-bold flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-pink-400" />
          전체 랭킹
        </h1>
        <p className="text-slate-400">이터널리턴 플레이어 랭킹</p>
      </div>
      <div className="card-tile mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              랭킹 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankingData && rankingData.length > 0 ? (
              <div className="space-y-4">
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 rounded-lg font-medium text-slate-700">
                  <div className="col-span-1">순위</div>
                  <div className="col-span-3">플레이어</div>
                  <div className="col-span-2">티어</div>
                  <div className="col-span-2">MMR</div>
                  <div className="col-span-2">승률</div>
                  <div className="col-span-2">게임 수</div>
                </div>

                {/* 랭킹 리스트 */}
                {rankingData.map((player: any, index: number) => (
                  <div
                    key={player.userNum || index}
                    className="grid grid-cols-12 gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {/* 순위 */}
                    <div className="col-span-1 flex items-center">
                      {getRankIcon(index + 1 + (page * size))}
                    </div>

                    {/* 플레이어 정보 */}
                    <div className="col-span-3">
                      <div className="font-medium text-slate-900">
                        {player.nickname || `Player${player.userNum}`}
                      </div>
                      <div className="text-sm text-slate-500">
                        ID: {player.userNum}
                      </div>
                    </div>

                    {/* 티어 */}
                    <div className="col-span-2 flex items-center">
                      <Badge className={getTierColor(player.tier || 'Unknown')}>
                        {player.tier || 'Unknown'}
                      </Badge>
                    </div>

                    {/* MMR */}
                    <div className="col-span-2 flex items-center">
                      <span className="font-semibold text-slate-900">
                        {player.mmr?.toLocaleString() || 'N/A'}
                      </span>
                    </div>

                    {/* 승률 */}
                    <div className="col-span-2 flex items-center">
                      <span className="font-semibold text-green-600">
                        {player.totalGames > 0 
                          ? ((player.totalWins / player.totalGames) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>

                    {/* 게임 수 */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-slate-600">
                        {player.totalGames || 0}게임
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">랭킹 데이터가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center mt-6">
        <Button
          onClick={handlePreviousPage}
          disabled={page === 0}
          variant="outline"
          className="flex items-center gap-2 hover-scale"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </Button>
        <span className="text-slate-600">페이지 {page + 1}</span>
        <Button
          onClick={handleNextPage}
          disabled={!rankingData || rankingData.length < size}
          variant="outline"
          className="flex items-center gap-2 hover-scale"
        >
          다음
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 