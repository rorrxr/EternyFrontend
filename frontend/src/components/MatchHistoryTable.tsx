import React, { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import type { BserGameDto } from '../types/game';

interface MatchHistoryTableProps {
  matches: BserGameDto[];
  title?: string;
}

export const MatchHistoryTable: React.FC<MatchHistoryTableProps> = ({ 
  matches, 
  title = "최근 경기" 
}) => {
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [visibleMatches, setVisibleMatches] = useState(10);

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank <= 3) return "from-gray-300 to-gray-500";
    if (rank <= 8) return "from-green-400 to-green-600";
    return "from-red-400 to-red-600";
  };

  const getGameModeColor = (mode: number) => {
    const modes: { [key: number]: string } = {
      0: "bg-blue-100/20 text-blue-300 border-blue-400/30",
      1: "bg-purple-100/20 text-purple-300 border-purple-400/30",
      2: "bg-green-100/20 text-green-300 border-green-400/30",
      3: "bg-orange-100/20 text-orange-300 border-orange-400/30",
    };
    return modes[mode] || "bg-gray-100/20 text-gray-300 border-gray-400/30";
  };

  const getGameModeName = (teamMode: number) => {
    switch (teamMode) {
      case 1: return "솔로";
      case 2: return "듀오";
      case 3: return "스쿼드";
      default: return "기타";
    }
  };

  const formatGameTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const toggleMatchExpansion = (gameId: number) => {
    setExpandedMatch(expandedMatch === gameId ? null : gameId);
  };

  return (
    <div className="glass-effect rounded-2xl border border-gray-700/50 overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-600 to-purple-600 p-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          {title}
          <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">
            {matches.length}게임
          </span>
        </h2>
      </div>
      
      <div className="divide-y divide-gray-700/50">
        {matches.slice(0, visibleMatches).map((match) => (
          <div key={match.gameId}>
            <div
              className="p-4 hover:bg-gray-800/30 cursor-pointer transition-all duration-300"
              onClick={() => toggleMatchExpansion(match.gameId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* 순위 */}
                  <div className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getRankColor(match.gameRank)} text-white shadow-lg`}>
                    #{match.gameRank}
                  </div>

                  {/* 캐릭터 */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {match.characterName ? match.characterName[0] : 'C'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {match.characterName || `캐릭터 ${match.characterNum}`}
                      </div>
                      <div className="text-sm text-gray-400">
                        레벨 {match.masteryLevel?.[match.characterNum] || 1}
                      </div>
                    </div>
                  </div>

                  {/* 게임 모드 */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getGameModeColor(match.matchingMode)}`}>
                    {getGameModeName(match.teamMode)}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  {/* KDA */}
                  <div className="text-center">
                    <div className="text-sm text-gray-400">K/A</div>
                    <div className="font-semibold text-cyan-400">
                      {match.playerKill}/{match.playerAssistant}
                    </div>
                  </div>

                  {/* 팀 킬 */}
                  <div className="text-center">
                    <div className="text-sm text-gray-400">팀 킬</div>
                    <div className="font-semibold text-white">{match.teamKill}</div>
                  </div>

                  {/* 플레이 시간 */}
                  <div className="text-center">
                    <div className="text-sm text-gray-400">시간</div>
                    <div className="font-semibold text-white">{formatGameTime(match.playTime)}</div>
                  </div>

                  {/* 확장 버튼 */}
                  <button className="text-gray-400 hover:text-white transition-colors">
                    {expandedMatch === match.gameId ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 확장된 상세 정보 */}
            {expandedMatch === match.gameId && (
              <div className="px-4 pb-4 bg-gray-800/30 border-t border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">게임 정보</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div>게임 ID: {match.gameId}</div>
                      <div>서버: {match.serverName || 'Unknown'}</div>
                      <div>팀 순위: #{match.teamRank || match.gameRank}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">주무기</h4>
                    <div className="text-sm text-cyan-400">
                      {match.bestWeaponName || `무기 ${match.bestWeapon}`}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">장비</h4>
                    <div className="flex gap-1 flex-wrap">
                      {match.equipment?.slice(0, 6).map((item, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-1 text-xs bg-gray-700/50 border border-gray-600/30 rounded text-gray-300"
                        >
                          {item.itemName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      {visibleMatches < matches.length && (
        <div className="p-4 text-center border-t border-gray-700/50">
          <button
            onClick={() => setVisibleMatches(prev => prev + 10)}
            className="btn-gaming px-6 py-2 rounded-xl transition-all duration-300"
          >
            더보기 ({matches.length - visibleMatches}게임 남음)
          </button>
        </div>
      )}
    </div>
  );
}; 