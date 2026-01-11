import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MarketDetail from './pages/MarketDetail';
import Leaderboard from './pages/Leaderboard';
import CreateQuestion from './pages/CreateQuestion';
import Quests from './pages/Quests';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Referrals from './pages/Referrals';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/market/:id" element={<MarketDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/create" element={<CreateQuestion />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/referrals" element={<Referrals />} />
      </Routes>
    </BrowserRouter>
  );
}