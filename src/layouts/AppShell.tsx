import { Outlet } from 'react-router-dom';
import { Sidebar, Topbar, BottomNav } from '../components/shared';
import { ToastContainer } from '../components/ui/Toast';

export function AppShell() {
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden md:flex-row bg-warm-50 w-full">
      <Sidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6 bg-warm-50 custom-scrollbar">
          <Outlet />
        </main>
      </div>
      <BottomNav className="md:hidden" />
      <ToastContainer />
    </div>
  );
}
