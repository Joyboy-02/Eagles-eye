import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from './components/NavBar.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { DetectorPage } from './pages/DetectorPage.jsx';

export function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detector" element={<DetectorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
