import { Layout } from '../components/UI';
import { RescueMapView } from '../components/RescueMapView';
import { CelebrationTicker } from '../components/CelebrationTicker';
import { Icon } from '../components/Icon';

export default function HomePage() {
  return (
    <Layout className="frog-home-map pb-nav">
      <header className="frog-home-header">
        <div className="flex items-center gap-2.5">
          <span className="bottom-nav-icon bottom-nav-icon-active" aria-hidden>
            <Icon name="paw" size={28} />
          </span>
          <div>
            <h1 className="frog-title text-[1.2rem]">捡到猫了</h1>
            <p className="frog-subtitle text-[10px]">捡猫 救助 领养 一站式帮助平台</p>
          </div>
        </div>
      </header>

      <CelebrationTicker />

      <div className="home-map-block">
        <RescueMapView />
      </div>
    </Layout>
  );
}
