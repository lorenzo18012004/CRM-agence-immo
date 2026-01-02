import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyNew from './pages/PropertyNew';
import PropertyDetail from './pages/PropertyDetail';
import Contracts from './pages/Contracts';
import ContractDetail from './pages/ContractDetail';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Documents from './pages/Documents';
import Appointments from './pages/Appointments';
import CMS from './pages/CMS';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Mandates from './pages/Mandates';
import Tasks from './pages/Tasks';
import Offers from './pages/Offers';
import Payments from './pages/Payments';
import Communications from './pages/Communications';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="properties" element={<Properties />} />
              <Route path="properties/new" element={<PropertyNew />} />
              <Route path="properties/:id" element={<PropertyDetail />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="contracts/:id" element={<ContractDetail />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="mandates" element={<Mandates />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="offers" element={<Offers />} />
              <Route path="payments" element={<Payments />} />
              <Route path="documents" element={<Documents />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="communications" element={<Communications />} />
              <Route path="cms" element={<CMS />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

