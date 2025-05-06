import { useEffect, useState } from 'react';
import { useParams }        from 'react-router-dom';
import { fetchPlayerStats } from '../services/erApi';
import { PlayerStatsResponse } from '../types/api';
import PlayerProfile       from '../components/PlayerProfile';
import CharacterStats      from '../components/CharacterStats';
import CharacterWinChart   from '../components/CharacterWinChart';
import MatchHistory        from '../components/MatchHistory';

export default function PlayerStatsPage() {
  const { nickname } = useParams<{ nickname: string }>();
  const [data, setData]     = useState<PlayerStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const ps = await fetchPlayerStats(nickname!);
        setData(ps);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [nickname]);

  if (loading) return <div>로딩 중…</div>;
  if (error)   return <div className="text-red-500">{error}</div>;

  return (
    <div className="…">
      <PlayerProfile      player={data!.profile} />
      <CharacterStats     stats={data!.characterStats} />
      <CharacterWinChart  stats={data!.characterStats} />
      <MatchHistory       matches={data!.matchHistory} />
    </div>
  );
}
