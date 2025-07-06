import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MatchFilters } from './MatchFilters';
import { MatchCard } from './MatchCard';
import { cn } from '@/utils/helpers';
import { 
  MatchEntry, 
  UserGame,
  CharacterStat 
} from '@/types/api';
import { 
  History, 
  TrendingUp, 
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MatchHistoryProps {
  matches: (MatchEntry | UserGame)[];
  characterStats?: CharacterStat[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches = [],
  characterStats = [],
  isLoading = false,
  onLoadMore,
  hasMore = false,
  className
}) => {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedCharacter, setSelectedCharacter] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const MATCHES_PER_PAGE = 20;

  // 필터링된 매치들
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // 타입 구분
      const isUserGame = 'gameId' in match;
      
      const matchMode = isUserGame ? match.matchingTeamMode.toString() : 
        (match.mode === '솔로' ? '1' : match.mode === '듀오' ? '2' : '3');
      
      const matchCharacter = isUserGame ? match.characterNum.toString() : 
        match.teams[0]?.players[0]?.characterIcon || '';
      
      const matchRank = isUserGame ? match.gameRank : match.teams[0]?.players[0]?.tk || 0;
      
      // 모드 필터
      if (selectedMode !== 'all' && matchMode !== selectedMode) {
        return false;
      }
      
      // 캐릭터 필터
      if (selectedCharacter !== 'all' && matchCharacter !== selectedCharacter) {
        return false;
      }
      
      // 결과 필터
      if (selectedResult === 'win' && matchRank > 3) {
        return false;
      }
      if (selectedResult === 'lose' && matchRank <= 3) {
        return false;
      }
      
      return true;
    });
  }, [matches, selectedMode, selectedCharacter, selectedResult]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredMatches.length / MATCHES_PER_PAGE);
  const paginatedMatches = filteredMatches.slice(
    (currentPage - 1) * MATCHES_PER_PAGE,
    currentPage * MATCHES_PER_PAGE
  );

  // 통계 계산
  const stats = useMemo(() => {
    if (filteredMatches.length === 0) {
      return { totalGames: 0, wins: 0, winRate: 0, avgKDA: 0, avgRank: 0 };
    }

    const totalGames = filteredMatches.length;
    const wins = filteredMatches.filter(match => {
      const rank = 'gameId' in match ? match.gameRank : match.teams[0]?.players[0]?.tk || 0;
      return rank <= 3;
    }).length;
    
    const winRate = (wins / totalGames) * 100;
    
    const totalKills = filteredMatches.reduce((sum, match) => {
      return sum + ('gameId' in match ? match.playerKill : match.teams[0]?.players[0]?.kill || 0);
    }, 0);
    
    const totalAssists = filteredMatches.reduce((sum, match) => {
      return sum + ('gameId' in match ? match.playerAssistant : match.teams[0]?.players[0]?.assist || 0);
    }, 0);
    
    const totalDeaths = filteredMatches.length; // 이터널 리턴은 게임당 1데스
    const avgKDA = totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : 0;
    
    const totalRank = filteredMatches.reduce((sum, match) => {
      return sum + ('gameId' in match ? match.gameRank : match.teams[0]?.players[0]?.tk || 0);
    }, 0);
    const avgRank = totalRank / totalGames;

    return { totalGames, wins, winRate, avgKDA, avgRank };
  }, [filteredMatches]);

  const handleToggleExpand = (matchId: string) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

  const handleResetFilters = () => {
    setSelectedMode('all');
    setSelectedCharacter('all');
    setSelectedResult('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedMatch(null); // 페이지 변경 시 확장 상태 초기화
  };

  if (isLoading && matches.length === 0) {
    return (
      <Card className={cn("w-full card-tile", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      <Card className="card-tile bg-white border-dakGray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-dakGray-900">
              <History className="h-5 w-5" />
              경기 기록
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-dakGray-500" />
                <span className="text-dakGray-600">
                  {stats.totalGames}게임 • {stats.winRate.toFixed(1)}% 승률 • {stats.avgKDA.toFixed(2)} 평균 KDA
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <MatchFilters
            selectedMode={selectedMode}
            selectedCharacter={selectedCharacter}
            selectedResult={selectedResult}
            onModeChange={setSelectedMode}
            onCharacterChange={setSelectedCharacter}
            onResultChange={setSelectedResult}
            onReset={handleResetFilters}
          />
        </CardContent>
      </Card>
      <div className="space-y-3">
        {paginatedMatches.length === 0 ? (
          <Card className="card-tile bg-white border-dakGray-200">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-dakGray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dakGray-900 mb-2">
                경기 기록이 없습니다
              </h3>
              <p className="text-dakGray-500">
                조건에 맞는 경기 기록을 찾을 수 없어요.
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedMatches.map((match, idx) => (
            <div key={idx} className="card-tile">
              <MatchCard match={match} />
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Card className="bg-white border-dakGray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-dakGray-600">
                {filteredMatches.length}개 중 {((currentPage - 1) * MATCHES_PER_PAGE) + 1}-{Math.min(currentPage * MATCHES_PER_PAGE, filteredMatches.length)}개 표시
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-dakGray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : 
                      currentPage >= totalPages - 2 ? totalPages - 4 + i :
                      currentPage - 2 + i;
                    
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={cn(
                          "w-8 h-8 p-0",
                          pageNum === currentPage && "bg-dakBlue-600 text-white hover:bg-dakBlue-700"
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-dakGray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 더 불러오기 (무한 스크롤 방식) */}
      {hasMore && onLoadMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="border-dakGray-200 hover:bg-dakGray-50"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                불러오는 중...
              </>
            ) : (
              '더 보기'
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 