// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
      <Routes>
          <Route path="/" element={<SearchPage />} />
      </Routes>
      </Router>
    </div>
  );
}

export default App;
