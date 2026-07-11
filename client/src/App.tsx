import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './api/client';
import HomePage from './pages/HomePage';
import PublishPage from './pages/PublishPage';
import RescueDetailPage from './pages/RescueDetailPage';
import HospitalSelectPage from './pages/HospitalSelectPage';
import HospitalsPage from './pages/HospitalsPage';
import ArchivePage from './pages/ArchivePage';
import MePage from './pages/MePage';
import SafetyPage from './pages/SafetyPage';

function OgMetaLoader() {
  const { id } = useParams();
  useEffect(() => {
    if (!id) return;
    api.og(id).then((og) => {
      document.title = `${og.title} - 捡到猫`;
      const setMeta = (prop: string, content: string) => {
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('property', prop);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };
      setMeta('og:title', og.title);
      setMeta('og:description', og.description);
      if (og.image) setMeta('og:image', window.location.origin + og.image);
      setMeta('og:url', window.location.href);
    });
  }, [id]);
  return <RescueDetailPage />;
}

function ProtectedPublish() {
  const { user, loading } = useAuth();
  if (loading) return <div className="mobile-container p-10 text-center text-gray-400">加载中...</div>;
  if (!user) return <Navigate to="/me" replace />;
  return <PublishPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/publish" element={<ProtectedPublish />} />
          <Route path="/r/:id" element={<OgMetaLoader />} />
          <Route path="/r/:id/hospital" element={<HospitalSelectPage />} />
          <Route path="/r/:id/archive" element={<ArchivePage />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/me" element={<MePage />} />
          <Route path="/safety" element={<SafetyPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
