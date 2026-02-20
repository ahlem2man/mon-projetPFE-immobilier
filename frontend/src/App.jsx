// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
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
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' }, 
    secondary: { main: '#f50057' },
  },
});

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

                {/*  Exemple de Route Protégée (Toute personne connectée) */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <div>Ma Page de Profil (En construction)</div>
                    </ProtectedRoute>
                  } 
                />

                {/*  Exemple de Route Spécialisée (Seulement les Agences) */}
                <Route 
                  path="/dashboard-agency" 
                  element={
                    <ProtectedRoute allowedRoles={['agency']}>
                      <div>Espace Agence : Ajouter des biens (En construction)</div>
                    </ProtectedRoute>
                  } 
                />
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