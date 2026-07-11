import { Link } from 'react-router-dom';
import { Layout } from '../components/UI';
import { RescueMapView } from '../components/RescueMapView';
import { RescueGuidePanel } from '../components/RescueGuidePanel';
import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { useAuth } from '../context/AuthContext';
import { useNavActions } from '../components/BottomNav';

export default function HomePage() {
  const { user } = useAuth();
  const { openRescueModal } = useNavActions();

  return (
    <Layout className="frog-home-split pb-nav">
      <header className="frog-home-header">
        <div>
          <h1 className="frog-title text-base">捡到猫了</h1>
          <p className="frog-subtitle text-[10px]">地图找求助 · 手册学救助</p>
        </div>
        <Link to="/me" className="frog-avatar-btn text-sm" aria-label="我的">
          {user?.avatar_url || '🐾'}
        </Link>
      </header>

      <div className="frog-split-map">
        <RescueMapView />
        <WelcomeOverlay onRescue={openRescueModal} />
      </div>

      <RescueGuidePanel />
    </Layout>
  );
}
