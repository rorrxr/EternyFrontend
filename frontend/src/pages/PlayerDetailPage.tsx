import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Users, 
  Clock, 
  TrendingUp,
  Gamepad2,
  BarChart3,
  Award,
  Zap,
  Flame
} from 'lucide-react';
import { getUserStats, getUserRank, getPlayerMatches, getUserCharacterStats } from '@/services/api';
import { getCharacterName } from '@/utils/characterMapping';

interface PlayerDetailPageProps {
  userNum?: string;
  nickname?: string;
}

export default function PlayerDetailPage({ userNum: propUserNum, nickname: propNickname }: PlayerDetailPageProps) {
  const params = useParams();
  const location = useLocation();
  const userNum = propUserNum || params.userNum;
  const nickname = propNickname || params.nickname || location.state?.nickname;
  
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [playerRank, setPlayerRank] = useState<any>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userNum) {
      loadPlayerData();
    }
  }, [userNum]);

  const loadPlayerData = async () => {
    if (!userNum) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 플레이어 데이터 로드 시작:', { userNum, nickname });
      
      // 병렬로 데이터 로드
      const [stats, rank, games] = await Promise.all([
        getUserStats(Number(userNum), 31), // 시즌 31
        getUserRank(Number(userNum), 31, 1), // 시즌 31, 솔로
        getPlayerMatches(Number(userNum))
      ]);

      console.log('📊 유저 통계:', stats);
      console.log('🏆 유저 랭크:', rank);
      console.log('🎮 유저 게임:', games);
      console.log('📊 게임 개수:', Array.isArray(games) ? games.length : '배열 아님');
      
      // 게임 데이터 검증 및 수정
      if (Array.isArray(games)) {
        games.forEach((game, index) => {
          console.log(`🎮 게임 ${index + 1}:`, {
            gameId: game.gameId,
            characterNum: game.characterNum,
            characterName: getCharacterName(game.characterNum),
            rank: game.gameRank,
            kills: game.playerKill,
            assists: game.playerAssistant,
            monsterKills: game.monsterKill
          });
        });
      }

      setPlayerStats(stats);
      setPlayerRank(rank);
      setRecentGames(Array.isArray(games) ? games.slice(0, 10) : []); // 최근 10게임만
    } catch (err) {
      console.error('❌ 플레이어 데이터 로드 에러:', err);
      setError('플레이어 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">플레이어 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-gradient-pink text-3xl font-bold mb-2">{nickname || 'Unknown Player'}</h1>
        <p className="text-slate-400">User ID: {userNum}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card-tile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                랭킹 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              {playerRank ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">솔로 랭킹</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      #{playerRank.rank || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">MMR</span>
                    <span className="font-semibold">{playerRank.mmr?.toLocaleString() || 0}</span>
                  </div>
                  {playerRank.serverRank && playerRank.serverRank > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">서버 랭킹</span>
                      <Badge className="bg-green-100 text-green-800">
                        #{playerRank.serverRank}
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">닉네임</span>
                    <span className="font-semibold">{playerRank.nickname}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">랭킹 정보가 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="card-tile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                시즌 통계
              </CardTitle>
            </CardHeader>
            <CardContent>
              {playerStats ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">총 게임</span>
                    <span className="font-semibold">{playerStats.totalGames || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">승리</span>
                    <span className="font-semibold text-green-600">{playerStats.totalWins || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">승률</span>
                    <span className="font-semibold">
                      {playerStats.totalGames > 0 ? ((playerStats.totalWins / playerStats.totalGames) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">평균 킬</span>
                    <span className="font-semibold">{playerStats.averageKills?.toFixed(1) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">평균 어시스트</span>
                    <span className="font-semibold">{playerStats.averageAssistants?.toFixed(1) || 0}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">통계 정보가 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="card-tile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-orange-500" />
                최근 게임
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentGames.length > 0 ? (
                <div className="space-y-3">
                  {recentGames.slice(0, 5).map((game: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">
                          {getCharacterName(game.characterNum)}
                        </span>
                        <Badge className={
                          game.gameRank === 1 ? 'bg-yellow-100 text-yellow-800' :
                          game.gameRank <= 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-100 text-slate-800'
                        }>
                          #{game.gameRank || 'N/A'}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600">
                        킬: {game.playerKill || 0} | 어시스트: {game.playerAssistant || 0} | 사냥: {game.monsterKill || 0}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        게임 ID: {game.gameId}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        캐릭터 #: {game.characterNum} | 시즌: {game.seasonId}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">최근 게임 기록이 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 