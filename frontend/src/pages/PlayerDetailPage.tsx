import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, ExternalLink, Clock, Wifi, WifiOff, Info } from 'lucide-react';
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
  const [dataSource, setDataSource] = useState<'internal' | 'external' | 'mixed'>('internal');

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
        setDataSource('external');
        
        try {
          const externalPlayer = await EnhancedPlayerService.getPlayerDetailWithFallback(playerNumeric);
          if (externalPlayer) {
            console.log('외부 API에서 플레이어 데이터 성공적으로 구성:', externalPlayer.nickname);
            setExternalPlayerData(externalPlayer);
            setLastUpdateTime(new Date());
            setRetryCount(prev => prev + 1);
            setDataSource('external');
            
            // 외부 데이터가 있으면 리페치는 하지 않음 (무한 루프 방지)
          } else {
            console.warn('외부 API에서도 플레이어 데이터를 찾을 수 없음');
            setRetryCount(prev => prev + 1);
          }
        } catch (fetchError) {
          console.error('외부 API 페치 실패:', fetchError);
          setRetryCount(prev => prev + 1);
        } finally {
          setIsExternalFetch(false);
        }
      }
    };

    handlePlayerNotFound();
  }, [error, playerNumeric, retryCount, isExternalFetch]);

  // 🔄 강제 외부 페치 기능 (사용자 요청)
  const handleForceExternalFetch = useCallback(async () => {
    if (!playerNumeric || isExternalFetch) return;
    
    console.log('사용자 요청으로 강제 외부 데이터 페치 시작');
    setIsExternalFetch(true);
    
    try {
      const externalPlayer = await EnhancedPlayerService.getPlayerDetailWithFallback(playerNumeric);
      if (externalPlayer) {
        setExternalPlayerData(externalPlayer);
        setLastUpdateTime(new Date());
        setDataSource('external');
        console.log('강제 외부 페치 성공');
      }
    } catch (error) {
      console.error('강제 외부 페치 실패:', error);
    } finally {
      setIsExternalFetch(false);
    }
  }, [playerNumeric, isExternalFetch]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleRefresh = useCallback(async () => {
    console.log('페이지 새로고침 시작');
    setExternalPlayerData(null);
    setLastUpdateTime(null);
    setRetryCount(0);
    setDataSource('internal');
    await refetch();
  }, [refetch]);

  // 🎯 실제 표시할 플레이어 데이터 결정
  const displayPlayer = player || externalPlayerData;
  const isShowingExternalData = !player && externalPlayerData;
  const hasValidData = !!(displayPlayer || matches || rank);

  // 📊 데이터 신뢰성 및 최신성 정보
  const getDataSourceInfo = () => {
    if (isShowingExternalData) {
      return {
        icon: <Wifi className="h-4 w-4" />,
        label: '실시간 외부 데이터',
        color: 'text-cyan-400 bg-cyan-900/20',
        description: '이터널리턴 공식 API에서 실시간으로 가져온 최신 데이터입니다.',
        reliability: '높음'
      };
    } else if (player) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        label: '내부 데이터베이스',
        color: 'text-green-400 bg-green-900/20',
        description: '서버에 저장된 데이터를 표시하고 있습니다.',
        reliability: '매우 높음'
      };
    }
    return null;
  };

  const dataSourceInfo = getDataSourceInfo();

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
                {/* 🔔 데이터 소스 알림 (개선된 버전) */}
                {dataSourceInfo && (
                  <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${dataSourceInfo.color} border-current/20`}>
                    {dataSourceInfo.icon}
                    <span className="font-medium">{dataSourceInfo.label}</span>
                    {lastUpdateTime && (
                      <>
                        <Clock className="h-3 w-3 ml-2" />
                        <span className="text-xs opacity-75">
                          {lastUpdateTime.toLocaleTimeString()}
                        </span>
                      </>
                    )}
                  </div>
                )}
                
                {/* 강제 외부 페치 버튼 */}
                {!isShowingExternalData && !isLoading && (
                  <button
                    onClick={handleForceExternalFetch}
                    disabled={isExternalFetch}
                    className="flex items-center gap-2 text-sm btn-outline disabled:opacity-50 hover:bg-cyan-900/20"
                    title="이터널리턴 공식 API에서 최신 데이터를 가져옵니다"
                  >
                    {isExternalFetch ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    최신 데이터 가져오기
                  </button>
                )}
                
                {/* 새로고침 버튼 */}
                <button
                  onClick={handleRefresh}
                  disabled={isLoading || isExternalFetch}
                  className="flex items-center gap-2 text-sm btn-outline disabled:opacity-50"
                  title="페이지를 새로고침합니다"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  새로고침
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 데이터 신뢰성 정보 패널 (외부 데이터 사용 시) */}
        {isShowingExternalData && dataSourceInfo && (
          <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-b border-cyan-800/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-cyan-400 mb-1">
                    실시간 외부 데이터 사용 중
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dataSourceInfo.description} 
                    <span className="ml-2 px-2 py-0.5 bg-cyan-900/30 rounded text-cyan-300 font-medium">
                      신뢰도: {dataSourceInfo.reliability}
                    </span>
                  </p>
                  {lastUpdateTime && (
                    <p className="text-xs text-slate-400 mt-1">
                      마지막 업데이트: {lastUpdateTime.toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setExternalPlayerData(null)}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                  title="외부 데이터 표시를 중단합니다"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && !hasValidData ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-slate-300 text-lg">
                {isExternalFetch ? '외부 API에서 데이터를 가져오는 중...' : '플레이어 정보를 불러오는 중...'}
              </span>
            </div>
          ) : error && !hasValidData ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">데이터를 불러올 수 없습니다</h2>
              <p className="text-slate-400 mb-6">
                플레이어 정보를 찾을 수 없거나 일시적인 오류가 발생했습니다.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={handleRefresh} className="btn-primary">
                  다시 시도
                </button>
                <button onClick={handleForceExternalFetch} className="btn-outline">
                  외부 API로 재시도
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 플레이어 프로필 */}
              {displayPlayer && (
                <EnhancedPlayerProfile 
                  playerNum={playerNumeric}
                  nickname={displayPlayer.nickname}
                  showMatchHistory={false}
                />
              )}
              
              {/* 매치 히스토리 */}
              {matches && matches.matches && matches.matches.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>매치 히스토리</span>
                    {isShowingExternalData && (
                      <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded-full">
                        실시간
                      </span>
                    )}
                  </h2>
                  <MatchHistory 
                    matches={matches.matches} 
                    characterStats={[]}
                    isLoading={isLoading}
                    hasMore={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}; 