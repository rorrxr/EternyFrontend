import { FC } from 'react';
import { CharacterStat } from '../types/api';

interface Props {
  stats: CharacterStat[];
}

const CharacterStats: FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((char, i) => (
        <div
          key={i}
          className="bg-[#2c2f34] p-4 rounded-lg shadow-md border border-gray-700 hover:scale-[1.02] transition-transform duration-150"
        >
          <h4 className="text-lg font-semibold text-white mb-1">{char.name}</h4>
          <p className="text-sm text-gray-400">
            승률: <span className="text-white font-medium">{char.winRate}%</span><br />
            KDA: <span className="text-white font-medium">{char.kda}</span><br />
            경기 수: <span className="text-white font-medium">{char.matches}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default CharacterStats;