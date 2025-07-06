// src/App.tsx
import React, { useState } from 'react';
import { EnhancedSearchBar } from './components/EnhancedSearchBar';
import { EnhancedPlayerProfile } from './components/EnhancedPlayerProfile';
import { MatchHistoryTable } from './components/MatchHistoryTable';
import { PlayerSearchResults } from './components/PlayerSearchResults';
import { CharacterStats } from './components/CharacterStats';
import { apiService } from './services/api';
import { AlertCircle, Gamepad2, Loader2, WifiOff } from 'lucide-react';
import type { NicknameDto, Player, BserGameDto, BserUserDetailDto, BserCharacterStatsDto } from './types/game';

function App() {
  const [searchResults, setSearchResults] = useState<NicknameDto[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerStats, setPlayerStats] = useState<BserUserDetailDto | null>(null);
  const [playerMatches, setPlayerMatches] = useState<BserGameDto[]>([]);
  const [characterStats, setCharacterStats] = useState<BserCharacterStatsDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  const handleSearch = async (nickname: string) => {
    setIsSearching(true);
    setError(null);
    setConnectionError(false);
    setSearchResults([]);
    setSelectedPlayer(null);
    setPlayerStats(null);
    setPlayerMatches([]);
    setCharacterStats([]);

    try {
      const response = await apiService.searchPlayerByNickname(nickname);
      if (response.code === 200 && response.data) {
        setSearchResults(response.data);

        // 검색 결과가 1개면 자동으로 선택
        if (response.data.length === 1) {
          handleSelectPlayer(response.data[0].userNum);
        }
      } else {
        setError(response.message || "플레이어를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error('Search error:', err);

      // 연결 오류 처리
      if (err instanceof Error && err.message.includes("서버에 연결할 수 없습니다")) {
        setConnectionError(true);
        setError("서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.");
      } else if (err instanceof Error && err.message.includes("요청 시간이 초과")) {
        setError("요청 시간이 초과되었습니다. 서버 응답이 지연되고 있습니다.");
      } else {
        setError("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlayer = async (userNum: number) => {
    setIsLoadingPlayer(true);
    setError(null);

    try {
      const playerInfo = await apiService.getCompletePlayerInfo(userNum, 22); // 시즌 22 기준

      setSelectedPlayer(playerInfo.player);
      setPlayerStats(playerInfo.stats);
      setPlayerMatches(playerInfo.matches);
      setCharacterStats(playerInfo.characterStats);
    } catch (err) {
      console.error('Player info error:', err);
      setError("플레이어 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingPlayer(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 🌟 배경 애니메이션 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse floating-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse floating-animation delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse floating-animation delay-2000"></div>
      </div>

      {/* 🎨 헤더 */}
      <header className="relative border-b border-gray-700/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg neon-glow">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-gaming">
                이터널리턴 전적검색
              </h1>
              <p className="text-gray-400 text-sm">Eternal Return Battle Royale Stats</p>
            </div>
            <div className="ml-auto">
              <div className="px-4 py-2 rounded-full glass-effect text-gray-300 text-sm border border-gray-600/30">
                ERIWA v3.0
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🔍 검색 섹션 */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">플레이어 검색</h2>
            <p className="text-gray-400 text-lg">이터널리턴 플레이어의 전적과 통계를 확인해보세요</p>
          </div>
          <EnhancedSearchBar onSearch={handleSearch} isLoading={isSearching} />
        </div>

        {/* ⚠️ 연결 오류 메시지 */}
        {connectionError && (
          <div className="mb-6 border border-yellow-500/30 glass-effect rounded-2xl">
            <div className="p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <WifiOff className="w-12 h-12 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">서버 연결 오류</h3>
                  <p className="text-yellow-200 mb-2">서버에 연결할 수 없습니다. 현재 모의 데이터로 작동 중입니다.</p>
                  <p className="text-sm text-yellow-400">실제 API 서버가 준비되면 이 메시지는 사라집니다.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ❌ 에러 메시지 */}
        {error && !connectionError && (
          <div className="mb-6 border border-red-500/30 bg-red-900/20 glass-effect rounded-2xl">
            <div className="p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* 🔍 검색 결과 */}
        {searchResults.length > 1 && (
          <div className="mb-6">
            <PlayerSearchResults
              players={searchResults}
              onSelectPlayer={handleSelectPlayer}
              isLoading={isLoadingPlayer}
            />
          </div>
        )}

        {/* ⏳ 로딩 중 */}
        {isLoadingPlayer && (
          <div className="text-center py-12 mb-6 glass-effect border border-gray-700/50 rounded-2xl">
            <div className="p-6">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
              <p className="text-gray-400">플레이어 정보를 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* 📊 플레이어 정보 */}
        {selectedPlayer && (
          <div className="space-y-6">
            <EnhancedPlayerProfile 
              player={selectedPlayer} 
              stats={playerStats} 
              characterStats={characterStats} 
            />

            {characterStats.length > 0 && <CharacterStats characterStats={characterStats} />}

            {playerMatches.length > 0 && <MatchHistoryTable matches={playerMatches} />}
          </div>
        )}

        {/* 🎮 환영 메시지 */}
        {!selectedPlayer && !isSearching && !isLoadingPlayer && searchResults.length === 0 && !error && (
          <div className="text-center py-12 glass-effect border border-gray-700/50 rounded-2xl">
            <div className="p-6">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 hover-scale">
                <Gamepad2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">플레이어를 검색해보세요</h3>
              <p className="text-gray-400 text-lg">닉네임을 입력하여 이터널리턴 전적을 확인할 수 있습니다</p>
            </div>
          </div>
        )}
      </main>

      {/* 🔗 푸터 */}
      <footer className="relative mt-16 border-t border-gray-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">© 2024 이터널리턴 전적검색. All rights reserved.</p>
            <p className="text-sm">이 사이트는 공식 이터널리턴 사이트가 아닙니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
