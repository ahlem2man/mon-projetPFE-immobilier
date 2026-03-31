// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword'; 
import ResetPassword from './pages/ResetPassword';
import 'leaflet/dist/leaflet.css';

import Favorites from './pages/Favorites';
import PropertyDetail from './pages/PropertyDetail';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import ProfilePage from './pages/Dashboard/ProfilePage';
import PreferencesPage from './pages/Dashboard/PreferencesPage';
import DocumentsPage from './pages/Dashboard/DocumentsPage';
import SearchesPage from './pages/Dashboard/SearchesPage';
import FavoritesPage from './pages/Dashboard/FavoritesPage';
import MyApplications from './pages/MyApplications';
import DetailedApplication from './pages/DetailedApplication';
import RecommendationsPage from './pages/Dashboard/RecommendationsPage';
import AgencyDashboardLayout from './pages/DashbordAgency/AgencyDashboardLayout';
import AgencyOverview from './pages/DashbordAgency/AgencyOverview';
import AgencyProfilePage from './pages/DashbordAgency/AgencyProfilePage';
import AgencyVerificationSection from './pages/DashbordAgency/AgencyVerificationSection';
import AgencySettings from './pages/DashbordAgency/AgencySettings';
import AgencyReviews from './pages/DashbordAgency/AgencyReviews';
import AgencySubscriptions from './pages/DashbordAgency/AgencySubscriptions';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Routes Publiques : Accessibles par tout le monde */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/favorites" element={<Favorites />} />

                <Route path="/dashboard" element={<DashboardLayout />}>

                <Route index element={<RecommendationsPage />} /> 
  
                  <Route path="recommendations" element={<RecommendationsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="preferences" element={<PreferencesPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="searches" element={<SearchesPage />} />
                  <Route path="favorites" element={<FavoritesPage />} />
                  <Route path="applications" element={<MyApplications />} />
                  <Route path="applications/:requestId" element={<DetailedApplication />} />
                </Route>
                



                {/*  Exemple de Route Protégée (Toute personne connectée) */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <div>Ma Page de Profil (En construction)</div>
                    </ProtectedRoute>
                  } 
                />

                {/*  Tableau de bord Agence (Seulement les Agences) */}
                <Route 
                  path="/agency" 
                  element={
                    <ProtectedRoute allowedRoles={['agency']}>
                      <AgencyDashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AgencyOverview />} />
                  <Route path="dashboard" element={<AgencyOverview />} />
                  <Route path="profile" element={<AgencyProfilePage />} />
                  <Route path="subscriptions" element={<AgencySubscriptions />} />
                  <Route path="verification" element={<AgencyVerificationSection />} />
                  <Route path="settings" element={<AgencySettings />} />
                  <Route path="reviews" element={<AgencyReviews />} />
                </Route>
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;