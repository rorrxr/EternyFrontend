import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { searchPlayer } from '@/services/api';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Trophy, 
  Zap,
  Star,
  Crown,
  Target,
  Gamepad2,
  BarChart3,
  Clock,
  Flame,
  Award,
  ChevronRight,
  PlayCircle,
  Calendar
} from 'lucide-react';

// Mock 데이터
const TRENDING_PLAYERS = [
  { rank: 1, name: "프로게이머123", mmr: 7850, change: "+125", tier: "이터널", character: "재키", winRate: 78.5, games: 234 },
  { rank: 2, name: "DAK마스터", mmr: 7720, change: "+89", tier: "이터널", character: "아야", winRate: 76.2, games: 189 },
  { rank: 3, name: "솔랭킹", mmr: 7650, change: "+67", tier: "이터널", character: "피오라", winRate: 74.8, games: 201 },
  { rank: 4, name: "이터널리턴", mmr: 7580, change: "+45", tier: "이터널", character: "매그너스", winRate: 73.1, games: 167 },
  { rank: 5, name: "TOP1만", mmr: 7520, change: "+38", tier: "이터널", character: "자히르", winRate: 71.9, games: 156 }
];

const POPULAR_CHARACTERS = [
  { name: "재키", icon: "🥊", pickRate: 18.5, winRate: 52.3, tier: "S", trend: "+2.1%" },
  { name: "아야", icon: "🗡️", pickRate: 16.8, winRate: 51.7, tier: "S", trend: "+1.8%" },
  { name: "피오라", icon: "⚔️", pickRate: 15.2, winRate: 53.1, tier: "S", trend: "+0.9%" },
  { name: "매그너스", icon: "🔨", pickRate: 12.9, winRate: 49.8, tier: "A", trend: "-0.5%" },
  { name: "자히르", icon: "🏹", pickRate: 11.3, winRate: 48.2, tier: "A", trend: "-1.2%" },
  { name: "나딘", icon: "🔫", pickRate: 9.7, winRate: 50.9, tier: "A", trend: "+0.3%" }
];

const RECENT_UPDATES = [
  {
    date: "2025.07.05",
    title: "시즌 15 패치노트",
    description: "신규 실험체 '레녹스' 추가 및 밸런스 조정",
    type: "update",
    isHot: true
  },
  {
    date: "2025.07.03", 
    title: "랭킹 시스템 개편",
    description: "새로운 티어 시스템과 MMR 계산 방식 도입",
    type: "system",
    isHot: false
  },
  {
    date: "2025.07.01",
    title: "하계 이벤트 시작",
    description: "여름 스킨과 한정 아이템 획득 기회",
    type: "event",
    isHot: false
  }
];

const GAME_STATS = {
  totalPlayers: "2,847,329",
  activeNow: "89,432",
  todayGames: "1,247,859",
  avgWaitTime: "32초"
};

const SearchSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState(['프로게이머123', 'DAK마스터', '솔랭킹']);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        console.log('🔍 검색 시작:', searchQuery);
        console.log('📡 API 호출:', `http://localhost:8080/api/v1/players/search?nickname=${encodeURIComponent(searchQuery)}`);
        
        const results = await searchPlayer(searchQuery);
        console.log('✅ 검색 결과:', results);
        console.log('📊 결과 타입:', typeof results);
        console.log('📊 결과 길이:', Array.isArray(results) ? results.length : '배열 아님');
        
        setSearchResults(Array.isArray(results) ? results : []);
        setShowResults(true);
        
        if (Array.isArray(results) && results.length > 0) {
          console.log('🎯 첫 번째 결과:', results[0]);
        } else {
          console.log('❌ 검색 결과 없음');
        }
      } catch (error) {
        console.error('❌ 검색 에러:', error);
        alert('검색 중 오류가 발생했습니다.');
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handlePlayerClick = (player: any) => {
    console.log('플레이어 클릭:', player);
    navigate(`/player/${player.userNum}`, { 
      state: { nickname: player.nickname } 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="플레이어 이름을 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isSearching}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {isSearching ? '검색 중...' : '검색'}
        </Button>
      </div>

      {recentSearches.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-slate-500 mb-2">최근 검색</div>
          <div className="flex gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs border-slate-200 hover:bg-slate-50"
                onClick={() => setSearchQuery(search)}
              >
                {search}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      {showResults && (
        <div className="mt-4">
          <div className="text-sm font-medium text-slate-700 mb-2">
            검색 결과 ({searchResults.length}명)
          </div>
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((player, index) => (
                <div
                  key={index}
                  className="p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => handlePlayerClick(player)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{player.nickname}</div>
                      <div className="text-xs text-slate-500">User ID: {player.userNum}</div>
                    </div>
                    <div className="text-xs text-slate-400">
                      클릭하여 상세보기
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TrendingPlayers = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          실시간 랭킹
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {TRENDING_PLAYERS.slice(0, 5).map((player) => (
          <div key={player.rank} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                player.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                player.rank === 2 ? 'bg-slate-100 text-slate-700' :
                player.rank === 3 ? 'bg-orange-100 text-orange-700' :
                'bg-slate-50 text-slate-600'
              }`}>
                {player.rank}
              </div>
              
              <div>
                <div className="font-medium text-slate-900">{player.name}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{player.character}</span>
                  <span>•</span>
                  <span>{player.winRate}% 승률</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-slate-900">{player.mmr.toLocaleString()}</div>
              <div className={`text-xs font-medium ${
                player.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {player.change}
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="ghost" className="w-full text-sm text-slate-600 hover:bg-slate-50">
          전체 랭킹 보기 <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

const PopularCharacters = () => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return 'bg-red-100 text-red-700 border-red-200';
      case 'A': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'B': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Flame className="h-5 w-5 text-red-500" />
          인기 실험체
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {POPULAR_CHARACTERS.map((character, index) => (
          <div key={character.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{character.icon}</div>
              <div>
                <div className="font-medium text-slate-900 flex items-center gap-2">
                  {character.name}
                  <Badge className={`text-xs px-1.5 py-0.5 ${getTierColor(character.tier)}`}>
                    {character.tier}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">
                  픽률 {character.pickRate}% • 승률 {character.winRate}%
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-xs font-medium ${
                character.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {character.trend}
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="ghost" className="w-full text-sm text-slate-600 hover:bg-slate-50">
          전체 통계 보기 <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

const GameStats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4 text-center">
          <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-900">{GAME_STATS.totalPlayers}</div>
          <div className="text-xs text-blue-700">총 플레이어</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4 text-center">
          <PlayCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-green-900">{GAME_STATS.activeNow}</div>
          <div className="text-xs text-green-700">현재 접속</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4 text-center">
          <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-purple-900">{GAME_STATS.todayGames}</div>
          <div className="text-xs text-purple-700">오늘 게임 수</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4 text-center">
          <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-orange-900">{GAME_STATS.avgWaitTime}</div>
          <div className="text-xs text-orange-700">평균 대기시간</div>
        </CardContent>
      </Card>
    </div>
  );
};

const RecentUpdates = () => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'update': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'system': return <Target className="h-4 w-4 text-purple-500" />;
      case 'event': return <Award className="h-4 w-4 text-green-500" />;
      default: return <Calendar className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Calendar className="h-5 w-5 text-slate-600" />
          최근 업데이트
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {RECENT_UPDATES.map((update, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="mt-0.5">{getTypeIcon(update.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-slate-900">{update.title}</h4>
                {update.isHot && (
                  <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                    HOT
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-2">{update.description}</p>
              <div className="text-xs text-slate-500">{update.date}</div>
            </div>
          </div>
        ))}
        
        <Button variant="ghost" className="w-full text-sm text-slate-600 hover:bg-slate-50">
          모든 공지사항 보기 <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

const QuickLinks = () => {
  const links = [
    { icon: Trophy, label: '랭킹', description: '실시간 순위 확인', color: 'text-yellow-600', path: '/ranking' },
    { icon: BarChart3, label: '통계', description: '실험체별 승률', color: 'text-blue-600', path: '#' },
    { icon: Target, label: '매치', description: '경기 기록 분석', color: 'text-purple-600', path: '#' },
    { icon: Gamepad2, label: '가이드', description: '공략 및 팁', color: 'text-green-600', path: '#' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {links.map((link, index) => (
        <Link key={index} to={link.path}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <link.icon className={`h-8 w-8 mx-auto mb-3 ${link.color}`} />
              <h3 className="font-semibold text-slate-900 mb-1">{link.label}</h3>
              <p className="text-xs text-slate-600">{link.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="container py-8">
      <header className="mb-8 text-center">
        <h1 className="text-gradient-pink text-4xl font-bold mb-4 animate-float">이터널리턴 전적검색</h1>
        <p className="text-slate-400 mb-6">플레이어의 전적과 통계를 확인해보세요</p>
        <SearchSection />
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="card-tile">
          <TrendingPlayers />
        </div>
        <div className="card-tile">
          <PopularCharacters />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="card-tile">
          <GameStats />
        </div>
        <div className="card-tile">
          <RecentUpdates />
        </div>
      </div>
      <div className="card-tile text-center">
        <QuickLinks />
      </div>
    </div>
  );
} 