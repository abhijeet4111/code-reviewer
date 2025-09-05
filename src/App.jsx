import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Scans from './pages/Scans';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import { NotificationProvider } from './components/notifications/NotificationProvider';
import { store } from './store/store';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <NotificationProvider>
          <MainLayout>
                      <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scans" element={<Scans />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<Profile />} />
            </Routes>
          </MainLayout>
        </NotificationProvider>
      </Router>
    </Provider>
  );
}

export default App;