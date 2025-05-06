import { searchUser, getUserStats } from './api';
import {
  PlayerStatsResponse,
  PlayerProfileData,
  CharacterStat,
  MatchEntry
} from '../types/api';

export async function fetchPlayerStats(nickname: string): Promise<PlayerStatsResponse> {
  // 1) BSER 닉네임 검색
  const users = await searchUser(nickname);
  if (users.length === 0) throw new Error('유저를 찾을 수 없습니다.');
  const { userNum } = users[0];

  // 2) 상세 전적 조회
  const { summary, matches } = await getUserStats(userNum);

  // 3) profile 객체
  const profile: PlayerProfileData = {
    nickname: summary.nickname,
    tier: summary.rank != null ? String(summary.rank) : 'Unranked',
    wins: summary.wins,
    games: summary.totalGames,
    avatarUrl: '',  
    kda:
      summary.totalGames > 0
        ? (summary.averageKills + summary.averageAssistants) / summary.totalGames
        : 0,
    totalDamage: matches.reduce((sum, m) => sum + m.monsterKill, 0),
  };

  // 4) 캐릭터별 통계 집계
  const charMap = new Map<number, { name: string; wins: number; matches: number; kdaSum: number }>();
  matches.forEach(m => {
    const entry = charMap.get(m.characterNum) ?? {
      name: String(m.characterNum),
      wins: 0,
      matches: 0,
      kdaSum: 0
    };
    entry.matches++;
    if (m.gameRank === 1) entry.wins++;
    entry.kdaSum += m.playerKill + m.playerAssistant;
    charMap.set(m.characterNum, entry);
  });
  const characterStats: CharacterStat[] = Array.from(charMap.values()).map(e => ({
    name: e.name,
    winRate: e.matches > 0 ? (e.wins / e.matches) * 100 : 0,
    kda: e.matches > 0 ? e.kdaSum / e.matches : 0,
    matches: e.matches,
  }));

  // 5) MatchEntry 형태로 변환
  const matchHistory: MatchEntry[] = matches.map(m => ({
    id: String(m.gameId),
    date: m.startDtm,
    mode: '',
    teams: [
      {
        players: [
          {
            nickname: summary.nickname,
            characterIcon: '',
            tk: 0,
            kill: m.playerKill,
            death: m.gameRank,
            assist: m.playerAssistant,
            damage: m.monsterKill,
            animal: 0,
            credit: 0,
            items: []
          }
        ]
      }
    ]
  }));

  return { profile, characterStats, matchHistory };
}
