import { AppBar, Toolbar, Button, Stack, Box, Typography, Menu, MenuItem, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { useContext, useState } from 'react'; // Ajout de useState pour le menu
import { AuthContext } from '../context/AuthContext'; 
import FavoriteIcon from '@mui/icons-material/Favorite'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import logoHoma from '../assets/logo-homa.avif'; 

const Navbar = () => {
  const { user, logout } = useContext(AuthContext); 

  // --- ÉTAT POUR LE MENU DÉROULANT ---
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
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
        <Box component={Link} to="/" sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src={logoHoma} alt="HOMA Logo" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
        </Box>
        
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <Button component={Link} to="/about" sx={{ color: '#333', textTransform: 'none', fontSize: '14px', fontWeight: '500' }}>
            À propos
          </Button>
          <Button component={Link} to="/contact" sx={{ color: '#333', textTransform: 'none', fontSize: '14px', fontWeight: '500' }}>
            Contact
          </Button>
          <Button component={Link} to="/faq" sx={{ color: '#333', textTransform: 'none', fontSize: '14px', fontWeight: '500' }}>
            FAQ
          </Button>
          
          {user ? (
            <>
              {/* BOUTON UTILISATEUR (Déclencheur du menu) */}
              <Button
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  color: '#333',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '1px solid #eee',
                  borderRadius: '20px',
                  px: 2,
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                {user.name}
              </Button>

              {/* MENU DÉROULANT */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                elevation={3}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: { mt: 1, minWidth: 200, borderRadius: 2 }
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Mon Compte</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                
                <MenuItem onClick={handleClose} component={Link} to="/dashboard/profile">
                  <DashboardIcon sx={{ fontSize: 20, mr: 1.5, color: '#666' }} />
                  Mon Espace (Profil)
                </MenuItem>

                <MenuItem onClick={handleClose} component={Link} to="/favorites">
                  <FavoriteIcon sx={{ fontSize: 20, mr: 1.5, color: '#e74c3c' }} />
                  Mes Favoris
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                  <LogoutIcon sx={{ fontSize: 20, mr: 1.5 }} />
                  Déconnexion
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                to="/register"
                sx={{ color: '#333', border: '1px solid #ddd', textTransform: 'none', fontSize: '14px', fontWeight: '500', px: 2, py: 0.8 }}
              >
                S'inscrire
              </Button>
              <Button 
                variant="contained" 
                component={Link} 
                to="/login"
                sx={{ backgroundColor: '#0099cc', color: '#fff', textTransform: 'none', fontSize: '14px', fontWeight: '500', px: 3, py: 0.8, '&:hover': { backgroundColor: '#0077aa' } }}
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