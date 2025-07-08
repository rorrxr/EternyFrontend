import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <h1 className="text-5xl font-bold text-white mb-6">Eterny 전적검색</h1>
      <p className="text-xl text-slate-300 mb-8">이터널리턴 플레이어의 전적, 랭킹, 통계를 쉽고 빠르게!</p>
      <button
        className="btn-primary text-lg px-8 py-4"
        onClick={() => navigate('/search')}
      >
        플레이어 검색하러 가기
      </button>
    </div>
  );
};

export default HomePage; 