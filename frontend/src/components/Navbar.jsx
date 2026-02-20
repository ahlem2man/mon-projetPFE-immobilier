import { AppBar, Toolbar, Button, Stack, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; 
import FavoriteIcon from '@mui/icons-material/Favorite'; 
import logoHoma from '../assets/logo-homa.avif'; 

const Navbar = () => {
  const { user, logout } = useContext(AuthContext); 

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
              <Button 
                component={Link} 
                to="/favorites" 
                startIcon={<FavoriteIcon />} 
                sx={{ 
                  color: '#e74c3c',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Mes Favoris
              </Button>

              <Typography variant="body2" sx={{ color: '#666' }}>
                {user.name}
              </Typography>
              <Button 
                onClick={logout}
                sx={{
                  color: '#333',
                  border: '1px solid #ddd',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  px: 2,
                  py: 0.8
                }}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                to="/register"
                sx={{
                  color: '#333',
                  border: '1px solid #ddd',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  px: 2,
                  py: 0.8
                }}
              >
                S'inscrire
              </Button>

              <Button 
                variant="contained" 
                component={Link} 
                to="/login"
                sx={{
                  backgroundColor: '#0099cc',
                  color: '#fff',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  px: 3,
                  py: 0.8,
                  '&:hover': {
                    backgroundColor: '#0077aa'
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