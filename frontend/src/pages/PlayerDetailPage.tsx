import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { PlayerDetailCard } from '../components/player/PlayerDetailCard';
import { MatchHistoryList } from '../components/match/MatchHistoryList';
import { RankChart } from '../components/rank/RankChart';
import { SkeletonCard, LoadingSpinner } from '../components/layout/LoadingStates';
import { usePlayerDetail } from '../hooks/usePlayerDetail';
import { EnhancedPlayerService } from '../services/enhancedPlayerService';

export const PlayerDetailPage: React.FC = () => {
  const { userNum } = useParams<{ userNum: string }>();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [isExternalFetch, setIsExternalFetch] = useState(false);

  const playerNumeric = userNum ? parseInt(userNum, 10) : null;
  
  const {
    player,
    matches,
    rank,
    isLoading,
    error,
    refetch
  } = usePlayerDetail(playerNumeric);

  // 로그에서 본 문제 해결: "Player not found" 시 외부 API 시도
  useEffect(() => {
    const handlePlayerNotFound = async () => {
      if (error && playerNumeric && retryCount < 2) {
        console.log('플레이어 정보 없음, 외부 API로 데이터 구성 시도');
        setIsExternalFetch(true);
        
        try {
          const externalPlayer = await EnhancedPlayerService.getPlayerDetailWithFallback(playerNumeric);
          if (externalPlayer) {
            setRetryCount(prev => prev + 1);
            refetch(); // React Query 캐시에 저장된 데이터 다시 가져오기
          }
        } catch (error) {
          console.error('외부 API 폴백 실패:', error);
        } finally {
          setIsExternalFetch(false);
        }
      }
    };

    handlePlayerNotFound();
  }, [error, playerNumeric, retryCount, refetch]);

  const handleRefresh = useCallback(() => {
    setRetryCount(0);
    refetch();
  }, [refetch]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (!playerNumeric) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">잘못된 플레이어 번호</h2>
          <button onClick={handleBack} className="btn-primary">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* 헤더 */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              돌아가기
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isLoading || isExternalFetch}
              className="flex items-center gap-2 btn-secondary disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${(isLoading || isExternalFetch) ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 로딩 상태 */}
        {(isLoading || isExternalFetch) && (
          <div className="space-y-6">
            <SkeletonCard />
            <div className="grid md:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        )}

        {/* 외부 API 로딩 상태 */}
        {isExternalFetch && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <div>
                <p className="font-medium text-blue-900">실시간 데이터 가져오는 중</p>
                <p className="text-sm text-blue-700">외부 API에서 최신 정보를 수집하고 있습니다...</p>
              </div>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && !isExternalFetch && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              플레이어 정보를 불러올 수 없습니다
            </h3>
            <p className="text-red-700 mb-4">
              서버에서 플레이어 데이터를 찾을 수 없거나 일시적인 오류가 발생했습니다.
            </p>
            <div className="space-x-3">
              <button onClick={handleRefresh} className="btn-primary">
                다시 시도
              </button>
              <button onClick={handleBack} className="btn-secondary">
                돌아가기
              </button>
            </div>
          </div>
        )}

        {/* 성공 상태 */}
        {player && !isLoading && (
          <div className="space-y-6">
            {/* 플레이어 기본 정보 */}
            <PlayerDetailCard 
              player={player} 
              isFromExternalApi={player.isFromExternalApi} 
            />

            {/* 추가 정보 그리드 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 매치 히스토리 */}
              {matches && (
                <div className="card">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    최근 경기
                  </h2>
                  <MatchHistoryList matches={matches.matches} />
                </div>
              )}

              {/* 랭크 차트 */}
              {rank && (
                <div className="card">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    랭킹 정보
                  </h2>
                  <RankChart rankData={rank} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 