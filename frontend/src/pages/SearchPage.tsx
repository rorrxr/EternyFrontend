import { useState } from 'react';
import {
  searchUser,
  getBserGames,
  getBserRank,
  NicknameData,
  BserGameDto,
  UserRankData
} from '../services/api';

interface MatchHistoryItem {
  gameId: number;
  startDtm: string;
  gameRank: number;
  playerKill: number;
  playerAssistant: number;
  mmrGain: number;
}

const SearchPage = () => {
  const [nickname, setNickname] = useState('');
  const [searchResults, setSearchResults] = useState<NicknameData[]>([]);
  const [selectedUser, setSelectedUser] = useState<{
    userNum: number;
    nickname: string;
    mmr: number;
    rank: number;
    serverRank: number;
  } | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!nickname.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const results = await searchUser(nickname);
      console.log('Search results:', results);

      if (results.length === 0) {
        setSearchResults([]);
        setError('검색 결과가 없습니다.');
      } else {
        setSearchResults(results);
        // 엔터 시 첫 번째 결과를 자동 선택
        await handleUserSelect(results[0]);
      }
    } catch (err) {
      console.error('Error in search:', err);
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user: NicknameData) => {
    setLoading(true);
    try {
      const [rank, games] = await Promise.all([
        getBserRank(user.userNum),
        getBserGames(user.userNum)
      ]);
      console.log('랭크', rank);
      console.log('게임 전적', games);
      setSelectedUser({
        userNum: user.userNum,
        nickname: user.nickname,
        mmr: rank.mmr,
        rank: rank.rank,
        serverRank: rank.serverRank
      });
      setMatchHistory(
        games.map(g => ({
          gameId: g.gameId,
          startDtm: g.startDtm,
          gameRank: g.gameRank,
          playerKill: g.playerKill,
          playerAssistant: g.playerAssistant,
          mmrGain: g.mmrGain
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '유저 정보 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">이터널 리턴 전적 검색</h1>

      {/* 검색 입력 */}
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="닉네임을 입력하세요"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`px-4 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          검색
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* 로딩 표시 */}
      {loading && <div className="text-center py-8">로딩 중...</div>}

      {/* 검색 결과 리스트 */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">검색 결과</h2>
          <div className="grid gap-4">
            {searchResults.map(user => (
              <div
                key={user.userNum}
                onClick={() => handleUserSelect(user)}
                className="p-4 bg-white rounded cursor-pointer border hover:bg-gray-50"
              >
                <div className="font-medium">{user.nickname}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 유저 정보 & 전적 */}
      {selectedUser && (
        <div className="space-y-8">
          {/* 유저 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded">
              <div className="text-sm text-gray-500">MMR</div>
              <div className="text-2xl font-bold">{selectedUser.mmr}</div>
            </div>
            <div className="p-4 bg-white rounded">
              <div className="text-sm text-gray-500">랭크</div>
              <div className="text-2xl font-bold">{selectedUser.rank}</div>
            </div>
            <div className="p-4 bg-white rounded">
              <div className="text-sm text-gray-500">전체 랭크</div>
              <div className="text-2xl font-bold">{selectedUser.serverRank}</div>
            </div>
          </div>

          {/* 최근 전적 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">최근 전적</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    {['순위', '킬', '어시스트', 'MMR 변화', '시간'].map(col => (
                      <th
                        key={col}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matchHistory.map(match => (
                    <tr key={match.gameId} className="border-t">
                      <td className="px-4 py-2">{match.gameRank}위</td>
                      <td className="px-4 py-2">{match.playerKill}</td>
                      <td className="px-4 py-2">{match.playerAssistant}</td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            match.mmrGain >= 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {match.mmrGain >= 0 ? '+' : ''}
                          {match.mmrGain}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">
                        {new Date(match.startDtm).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
