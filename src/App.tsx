import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import CodeGuidePage from './pages/CodeGuidePage';
import ConfigPage from './pages/ConfigPage';
import GuidePage from './pages/GuidePage';
import MachineSetupPage from './pages/MachineSetupPage';
import TextPage from './pages/TextPage';
import { MachineProvider, useMachineStore } from './providers/MachineProvider';
import { SessionProvider } from './providers/SessionProvider';

function AppContent() {
  const hasCompletedSetup = useMachineStore((s) => s.hasCompletedSetup);

  if (!hasCompletedSetup) {
    return <MachineSetupPage />;
  }

  return (
    <SessionProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<TextPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/codes" element={<CodeGuidePage />} />
            <Route path="/settings" element={<ConfigPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </SessionProvider>
  );
}

export default function App() {
  return (
    <MachineProvider>
      <AppContent />
    </MachineProvider>
  );
}
