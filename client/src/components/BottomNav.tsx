import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActionModal, LoginModal } from './UI';

interface NavContextValue {
  openRescueModal: () => void;
}

const NavContext = createContext<NavContextValue>({ openRescueModal: () => {} });

export function useNavActions() {
  return useContext(NavContext);
}

export function BottomNavProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const openRescueModal = useCallback(() => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setModalOpen(true);
  }, [user]);

  return (
    <NavContext.Provider value={{ openRescueModal }}>
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
  const { openRescueModal } = useNavActions();

  const activeTab = (() => {
    if (pathname.startsWith('/adoption')) return '/adoption';
    if (pathname.startsWith('/forum')) return '/forum';
    if (pathname.startsWith('/messages')) return '/messages';
    if (pathname.startsWith('/me')) return '/me';
    if (pathname === '/') return '/';
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
          <span className="bottom-nav-fab-icon">🚨</span>
          <span className="bottom-nav-fab-label">我捡到猫了</span>
        </button>
      </div>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === '/messages' ? 'bottom-nav-item-active' : ''}`}
        onClick={() => navigate('/messages')}
      >
        <TabIcon active={activeTab === '/messages'}>💬</TabIcon>
        <span>消息</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === '/me' ? 'bottom-nav-item-active' : ''}`}
        onClick={() => navigate('/me')}
      >
        <TabIcon active={activeTab === '/me'}>👤</TabIcon>
        <span>我的</span>
      </button>
    </nav>
  );
}
