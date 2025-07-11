import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, ExternalLink, Clock } from 'lucide-react';
import { EnhancedPlayerProfile } from '../components/EnhancedPlayerProfile';
import { MatchHistory } from '../components/player/MatchHistory';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { usePlayerDetail } from '../hooks/usePlayerDetail';
import { EnhancedPlayerService } from '../services/enhancedPlayerService';
import { PlayerDetail } from '../types/player';

export const PlayerDetailPage: React.FC = () => {
  const { userNum } = useParams<{ userNum: string }>();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [isExternalFetch, setIsExternalFetch] = useState(false);
  const [externalPlayerData, setExternalPlayerData] = useState<PlayerDetail | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const playerNumeric = userNum ? parseInt(userNum, 10) : null;
  
  const {
    player,
    matches,
    rank,
    isLoading,
    error,
    refetch
  } = usePlayerDetail(playerNumeric);

  // 로그 문제 해결: "Player not found" 시 외부 API 시도 (강화된 버전)
  useEffect(() => {
    const handlePlayerNotFound = async () => {
      if (error && playerNumeric && retryCount < 3 && !isExternalFetch) {
        console.log(`플레이어 정보 없음 (시도 ${retryCount + 1}/3), 외부 API로 데이터 구성 시도`);
        setIsExternalFetch(true);
        
        try {
          const externalPlayer = await EnhancedPlayerService.getPlayerDetailWithFallback(playerNumeric);
          if (externalPlayer) {
            console.log('외부 API에서 플레이어 데이터 성공적으로 구성:', externalPlayer.nickname);
            setExternalPlayerData(externalPlayer);
            setLastUpdateTime(new Date());
            setRetryCount(prev => prev + 1);
            
            // 외부 데이터가 있으면 리페치는 하지 않음 (무한 루프 방지)
          } else {
            console.warn('외부 API에서도 플레이어 데이터를 찾을 수 없음');
            setRetryCount(prev => prev + 1);
          }
        } catch (error) {
          console.error('외부 API 폴백 실패:', error);
          setRetryCount(prev => prev + 1);
        } finally {
          setIsExternalFetch(false);
        }
      }
    };

    // 외부 데이터가 이미 있으면 폴백 시도하지 않음
    if (!externalPlayerData) {
      handlePlayerNotFound();
    }
  }, [error, playerNumeric, retryCount, isExternalFetch, externalPlayerData]);

  const handleRefresh = useCallback(() => {
    console.log('수동 새로고침 시작');
    setRetryCount(0);
    setExternalPlayerData(null);
    setLastUpdateTime(null);
    refetch();
  }, [refetch]);

  const handleForceExternalFetch = useCallback(async () => {
    if (!playerNumeric) return;
    
    console.log('강제 외부 API 페치 시작');
    setIsExternalFetch(true);
    
    try {
      const externalPlayer = await EnhancedPlayerService.getPlayerDetailWithFallback(playerNumeric);
      if (externalPlayer) {
        setExternalPlayerData(externalPlayer);
        setLastUpdateTime(new Date());
        console.log('강제 외부 API 페치 성공');
      }
    } catch (error) {
      console.error('강제 외부 API 페치 실패:', error);
    } finally {
      setIsExternalFetch(false);
    }
  }, [playerNumeric]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 현재 표시할 플레이어 데이터 결정
  const currentPlayerData = player || externalPlayerData;
  const isShowingExternalData = !player && externalPlayerData;

  if (!playerNumeric) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <ErrorBoundary>
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">잘못된 플레이어 번호</h2>
            <p className="text-slate-400 mb-4">올바른 플레이어 번호를 확인해주세요.</p>
            <button onClick={handleBack} className="btn-primary">
              돌아가기
            </button>
          </div>
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <ErrorBoundary>
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
              
              <div className="flex items-center gap-3">
                {/* 외부 데이터 표시 중일 때 정보 */}
                {isShowingExternalData && lastUpdateTime && (
                  <div className="flex items-center gap-2 text-sm text-cyan-400 bg-cyan-900/20 px-3 py-1 rounded-full">
                    <ExternalLink className="h-4 w-4" />
                    <span>실시간 데이터</span>
                    <Clock className="h-3 w-3" />
                    <span>{lastUpdateTime.toLocaleTimeString()}</span>
                  </div>
                )}
                
                {/* 강제 외부 페치 버튼 */}
                {!isShowingExternalData && (
                  <button
                    onClick={handleForceExternalFetch}
                    disabled={isExternalFetch}
                    className="flex items-center gap-2 text-sm btn-outline disabled:opacity-50"
                  >
                    <ExternalLink className={`h-4 w-4 ${isExternalFetch ? 'animate-spin' : ''}`} />
                    실시간 데이터
                  </button>
                )}
                
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
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 외부 API 로딩 상태 */}
          {isExternalFetch && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <LoadingSpinner size="sm" />
                <div>
                  <p className="font-medium text-blue-900">실시간 데이터 가져오는 중</p>
                  <p className="text-sm text-blue-700">외부 API에서 최신 정보를 수집하고 있습니다...</p>
                </div>
              </div>
            </div>
          )}

          {/* 재시도 정보 */}
          {retryCount > 0 && !currentPlayerData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                데이터 로드 시도 중... ({retryCount}/3)
              </p>
            </div>
          )}

          {/* 로딩 상태 */}
          {(isLoading && !currentPlayerData) && (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="text-slate-300 mt-4">플레이어 정보를 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && !currentPlayerData && !isLoading && !isExternalFetch && (
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
                <button onClick={handleForceExternalFetch} className="btn-secondary" disabled={isExternalFetch}>
                  {isExternalFetch ? '가져오는 중...' : '실시간 데이터 시도'}
                </button>
                <button onClick={handleBack} className="btn-outline">
                  돌아가기
                </button>
              </div>
            </div>
          )}

          {/* 성공 상태 */}
          {currentPlayerData && (
            <div className="space-y-6">
              {/* 외부 데이터 알림 */}
              {isShowingExternalData && (
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="font-medium text-cyan-900">실시간 데이터로 표시 중</p>
                      <p className="text-sm text-cyan-700">
                        외부 API에서 가져온 최신 정보입니다. 일부 기능이 제한될 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 플레이어 기본 정보 */}
              <EnhancedPlayerProfile 
                playerNum={playerNumeric}
                nickname={currentPlayerData.nickname}
                showMatchHistory={false}
              />



              {/* 매치 히스토리 */}
              {matches && matches.matches.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold text-white mb-4">
                    최근 경기
                  </h2>
                  <MatchHistory 
                    matches={matches.matches}
                    isLoading={false}
                  />
                </div>
              )}

              {/* 매치 히스토리 없을 때 */}
              {(!matches || matches.matches.length === 0) && !isLoading && (
                <div className="card text-center py-12">
                  <div className="text-slate-400">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">최근 경기 정보가 없습니다</h3>
                    <p className="text-sm">
                      {isShowingExternalData 
                        ? '외부 API에서 경기 기록을 찾을 수 없습니다.' 
                        : '아직 경기 기록이 없거나 데이터를 불러올 수 없습니다.'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}; 