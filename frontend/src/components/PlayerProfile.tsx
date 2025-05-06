import { FC } from 'react';
import { PlayerProfileData } from '../types/api';

interface Props {
  player: PlayerProfileData;
}

const PlayerProfile: FC<Props> = ({ player }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#2c2f34] p-6 rounded-lg shadow-md border border-gray-700">
      <img
        src={player.avatarUrl}
        alt="avatar"
        className="w-20 h-20 rounded-full border-2 border-gray-500"
      />
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-white">{player.nickname}</h2>
        <p className="text-base text-gray-400 mt-1">
          {player.tier} · {player.wins}승 / {player.games}판
        </p>
      </div>
    </div>
  );
};

export default PlayerProfile;