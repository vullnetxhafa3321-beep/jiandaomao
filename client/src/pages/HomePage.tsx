import { Link } from 'react-router-dom';
import { Layout } from '../components/UI';
import { RescueMapView } from '../components/RescueMapView';
import { RescueGuidePanel } from '../components/RescueGuidePanel';
import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { IconBadge } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useNavActions } from '../components/BottomNav';

export default function HomePage() {
  const { user } = useAuth();
  const { openRescueModal } = useNavActions();

  return (
    <Layout className="frog-home-split pb-nav">
      <header className="frog-home-header">
        <div className="flex items-center gap-2.5">
          <IconBadge name="paw" tone="coral" size={34} />
          <div>
            <h1 className="frog-title text-[1.2rem]">捡到猫了</h1>
            <p className="frog-subtitle text-[10px]">海边小镇 · 地图找猫 · 手册送医</p>
          </div>
        </div>
        <Link to="/me" className="frog-avatar-btn" aria-label="我的">
          {user?.avatar_url && user.avatar_url.length <= 2 ? (
            <span className="text-base">{user.avatar_url}</span>
          ) : (
            <IconBadge name="user" tone="ghost" size={28} />
          )}
        </Link>
      </header>

      {/* Rooftop terrace — real map + backend markers */}
      <div className="frog-split-map">
        <RescueMapView />
        <WelcomeOverlay onRescue={openRescueModal} />
      </div>

      {/* Ground-floor shop — guide from backend */}
      <RescueGuidePanel />
    </Layout>
  );
}
