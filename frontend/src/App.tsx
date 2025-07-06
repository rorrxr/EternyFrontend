// src/App.tsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  searchPlayer,
  getUserStats,
  getPlayerMatches,
  getRanking,
  getUserRank
} from './services/api';
import { Player, NicknameDto, BserGameDto, BserUserDetailDto } from './types/api';
import './App.css';

// 전역 상태 관리를 위한 Context
interface AppContextType {
  currentPlayer: Player | null;
  setCurrentPlayer: (player: Player | null) => void;
  searchHistory: string[];
  addSearchHistory: (nickname: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// 검색 컴포넌트
const SearchComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<NicknameDto[]>([]);
  const { setCurrentPlayer, addSearchHistory, loading, setLoading, setError } = useAppContext();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 닉네임으로 유저 검색
      const results = await searchPlayer(searchQuery.trim());
      setSearchResults(results);
      
      if (results.length === 1) {
        // 결과가 하나면 바로 해당 플레이어로 이동
        const playerDetail = await getUserRank(results[0].userNum, 25, 1);
        setCurrentPlayer(playerDetail);
        addSearchHistory(searchQuery.trim());
        navigate(`/player/${results[0].userNum}`);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError(error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlayer = async (player: NicknameDto) => {
    setLoading(true);
    try {
      const playerDetail = await getUserRank(player.userNum, 25, 1);
      setCurrentPlayer(playerDetail);
      addSearchHistory(player.nickname);
      navigate(`/player/${player.userNum}`);
    } catch (error) {
      console.error('Failed to get player detail:', error);
      setError('플레이어 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          placeholder="닉네임을 입력하세요"
          className="search-input"
          disabled={loading}
        />
        <button type="submit" className="search-button" disabled={loading || !searchQuery.trim()}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </form>

      {searchResults.length > 1 && (
        <div className="search-results">
          <h3>검색 결과</h3>
          <ul>
            {searchResults.map((player) => (
              <li key={player.userNum}>
                <button
                  onClick={() => handleSelectPlayer(player)}
                  className="player-result-button"
                >
                  {player.nickname}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// 홈 페이지 컴포넌트
const HomePage: React.FC = () => {
  const { searchHistory } = useAppContext();

  return (
    <div className="home-page">
      <header className="hero-section">
        <h1>이터널리턴 전적검색</h1>
        <p>플레이어의 전적과 통계를 확인해보세요</p>
        <SearchComponent />
      </header>

      {searchHistory.length > 0 && (
        <section className="recent-searches">
          <h2>최근 검색</h2>
          <div className="search-history">
            {searchHistory.slice(-5).reverse().map((nickname, index) => (
              <span key={index} className="history-item">
                {nickname}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="quick-links">
        <h2>빠른 이동</h2>
        <div className="link-grid">
          <Link to="/ranking" className="quick-link">
            랭킹 보기
          </Link>
          <Link to="/stats" className="quick-link">
            통계
          </Link>
        </div>
      </section>
    </div>
  );
};

// 플레이어 상세 페이지 컴포넌트
const PlayerDetailPage: React.FC<{ userNum: string }> = ({ userNum }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<BserGameDto[]>([]);
  const [stats, setStats] = useState<BserUserDetailDto | null>(null);
  const { loading, setLoading, setError } = useAppContext();

  useEffect(() => {
    const loadPlayerData = async () => {
      setLoading(true);
      setError(null);

      try {
        const playerNum = parseInt(userNum);
        
        // 병렬로 데이터 로드
        const [playerDetail, playerMatches] = await Promise.all([
          getUserRank(playerNum, 25, 1),
          getPlayerMatches(playerNum)
        ]);

        setPlayer(playerDetail);
        setMatches(playerMatches);

        // 현재 시즌 통계 로드 (시즌 ID는 실제 값으로 변경 필요)
        try {
          const currentSeasonStats = await getUserStats(playerNum, 25);
          setStats(currentSeasonStats);
        } catch (error) {
          console.warn('Failed to load stats:', error);
        }
      } catch (error) {
        console.error('Failed to load player data:', error);
        setError('플레이어 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [userNum, setLoading, setError]);

  if (!player) {
    return <div className="loading">플레이어 정보를 불러오는 중...</div>;
  }

  return (
    <div className="player-detail-page">
      <div className="player-header">
        <h1>{player.nickname}</h1>
        {stats && (
          <div className="player-stats">
            <div className="stat-item">
              <span className="stat-label">랭크</span>
              <span className="stat-value">{stats.rank}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">MMR</span>
              <span className="stat-value">{stats.mmr}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">승률</span>
              <span className="stat-value">{stats.winRate.toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">평균 킬</span>
              <span className="stat-value">{stats.averageKills.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="matches-section">
        <h2>최근 경기</h2>
        <div className="matches-list">
          {matches.slice(0, 10).map((match) => (
            <div key={match.gameId} className="match-item">
              <div className="match-rank">#{match.gameRank}</div>
              <div className="match-character">{match.characterName || `캐릭터 ${match.characterNum}`}</div>
              <div className="match-kda">
                {match.playerKill}/{match.playerAssistant}
              </div>
              <div className="match-date">
                {new Date(match.startDtm).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 랭킹 페이지 컴포넌트
const RankingPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const { loading, setLoading, setError } = useAppContext();

  const loadRanking = async (page: number = 0, tier?: string) => {
    setLoading(true);
    setError(null);

    try {
      const ranking = await getRanking(page, 50);
      setPlayers(ranking);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load ranking:', error);
      setError('랭킹을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanking(0, selectedTier);
  }, [selectedTier]);

  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTier(e.target.value);
  };

  return (
    <div className="ranking-page">
      <h1>랭킹</h1>
      
      <div className="ranking-filters">
        <select value={selectedTier} onChange={handleTierChange}>
          <option value="">전체 티어</option>
          <option value="IMMORTAL">이모탈</option>
          <option value="TITAN">타이탄</option>
          <option value="DIAMOND">다이아몬드</option>
          <option value="PLATINUM">플래티넘</option>
          <option value="GOLD">골드</option>
          <option value="SILVER">실버</option>
          <option value="BRONZE">브론즈</option>
        </select>
      </div>

      <div className="ranking-list">
        {players.map((player, index) => (
          <div key={player.userNum} className="ranking-item">
            <div className="rank-number">{currentPage * 50 + index + 1}</div>
            <div className="player-info">
              <Link to={`/player/${player.userNum}`} className="player-name">
                {player.nickname}
              </Link>
              <div className="player-tier">{player.tier}</div>
            </div>
            <div className="player-mmr">{player.mmr} MMR</div>
            <div className="player-winrate">
              {player.totalGames ? ((player.totalWins || 0) / player.totalGames * 100).toFixed(1) : 0}%
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => loadRanking(currentPage - 1, selectedTier)}
          disabled={currentPage === 0 || loading}
        >
          이전
        </button>
        <span>페이지 {currentPage + 1}</span>
        <button
          onClick={() => loadRanking(currentPage + 1, selectedTier)}
          disabled={loading}
        >
          다음
        </button>
      </div>
    </div>
  );
};

// 에러 경계 컴포넌트
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { error, setError } = useAppContext();

  if (error) {
    return (
      <div className="error-boundary">
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={() => setError(null)}>다시 시도</button>
      </div>
    );
  }

  return <>{children}</>;
};

// 메인 App 컴포넌트
const App: React.FC = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addSearchHistory = (nickname: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== nickname);
      return [nickname, ...filtered].slice(0, 10); // 최대 10개까지 저장
    });
  };

  const contextValue: AppContextType = {
    currentPlayer,
    setCurrentPlayer,
    searchHistory,
    addSearchHistory,
    loading,
    setLoading,
    error,
    setError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <div className="App">
          <nav className="main-navigation">
            <Link to="/" className="nav-logo">
              이터널리턴 전적검색
            </Link>
            <div className="nav-links">
              <Link to="/">홈</Link>
              <Link to="/ranking">랭킹</Link>
            </div>
          </nav>

          <main className="main-content">
            <ErrorBoundary>
              {loading && <div className="global-loading">로딩 중...</div>}
              
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route 
                  path="/player/:userNum" 
                  element={
                    <PlayerDetailPage 
                      userNum={window.location.pathname.split('/').pop() || '0'} 
                    />
                  } 
                />
                <Route path="/ranking" element={<RankingPage />} />
                <Route 
                  path="*" 
                  element={
                    <div className="not-found">
                      <h1>페이지를 찾을 수 없습니다</h1>
                      <Link to="/">홈으로 돌아가기</Link>
                    </div>
                  } 
                />
              </Routes>
            </ErrorBoundary>
          </main>

          <footer className="main-footer">
            <p>&copy; 2025 이터널리턴 전적검색. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
