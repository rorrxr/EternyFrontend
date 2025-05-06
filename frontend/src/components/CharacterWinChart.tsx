import { FC } from 'react';
import { CharacterStat } from '../types/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  stats: CharacterStat[];
}

const CharacterWinChart: FC<Props> = ({ stats }) => {
  const data = {
    labels: stats.map((s) => s.name),
    datasets: [
      {
        label: '승률 (%)',
        data: stats.map((s) => s.winRate),
        backgroundColor: 'rgba(34,197,94,0.6)',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#fff' },
      },
      title: {
        display: true,
        text: '캐릭터별 승률 통계',
        color: '#fff',
      },
    },
    scales: {
      x: { ticks: { color: '#fff' } },
      y: { ticks: { color: '#fff' }, beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
};

export default CharacterWinChart;
