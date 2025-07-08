import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { PlayerSearchResult, PlayerDetail } from '../types/player';

interface PlayerState {
  searchHistory: string[];
  recentPlayers: PlayerSearchResult[];
  selectedPlayer: PlayerDetail | null;
  addToSearchHistory: (term: string) => void;
  addToRecentPlayers: (player: PlayerSearchResult) => void;
  setSelectedPlayer: (player: PlayerDetail | null) => void;
  clearSearchHistory: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  devtools(
    persist(
      (set, get) => ({
        searchHistory: [],
        recentPlayers: [],
        selectedPlayer: null,
        addToSearchHistory: (term: string) => {
          const current = get().searchHistory;
          const filtered = current.filter(item => item !== term);
          set({ searchHistory: [term, ...filtered].slice(0, 10) });
        },
        addToRecentPlayers: (player: PlayerSearchResult) => {
          const current = get().recentPlayers;
          const filtered = current.filter(p => p.userNum !== player.userNum);
          set({ recentPlayers: [player, ...filtered].slice(0, 5) });
        },
        setSelectedPlayer: (player: PlayerDetail | null) => {
          set({ selectedPlayer: player });
        },
        clearSearchHistory: () => {
          set({ searchHistory: [], recentPlayers: [] });
        },
      }),
      { name: 'eterny-player-storage', partialize: (state) => ({ searchHistory: state.searchHistory, recentPlayers: state.recentPlayers }) }
    ),
    { name: 'PlayerStore' }
  )
); 