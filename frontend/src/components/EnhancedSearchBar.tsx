import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, History, X, TrendingUp } from 'lucide-react';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { usePlayerStore } from '../store/playerStore';
import { useDebounce } from '../hooks/useDebounce';
import { PlayerSearchResult } from '../types/player';

interface EnhancedSearchBarProps {
  onSearch: (nickname: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  showHistory?: boolean;
}

interface DropdownItem {
  type: 'history' | 'recent' | 'suggestion';
  value: string;
  label: string;
  icon: React.ReactNode;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearch,
  placeholder = "플레이어 닉네임을 입력하세요",
  showSuggestions = true,
  showHistory = true,
}) => {
  const [nickname, setNickname] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedNickname = useDebounce(nickname, 300);
  const { searchHistory, recentPlayers, addToSearchHistory, clearSearchHistory } = usePlayerStore();
  
  // 검색 제안을 위한 실시간 검색 - 별도의 hook 인스턴스 사용
  const { 
    searchResults: suggestions, 
    isSearching: isSuggestionLoading,
    searchPlayer: searchForSuggestions 
  } = usePlayerSearch();

  // 디바운스된 검색어로 제안 검색 실행
  useEffect(() => {
    if (showSuggestions && debouncedNickname.length >= 2) {
      searchForSuggestions(debouncedNickname);
    }
  }, [debouncedNickname, showSuggestions, searchForSuggestions]);

  // 드롭다운 항목들 조합
  const dropdownItems: DropdownItem[] = React.useMemo(() => {
    const items: DropdownItem[] = [];

    // 검색 기록
    if (showHistory && nickname.length === 0) {
      searchHistory.slice(0, 5).forEach((item: string) => {
        items.push({
          type: 'history',
          value: item,
          label: item,
          icon: <History className="w-4 h-4 text-gray-400" />
        });
      });
    }

    // 최근 본 플레이어
    if (showHistory && nickname.length === 0) {
      recentPlayers.slice(0, 3).forEach((player: PlayerSearchResult) => {
        if (!searchHistory.includes(player.nickname)) {
          items.push({
            type: 'recent',
            value: player.nickname,
            label: player.nickname,
            icon: <TrendingUp className="w-4 h-4 text-cyan-400" />
          });
        }
      });
    }

    // 검색 제안
    if (showSuggestions && suggestions && nickname.length >= 2) {
      suggestions.slice(0, 5).forEach((player: PlayerSearchResult) => {
        if (!items.some(item => item.value === player.nickname)) {
          items.push({
            type: 'suggestion',
            value: player.nickname,
            label: player.nickname,
            icon: <Search className="w-4 h-4 text-purple-400" />
          });
        }
      });
    }

    return items;
  }, [nickname, searchHistory, recentPlayers, suggestions, showHistory, showSuggestions]);

  const handleSubmit = (searchNickname?: string) => {
    const searchValue = searchNickname || nickname.trim();
    if (searchValue) {
      addToSearchHistory(searchValue);
      onSearch(searchValue);
      setShowDropdown(false);
      setNickname(searchValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < dropdownItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleSubmit(dropdownItems[focusedIndex].value);
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setShowDropdown(true);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // 드롭다운 클릭을 위한 지연
    setTimeout(() => {
      setShowDropdown(false);
      setFocusedIndex(-1);
    }, 200);
  };

  const handleItemClick = (value: string) => {
    handleSubmit(value);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory();
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative group">
        {/* 🌟 글로우 효과 */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
        
        <div className="relative glass-effect rounded-2xl p-1 border border-gray-700/50">
          <div className="flex gap-3 p-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={nickname}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={placeholder}
                className="gaming-input w-full pl-12 pr-4 py-4 text-lg rounded-xl"
                disabled={isSuggestionLoading}
                autoComplete="off"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              
              {/* 드롭다운 */}
              {showDropdown && dropdownItems.length > 0 && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
                >
                  {/* 검색 기록 헤더 */}
                  {searchHistory.length > 0 && nickname.length === 0 && (
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50">
                      <span className="text-sm text-gray-400">최근 검색</span>
                      <button
                        onClick={handleClearHistory}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {dropdownItems.map((item, index) => (
                    <button
                      key={`${item.type}-${item.value}`}
                      onClick={() => handleItemClick(item.value)}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${
                        index === focusedIndex ? 'bg-gray-700/50' : ''
                      }`}
                    >
                      {item.icon}
                      <span className="text-gray-200">{item.label}</span>
                      {item.type === 'history' && (
                        <span className="ml-auto text-xs text-gray-500">기록</span>
                      )}
                      {item.type === 'recent' && (
                        <span className="ml-auto text-xs text-cyan-400">최근</span>
                      )}
                      {item.type === 'suggestion' && (
                        <span className="ml-auto text-xs text-purple-400">제안</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSuggestionLoading || !nickname.trim()}
              className="btn-gaming px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSuggestionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  검색
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 인기 검색어 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400 mb-3">인기 검색어</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {["Faker", "Hide on bush", "Dopa", "Canyon", "Showmaker"].map((name) => (
            <button
              key={name}
              onClick={() => handleSubmit(name)}
              className="px-4 py-2 text-sm rounded-full bg-gray-800/50 text-gray-300 border border-gray-600/30 hover:border-cyan-400/50 hover:text-cyan-400 transition-all duration-300 hover-scale"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 