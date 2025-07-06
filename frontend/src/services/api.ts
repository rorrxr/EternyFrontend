import type { 
  NicknameDto, 
  Player, 
  BserGameDto, 
  BserUserDetailDto, 
  BserCharacterStatsDto,
  BserRankDto,
  CommonResponse 
} from '../types/game';

// 🌐 API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiService {
  // 🔍 닉네임으로 플레이어 검색
  async searchPlayerByNickname(nickname: string): Promise<CommonResponse<NicknameDto[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/players/search?nickname=${encodeURIComponent(nickname)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching player:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.');
        } else if (error.message.includes('HTTP error! status: 500')) {
          throw new Error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.message.includes('HTTP error! status: 404')) {
          throw new Error('플레이어를 찾을 수 없습니다.');
        }
      }
      
      throw new Error('플레이어 검색 중 오류가 발생했습니다.');
    }
  }

  // 👤 플레이어 상세 정보 조회
  async getPlayerDetail(userNum: number): Promise<CommonResponse<Player>> {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${userNum}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting player detail:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('서버에 연결할 수 없습니다.');
        } else if (error.message.includes('HTTP error! status: 404')) {
          throw new Error('플레이어 정보를 찾을 수 없습니다.');
        }
      }
      
      throw new Error('플레이어 정보 조회 중 오류가 발생했습니다.');
    }
  }

  // 🎮 플레이어 게임 기록 조회
  async getPlayerMatches(userNum: number): Promise<CommonResponse<BserGameDto[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${userNum}/matches`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting player matches:', error);
      
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      
      throw new Error('게임 기록 조회 중 오류가 발생했습니다.');
    }
  }

  // 🏆 플레이어 랭크 정보 조회
  async getPlayerRank(userNum: number, seasonId: number = 22, mode: number = 1): Promise<CommonResponse<BserRankDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/bser/rank/${userNum}/${seasonId}/${mode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting player rank:', error);
      
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      
      throw new Error('랭크 정보 조회 중 오류가 발생했습니다.');
    }
  }

  // 📊 랭킹 조회
  async getRanking(page: number = 0, size: number = 50, tier?: string): Promise<CommonResponse<Player[]>> {
    try {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        size: size.toString() 
      });
      if (tier) params.append('tier', tier);
      
      const response = await fetch(`${API_BASE_URL}/ranking?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting ranking:', error);
      
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      
      throw new Error('랭킹 조회 중 오류가 발생했습니다.');
    }
  }

  // 🔄 하위호환 - BSER API 닉네임 검색
  async getUserByNickname(query: string): Promise<CommonResponse<NicknameDto[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/bser/user/nickname?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting user by nickname:', error);
      throw new Error('BSER API 닉네임 검색 중 오류가 발생했습니다.');
    }
  }

  // 🔄 하위호환 - BSER API 게임 기록 조회
  async getGamesByUser(userNum: number): Promise<CommonResponse<BserGameDto[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/bser/games/${userNum}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting games by user:', error);
      throw new Error('BSER API 게임 기록 조회 중 오류가 발생했습니다.');
    }
  }

  // 🎯 통합 플레이어 정보 조회 (편의 메서드)
  async getCompletePlayerInfo(userNum: number, seasonId: number = 22) {
    const playerResponse = await this.getPlayerDetail(userNum);
    const matchesResponse = await this.getPlayerMatches(userNum);
    
    let statsResponse = null;
    try {
      statsResponse = await this.getPlayerRank(userNum, seasonId);
    } catch (error) {
      console.warn('Rank info not available:', error);
    }

    // 캐릭터 통계 계산
    const characterStats: BserCharacterStatsDto[] = [];
    if (matchesResponse.data && matchesResponse.data.length > 0) {
      const characterStatsMap: { [key: number]: any } = {};
      
      matchesResponse.data.forEach(match => {
        const charCode = match.characterNum;
        const charName = match.characterName;
        
        if (!characterStatsMap[charCode]) {
          characterStatsMap[charCode] = {
            characterCode: charCode,
            characterName: charName,
            totalGames: 0,
            totalWins: 0,
            totalKills: 0,
            totalRanks: 0
          };
        }
        
        const char = characterStatsMap[charCode];
        char.totalGames++;
        if (match.gameRank <= 4) char.totalWins++; // Top 4 as win
        char.totalKills += match.playerKill || 0;
        char.totalRanks += match.gameRank || 0;
      });
      
      characterStats.push(
        ...Object.values(characterStatsMap).map((char: any) => ({
          ...char,
          winRate: (char.totalWins / char.totalGames) * 100,
          averageRank: char.totalRanks / char.totalGames,
          averageKills: char.totalKills / char.totalGames
        })).sort((a: any, b: any) => b.totalGames - a.totalGames)
      );
    }

    return {
      player: playerResponse.data,
      stats: statsResponse?.data,
      matches: matchesResponse.data || [],
      characterStats
    };
  }
}

// 🚀 싱글톤 인스턴스 내보내기
export const apiService = new ApiService();