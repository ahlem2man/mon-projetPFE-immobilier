import { AppBar, Toolbar, Button, Stack, Box, Typography, Menu, MenuItem, Divider, useMediaQuery, useTheme } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext'; 
import FavoriteIcon from '@mui/icons-material/Favorite'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import logoHoma from '../assets/logo-homa.avif'; 
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationPanel from './NotificationPanel';


const Navbar = () => {
  const { user, logout } = useContext(AuthContext); 
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: '#ffffff',
        borderBottom: '2px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 2, md: 4 } }}>
        {/* LOGO */}
        <Box 
          component={Link} 
          to="/" 
          sx={{ 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.02)' }
          }}
        >
          <img src={logoHoma} alt="HOMA Logo" style={{ height: '85px', width: 'auto', objectFit: 'contain' }} />
        </Box>
        
        {/* NAVIGATION PRINCIPALE */}
        {!isMobile && (
          <Stack direction="row" spacing={4} sx={{ alignItems: 'center', ml: 'auto' }}>
            <Button 
              component={Link} 
              to="/" 
              sx={{ 
                color: '#0a1930',
                fontSize: '15px', 
                fontWeight: '500',
                textTransform: 'none',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#0a1930',
                  transform: location.pathname === '/' ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.3s ease',
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                }
              }}
            >
              Accueil
            </Button>
            <Button 
              component={Link} 
              to="/about" 
              sx={{ 
                color: '#0a1930',
                fontSize: '15px', 
                fontWeight: '500',
                textTransform: 'none',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#0a1930',
                  transform: location.pathname === '/about' ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.3s ease',
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                }
              }}
            >
              Services
            </Button>
            <Button 
              component={Link} 
              to="/contact" 
              sx={{ 
                color: '#0a1930',
                fontSize: '15px', 
                fontWeight: '500',
                textTransform: 'none',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#0a1930',
                  transform: location.pathname === '/contact' ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.3s ease',
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                }
              }}
            >
              Contact
            </Button>
            <Button 
              component={Link} 
              to="/" 
              sx={{ 
                color: '#0a1930',
                fontSize: '15px', 
                fontWeight: '500',
                textTransform: 'none',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#0a1930',
                  transform: location.pathname === '/' ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.3s ease',
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                }
              }}
            >
              Nos Biens
            </Button>
            <Button 
              component={Link} 
              to="/faq" 
              sx={{ 
                color: '#0a1930',
                fontSize: '15px', 
                fontWeight: '500',
                textTransform: 'none',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#0a1930',
                  transform: location.pathname === '/faq' ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.3s ease',
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                }
              }}
            >
              FAQ
            </Button>
          </Stack>
        )}
        
        {/* SECTION UTILISATEUR */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {user ? (
            <>
              {/* Notification Panel */}
              <NotificationPanel />
              
              <Button
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  color: '#0a1930',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: '#f0f0f0',
                  borderRadius: 2,
                  px: 2,
                  py: 0.8,
                  textTransform: 'none',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    backgroundColor: '#e0e0e0',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                {isMobile ? '👤' : user.name}
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                elevation={3}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: { 
                    mt: 1, 
                    minWidth: 220, 
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0a1930' }}>
                    Mon Compte
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                
                <MenuItem 
                  onClick={handleClose} 
                  component={Link} 
                  to="/dashboard/profile"
                  sx={{
                    py: 1.2,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 18, mr: 1.5, color: '#00BCD4' }} />
                  Mon Espace Locataire
                </MenuItem>

                <MenuItem 
  onClick={handleClose} 
  component={Link} 
  to="/dashboard/applications"
  sx={{
    py: 1.2,
    '&:hover': {
      backgroundColor: '#f5f5f5',
    }
  }}
>
  <AssignmentIcon sx={{ fontSize: 18, mr: 1.5, color: '#2fa9c4' }} />
  Mes Candidatures
</MenuItem>

                <MenuItem 
                  onClick={handleClose} 
                  component={Link} 
                  to="/dashboard/favorites"
                  sx={{
                    py: 1.2,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 18, mr: 1.5, color: '#ff5252' }} />
                  Mes Favoris
                </MenuItem>

                <Divider />

                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    color: '#d32f2f',
                    py: 1.2,
                    '&:hover': {
                      backgroundColor: '#ffebee',
                    }
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 18, mr: 1.5 }} />
                  Déconnexion
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                to="/register"
                sx={{ 
                  color: '#0a1930', 
                  border: '1px solid #00BCD4',
                  textTransform: 'none', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  px: 2.5, 
                  py: 0.8,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 188, 212, 0.05)',
                    borderColor: '#0097A7',
                  }
                }}
              >
                S'inscrire
              </Button>
              <Button 
                variant="contained" 
                component={Link} 
                to="/login"
                sx={{ 
                  background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
                  color: '#fff', 
                  textTransform: 'none', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  px: 3, 
                  py: 0.8,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #0097A7 0%, #006064 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0, 188, 212, 0.3)',
                  }
                }}
              >
                Connexion
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;