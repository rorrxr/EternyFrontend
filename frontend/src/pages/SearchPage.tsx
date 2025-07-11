import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedSearchBar } from '../components/EnhancedSearchBar';
import { PlayerCard } from '../components/player/PlayerCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PopularSearches } from '../components/PopularSearches';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { PlayerSearchResult } from '../types/player';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSearchResult | null>(null);

  const {
    searchTerm,
    searchResults,
    isSearching,
    searchError,
    searchPlayer,
    selectPlayer,
    isSelectingPlayer,
    selectPlayerError
  } = usePlayerSearch();

  // 플레이어 선택 처리 (로그 문제 해결 - 더 강화된 에러 처리)
  const handlePlayerSelect = useCallback(async (player: PlayerSearchResult) => {
    try {
      setSelectedPlayer(player);
      
      console.log('플레이어 선택 시작:', player.nickname, player.userNum);
      
      // 플레이어 선택 시 상세 정보 미리 로드
      await selectPlayer(player);
      
      console.log('플레이어 선택 성공, 페이지 이동 중...');
      
      // 성공 시 상세 페이지로 이동
      navigate(`/player/${player.userNum}`);
    } catch (error) {
      // 로그 문제 해결: 에러 발생 시에도 페이지는 이동 (외부 API에서 데이터 구성 시도)
      console.warn('플레이어 선택 중 에러 발생, 외부 API 폴백으로 페이지 이동:', error);
      handleError('playerSelect', error);
      
      // 에러가 발생해도 페이지 이동 - PlayerDetailPage에서 외부 API 폴백 처리
      navigate(`/player/${player.userNum}`);
    } finally {
      setSelectedPlayer(null);
    }
  }, [selectPlayer, navigate, handleError]);

  const handleSearch = useCallback((term: string) => {
    console.log('검색 시작:', term);
    searchPlayer(term);
  }, [searchPlayer]);

  // 인기 검색어 클릭 처리
  const handlePopularSearch = useCallback((term: string) => {
    console.log('인기 검색어 클릭:', term);
    handleSearch(term);
  }, [handleSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              플레이어 검색
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              이터널리턴 플레이어의 전적과 통계를 확인해보세요
            </p>
            
            {/* 메인 검색바 - Enhanced 버전 사용 */}
            <div className="max-w-2xl mx-auto">
              <EnhancedSearchBar
                onSearch={handleSearch}
                placeholder="플레이어 닉네임을 입력하세요"
                showSuggestions={true}
                showHistory={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 검색 결과 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <ErrorBoundary>
          {/* 로딩 상태 */}
          {isSearching && (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="text-slate-300 mt-4">플레이어를 검색하는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {searchError && (
            <div className="text-center py-12">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-red-600 dark:text-red-400 mb-3">
                  검색 중 오류가 발생했습니다.
                </p>
                <button 
                  onClick={() => handleSearch(searchTerm)}
                  className="btn-primary"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* 플레이어 선택 에러 */}
          {selectPlayerError && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
              <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                플레이어 정보 로드 중 오류가 발생했지만 페이지로 이동합니다. 상세 페이지에서 외부 API를 통해 데이터를 구성합니다.
              </p>
            </div>
          )}

          {/* 검색 결과 */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">
                검색 결과 ({searchResults.length}명)
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((player) => (
                  <div key={player.userNum} className="relative">
                    <PlayerCard
                      player={player}
                      onSelect={handlePlayerSelect}
                      isSelected={selectedPlayer?.userNum === player.userNum}
                      variant="detailed"
                    />
                    
                    {/* 선택 중 로딩 오버레이 */}
                    {isSelectingPlayer && selectedPlayer?.userNum === player.userNum && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                          <LoadingSpinner size="sm" />
                          <span className="text-sm font-medium">데이터 로드 중...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 검색어가 있지만 결과가 없는 경우 */}
          {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && !searchError && (
            <div className="text-center py-12">
              <div className="bg-slate-800 rounded-xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-white mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-slate-400 mb-4">
                  '{searchTerm}'에 대한 플레이어를 찾을 수 없습니다.
                </p>
                <p className="text-slate-500 text-sm">
                  정확한 닉네임으로 다시 검색해보세요.
                </p>
              </div>
            </div>
          )}

          {/* 인기 검색어 (검색 전 상태) */}
          {!searchTerm && (
            <PopularSearches onSearchTermClick={handlePopularSearch} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}; 