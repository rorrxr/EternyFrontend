import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/ui/SearchBar';
import { PlayerCard } from '../components/player/PlayerCard';
import { LoadingSpinner } from '../components/layout/LoadingStates';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { PlayerSearchResult } from '../types/player';

// 인기 검색어 컴포넌트
const PopularSearches: React.FC<{ onSearchTermClick: (term: string) => void }> = ({ onSearchTermClick }) => (
  <div className="text-center py-12">
    <h3 className="text-xl font-semibold text-white mb-6">인기 검색어</h3>
    <div className="flex flex-wrap justify-center gap-3">
      {['Faker', 'Hide on bush', 'Dopa', 'Canyon'].map((term) => (
        <button
          key={term}
          onClick={() => onSearchTermClick(term)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors"
        >
          {term}
        </button>
      ))}
    </div>
  </div>
);

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

  // 플레이어 선택 처리 (로그에서 본 문제 해결)
  const handlePlayerSelect = useCallback(async (player: PlayerSearchResult) => {
    try {
      setSelectedPlayer(player);
      
      // 플레이어 선택 시 상세 정보 미리 로드
      await selectPlayer(player);
      
      // 성공 시 상세 페이지로 이동
      navigate(`/player/${player.userNum}`);
    } catch (error) {
      // 에러 발생 시에도 페이지는 이동 (외부 API에서 데이터 구성 시도)
      handleError('playerSelect', error);
      navigate(`/player/${player.userNum}`);
    }
  }, [selectPlayer, navigate, handleError]);

  const handleSearch = useCallback((term: string) => {
    searchPlayer(term);
  }, [searchPlayer]);

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
            
            {/* 메인 검색바 */}
            <div className="max-w-2xl mx-auto">
              <SearchBar
                onSearch={handleSearch}
                isLoading={isSearching}
                placeholder="플레이어 닉네임을 입력하세요"
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
                <p className="text-red-600 dark:text-red-400">
                  검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </p>
              </div>
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
                <p className="text-slate-400">
                  '{searchTerm}'에 대한 플레이어를 찾을 수 없습니다.
                </p>
              </div>
            </div>
          )}

          {/* 인기 검색어 (검색 전 상태) */}
          {!searchTerm && (
            <PopularSearches onSearchTermClick={handleSearch} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}; 