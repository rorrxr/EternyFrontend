import { FC, useState } from 'react';
import { MatchEntry } from '../types/api';

interface Props {
  matches: MatchEntry[];
}

// 👇 더미 매치 데이터 (로컬 테스트용)
const dummyMatches: MatchEntry[] = [
  {
    id: 'match1',
    date: new Date().toISOString(),
    mode: '일반',
    teams: [
      {
        players: [
          {
            nickname: '젬뽀',
            characterIcon: 'https://cdn.dak.gg/er/characters/iva.webp',
            tk: 10,
            kill: 1,
            death: 2,
            assist: 8,
            damage: 25844,
            animal: 39803,
            credit: 1277,
            items: [
              { icon: 'https://cdn.dak.gg/er/items/laser_pointer.webp' },
              { icon: 'https://cdn.dak.gg/er/items/research_notebook.webp' },
              { icon: 'https://cdn.dak.gg/er/items/elemental_bow.webp' },
            ],
          },
        ],
      },
      {
        players: [
          {
            nickname: '아라우',
            characterIcon: 'https://cdn.dak.gg/er/characters/araun.webp',
            tk: 10,
            kill: 3,
            death: 2,
            assist: 5,
            damage: 22700,
            animal: 136402,
            credit: 1224,
            items: [
              { icon: 'https://cdn.dak.gg/er/items/attack_talisman.webp' },
              { icon: 'https://cdn.dak.gg/er/items/drone.webp' },
              { icon: 'https://cdn.dak.gg/er/items/nike_shoes.webp' },
            ],
          },
        ],
      },
    ],
  },
];

const MatchHistory: FC<Props> = ({ matches = dummyMatches }) => {
  const [openMatchIndex, setOpenMatchIndex] = useState<number | null>(null);

  const toggleMatch = (index: number) => {
    setOpenMatchIndex(openMatchIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {matches.map((match, i) => (
        <div key={match.id} className="rounded-md bg-[#2c2f34] shadow">
          <button
            className="w-full text-left p-4 flex justify-between items-center hover:bg-[#383b40] transition"
            onClick={() => toggleMatch(i)}
          >
            <div>
              <p className="text-sm text-gray-400">{new Date(match.date).toLocaleString()} / {match.mode}</p>
              <p className="text-md text-white font-semibold">Match ID: {match.id}</p>
            </div>
            <span className="text-white text-xl">{openMatchIndex === i ? '▲' : '▼'}</span>
          </button>

          {openMatchIndex === i && (
            <div className="overflow-x-auto px-4 pb-4">
              <table className="w-full text-sm text-gray-200 border-separate border-spacing-y-2 min-w-[720px]">
                <thead>
                  <tr className="text-xs text-gray-400">
                    <th className="text-left px-2">팀</th>
                    <th className="text-left">플레이어</th>
                    <th className="text-center">TK / K / D / A</th>
                    <th className="text-center">딜량</th>
                    <th className="text-center">동물</th>
                    <th className="text-center">크레딧</th>
                    <th className="text-center">아이템</th>
                  </tr>
                </thead>
                <tbody>
                  {match.teams.map((team, tIdx) => (
                    <>
                      {team.players.map((p, j) => (
                        <tr key={`${tIdx}-${j}`} className="bg-[#1f2125]">
                          <td className="px-2 py-1 text-center">#{tIdx + 1}</td>
                          <td className="flex items-center gap-2">
                            <img src={p.characterIcon} className="w-6 h-6 rounded" />
                            <span>{p.nickname}</span>
                          </td>
                          <td className="text-center">{p.tk}/{p.kill}/{p.death}/{p.assist}</td>
                          <td className="text-center">{p.damage.toLocaleString()}</td>
                          <td className="text-center">{p.animal.toLocaleString()}</td>
                          <td className="text-center">{p.credit.toLocaleString()}</td>
                          <td className="flex justify-center gap-1 py-1">
                            {p.items.map((item, k) => (
                              <img key={k} src={item.icon} className="w-6 h-6 rounded" />
                            ))}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MatchHistory;
