import { Link } from 'react-router-dom';
import { Layout } from '../components/UI';
import { RescueMapView } from '../components/RescueMapView';
import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { IconBadge } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useNavActions } from '../components/BottomNav';

export default function HomePage() {
  const { user } = useAuth();
  const { openRescueModal } = useNavActions();

  return (
    <Layout className="frog-home-map pb-nav">
      <header className="frog-home-header">
        <div className="flex items-center gap-2.5">
          <IconBadge name="paw" tone="sky" size={34} />
          <div>
            <h1 className="frog-title text-[1.2rem]">捡到猫了</h1>
            <p className="frog-subtitle text-[10px]">淡蓝地图 · 求助医院救助站</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/guide" className="frog-avatar-btn" aria-label="手册" title="救助手册">
            <IconBadge name="book" tone="cream" size={26} />
          </Link>
          <Link to="/me" className="frog-avatar-btn" aria-label="我的">
            {user?.avatar_url && user.avatar_url.length <= 2 ? (
              <span className="text-base">{user.avatar_url}</span>
            ) : (
              <IconBadge name="user" tone="ghost" size={28} />
            )}
          </Link>
        </div>
      </header>

      <div className="home-map-block">
        <RescueMapView mapOverlay={<WelcomeOverlay onRescue={openRescueModal} />} />
      </div>
    </Layout>
  );
}
