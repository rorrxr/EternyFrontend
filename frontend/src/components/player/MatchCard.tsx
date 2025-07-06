import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/utils/helpers';
import { 
  MatchEntry, 
  MatchPlayer, 
  UserGame 
} from '@/types/api';
import { 
  formatDate, 
  formatDuration, 
  calculateKDA 
} from '@/utils/formatters';
import { CHARACTERS, GAME_MODES } from '@/utils/constants';
import { 
  ChevronDown, 
  ChevronUp, 
  Sword, 
  Shield, 
  Heart,
  Target,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface MatchCardProps {
  match: MatchEntry | UserGame;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isExpanded = false,
  onToggleExpand,
  className
}) => {
  // 데이터 타입 구분 및 통합
  const isUserGame = 'gameId' in match;
  
  const matchData = isUserGame ? {
    id: match.gameId.toString(),
    date: match.startDtm,
    mode: GAME_MODES[match.matchingTeamMode as keyof typeof GAME_MODES] || '알 수 없음',
    character: CHARACTERS[match.characterNum as keyof typeof CHARACTERS]?.name || '알 수 없음',
    rank: match.gameRank,
    kills: match.playerKill,
    deaths: 1, // 이터널 리턴은 데스가 없으므로 1로 고정
    assists: match.playerAssistant,
    duration: match.duration,
    mmrGain: match.mmrGain,
    damage: match.damageToPlayer,
    healing: match.healAmount,
    teamKill: 0, // UserGame에는 없음
    animalKill: match.monsterKill,
    items: [], // 아이템 정보는 equipment에서 파싱 필요
  } : {
    id: match.id,
    date: match.date,
    mode: match.mode,
    character: match.teams[0]?.players[0]?.characterIcon?.replace('/char-', '').replace('.png', '') || '알 수 없음',
    rank: match.teams[0]?.players[0]?.tk || 0,
    kills: match.teams[0]?.players[0]?.kill || 0,
    deaths: match.teams[0]?.players[0]?.death || 0,
    assists: match.teams[0]?.players[0]?.assist || 0,
    duration: 0,
    mmrGain: 0,
    damage: match.teams[0]?.players[0]?.damage || 0,
    healing: 0,
    teamKill: match.teams[0]?.players[0]?.tk || 0,
    animalKill: match.teams[0]?.players[0]?.animal || 0,
    items: match.teams[0]?.players[0]?.items || [],
  };

  const kda = calculateKDA(matchData.kills, matchData.deaths, matchData.assists);
  const isWin = matchData.rank <= 3;
  const isTop1 = matchData.rank === 1;

  // 순위별 색상
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-100';
    if (rank <= 3) return 'text-blue-600 bg-blue-100';
    if (rank <= 8) return 'text-dakGray-600 bg-dakGray-100';
    return 'text-red-600 bg-red-100';
  };

  const getRankText = (rank: number) => {
    if (rank === 1) return '🥇 1등';
    if (rank === 2) return '🥈 2등';
    if (rank === 3) return '🥉 3등';
    return `#${rank}`;
  };

  return (
    <Card className={cn(
      "card-tile transition-all duration-200 hover:shadow-pink-lg",
      isWin ? "border-l-4 border-pink-400" : "border-l-4 border-dakGray-300",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Badge className={cn("font-semibold text-gradient-pink shadow-pink", getRankColor(matchData.rank))}>
                {getRankText(matchData.rank)}
              </Badge>
              <div className="text-xs text-dakGray-500 mt-1">
                {matchData.mode}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-dakGray-100 flex items-center justify-center mb-1 shadow-pink">
                <span className="text-lg font-bold text-gradient-pink">
                  {matchData.character.slice(0, 2)}
                </span>
              </div>
              <span className="text-xs text-dakGray-600">{matchData.character}</span>
            </div>
            <div className="text-center">
              <div className="font-semibold text-dakGray-900">
                {matchData.kills}/{matchData.deaths}/{matchData.assists}
              </div>
              <div className="text-sm text-gradient-pink">
                {kda} KDA
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-dakGray-900">
                {(matchData.damage / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-dakGray-500">데미지</div>
            </div>
            {isUserGame && (
              <div className="text-center">
                <div className={cn(
                  "font-semibold flex items-center gap-1",
                  matchData.mmrGain > 0 ? "text-pink-500" : "text-dakGray-400"
                )}>
                  {matchData.mmrGain > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {matchData.mmrGain > 0 ? `+${matchData.mmrGain}` : matchData.mmrGain}
                </div>
                <div className="text-xs text-dakGray-500">MMR</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-dakGray-900">
                {formatDate(matchData.date)}
              </div>
              {matchData.duration > 0 && (
                <div className="text-xs text-dakGray-500">
                  {formatDuration(matchData.duration)}
                </div>
              )}
            </div>
            {onToggleExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="h-8 w-8 p-0 hover-scale"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* 확장된 상세 정보 */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-dakGray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 전투 통계 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-dakGray-700 flex items-center gap-1">
                  <Sword className="h-3 w-3" />
                  전투 통계
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dakGray-600">플레이어 킬</span>
                    <span className="font-medium">{matchData.kills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dakGray-600">어시스트</span>
                    <span className="font-medium">{matchData.assists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dakGray-600">동물 킬</span>
                    <span className="font-medium">{matchData.animalKill}</span>
                  </div>
                </div>
              </div>

              {/* 데미지 통계 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-dakGray-700 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  데미지
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dakGray-600">총 데미지</span>
                    <span className="font-medium">{matchData.damage.toLocaleString()}</span>
                  </div>
                  {matchData.healing > 0 && (
                    <div className="flex justify-between">
                      <span className="text-dakGray-600">힐량</span>
                      <span className="font-medium">{matchData.healing.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 아이템 */}
              {matchData.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-dakGray-700 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    아이템
                  </h4>
                  <div className="grid grid-cols-3 gap-1">
                    {matchData.items.slice(0, 6).map((item, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 bg-dakGray-100 rounded border flex items-center justify-center"
                      >
                        <span className="text-xs">📦</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 게임 정보 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-dakGray-700">게임 정보</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dakGray-600">게임 ID</span>
                    <span className="font-mono text-xs">{matchData.id}</span>
                  </div>
                  {matchData.duration > 0 && (
                    <div className="flex justify-between">
                      <span className="text-dakGray-600">플레이 시간</span>
                      <span className="font-medium">{formatDuration(matchData.duration)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 