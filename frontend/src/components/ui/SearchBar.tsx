// components/ui/SearchBar.tsx - 검색 컴포넌트
import React, { useState, useCallback } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useDebounce } from '../../utils/performance';

interface SearchBarProps {
  onSearch: (term: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading = false,
  placeholder = "플레이어 닉네임을 입력하세요"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { searchHistory, recentPlayers, addToSearchHistory } = usePlayerStore();
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  React.useEffect(() => {
    if (debouncedSearch.length >= 2) {
      onSearch(debouncedSearch);
      addToSearchHistory(debouncedSearch);
    }
  }, [debouncedSearch, onSearch, addToSearchHistory]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchTerm(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    addToSearchHistory(suggestion);
  }, [onSearch, addToSearchHistory]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setShowSuggestions(false);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* 메인 검색 입력 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 transition-colors ${
            isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-400'
          }`} />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
          className={`input-primary pl-12 pr-12 py-4 text-lg ${
            isLoading ? 'ring-2 ring-blue-200' : ''
          }`}
          disabled={isLoading}
        />
        
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 검색 제안 드롭다운 */}
      {showSuggestions && (searchHistory.length > 0 || recentPlayers.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 z-50 max-h-80 overflow-y-auto">
          {/* 최근 검색어 */}
          {searchHistory.length > 0 && (
            <div className="p-3 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-slate-300">최근 검색</span>
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(term)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 최근 조회한 플레이어 */}
          {recentPlayers.length > 0 && (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-slate-300">최근 조회</span>
              </div>
              <div className="space-y-1">
                {recentPlayers.map((player) => (
                  <button
                    key={player.userNum}
                    onClick={() => handleSuggestionClick(player.nickname)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {player.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {player.nickname}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          #{player.userNum}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 