import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';

interface EnhancedSearchBarProps {
  onSearch: (nickname: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearch,
  isLoading = false,
  placeholder = "플레이어 닉네임을 입력하세요",
}) => {
  const [nickname, setNickname] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (nickname.trim()) {
      onSearch(nickname.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative group">
        {/* 🌟 글로우 효과 */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
        
        <div className="relative glass-effect rounded-2xl p-1 border border-gray-700/50">
          <div className="flex gap-3 p-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="gaming-input w-full pl-12 pr-4 py-4 text-lg rounded-xl"
                disabled={isLoading}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !nickname.trim()}
              className="btn-gaming px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
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
          {["Faker", "Hide on bush", "Dopa", "Canyon"].map((name) => (
            <button
              key={name}
              onClick={() => setNickname(name)}
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