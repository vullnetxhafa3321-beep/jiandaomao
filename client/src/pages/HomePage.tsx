import { Layout } from '../components/UI';
import { RescueMapView } from '../components/RescueMapView';
import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { LocationRegionBadge } from '../components/HospitalAddressLink';
import { useNavActions } from '../components/BottomNav';

export default function HomePage() {
  const { openRescueModal } = useNavActions();

  return (
    <Layout className="pb-nav frog-home-map">
      <div className="frog-map-topbar">
        <LocationRegionBadge />
      </div>

      <RescueMapView height="calc(100vh - 4.25rem - env(safe-area-inset-bottom, 0px))" />

      <WelcomeOverlay onRescue={openRescueModal} />
    </Layout>
  );
}
