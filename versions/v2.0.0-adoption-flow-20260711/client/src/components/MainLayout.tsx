import { Outlet } from 'react-router-dom';
import { BottomNav, BottomNavProvider } from './BottomNav';

export function MainLayout() {
  return (
    <BottomNavProvider>
      <Outlet />
      <BottomNav />
    </BottomNavProvider>
  );
}
