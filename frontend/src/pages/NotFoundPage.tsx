import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-xl text-slate-300 mb-8">페이지를 찾을 수 없습니다.</p>
      <button className="btn-primary px-6 py-3" onClick={() => navigate('/')}>홈으로 이동</button>
    </div>
  );
};
export default NotFoundPage; 