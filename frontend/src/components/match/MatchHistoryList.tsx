// components/match/MatchHistoryList.tsx - 매치 히스토리 리스트
import React from 'react';
import { Match } from '../../types/game';

interface MatchHistoryListProps {
  matches: Match[];
}

export const MatchHistoryList: React.FC<MatchHistoryListProps> = ({ matches }) => {
  return (
    <div className="space-y-3">
      {matches.map((match, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              match.gameRank === 1 ? 'bg-yellow-500' : 
              match.gameRank <= 3 ? 'bg-gray-400' : 
              match.gameRank <= 8 ? 'bg-orange-500' : 'bg-red-500'
            }`}>
              #{match.gameRank}
            </div>
            <div>
                             <div className="font-medium text-gray-900 dark:text-white">
                 {match.characterName || 'Unknown Character'}
               </div>
               <div className="text-sm text-gray-500">
                 {match.gameMode}
               </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {match.playTime}분
            </div>
                         <div className="text-xs text-gray-500">
               최근 경기
             </div>
          </div>
        </div>
      ))}
      
      {matches.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          매치 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}; 