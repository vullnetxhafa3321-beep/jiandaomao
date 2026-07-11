import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, getToken } from '../api/client';
import { ActionModal, LoginModal } from './UI';

interface NavContextValue {
  openRescueModal: () => void;
  meUnread: number;
}

const NavContext = createContext<NavContextValue>({ openRescueModal: () => {}, meUnread: 0 });

export function useNavActions() {
  return useContext(NavContext);
}

const SEEN_KEY = 'jiandaomao_comments_seen_at';

export function BottomNavProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [meUnread, setMeUnread] = useState(0);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const refreshUnread = useCallback(() => {
    if (!getToken() || !user) {
      setMeUnread(0);
      return;
    }
    let since = '';
    try {
      since = localStorage.getItem(SEEN_KEY) || '';
    } catch {
      /* ignore */
    }
    api.forumNotifications(since || undefined)
      .then((r) => setMeUnread(r.unread_count))
      .catch(() => setMeUnread(0));
  }, [user]);

  useEffect(() => {
    refreshUnread();
    const t = setInterval(refreshUnread, 30000);
    return () => clearInterval(t);
  }, [refreshUnread]);

  const openRescueModal = useCallback(() => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setModalOpen(true);
  }, [user]);

  return (
    <NavContext.Provider value={{ openRescueModal, meUnread }}>
      {children}
      <ActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPublish={() => {
          setModalOpen(false);
          navigate('/publish');
        }}
        onHospital={() => {
          setModalOpen(false);
          navigate('/hospitals');
        }}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} />
    </NavContext.Provider>
  );
}

function TabIcon({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span className={`bottom-nav-icon ${active ? 'bottom-nav-icon-active' : ''}`}>{children}</span>
  );
}

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { openRescueModal, meUnread } = useNavActions();

  const activeTab = (() => {
    if (pathname.startsWith('/adoption')) return '/adoption';
    if (pathname.startsWith('/forum')) return '/forum';
    if (pathname === '/') return '/map';
    if (pathname.startsWith('/me')) return '/me';
    return null;
  })();

  return (
    <nav className="bottom-nav" aria-label="主导航">
      <button
        type="button"
        className={`bottom-nav-item ${activeTab === '/adoption' ? 'bottom-nav-item-active' : ''}`}
        onClick={() => navigate('/adoption')}
      >
        <TabIcon active={activeTab === '/adoption'}>🏠</TabIcon>
        <span>待领养</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === '/forum' ? 'bottom-nav-item-active' : ''}`}
        onClick={() => navigate('/forum')}
      >
        <TabIcon active={activeTab === '/forum'}>📸</TabIcon>
        <span>流浪发现</span>
      </button>

      <div className="bottom-nav-center">
        <button type="button" className="bottom-nav-fab" onClick={openRescueModal} aria-label="我捡到猫了">
          <span className="bottom-nav-fab-icon">🐱</span>
          <span className="bottom-nav-fab-label">我捡到猫了</span>
        </button>
      </div>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === '/map' ? 'bottom-nav-item-active' : ''}`}
        onClick={() => navigate('/')}
      >
        <TabIcon active={activeTab === '/map'}>🗺️</TabIcon>
        <span>地图</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item relative ${activeTab === '/me' ? 'bottom-nav-item-active' : ''}`}
        onClick={() => navigate('/me')}
      >
        <TabIcon active={activeTab === '/me'}>👤</TabIcon>
        <span>我的</span>
        {meUnread > 0 && (
          <span className="bottom-nav-badge">{meUnread > 9 ? '9+' : meUnread}</span>
        )}
      </button>
    </nav>
  );
}
