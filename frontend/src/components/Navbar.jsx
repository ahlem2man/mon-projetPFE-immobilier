import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; 

const Navbar = () => {
  const { user, logout } = useContext(AuthContext); 

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}>
          ImmoAhlem
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button component={Link} to="/about">À propos</Button>
          <Button component={Link} to="/contact">Contact</Button>
          <Button component={Link} to="/faq">FAQ</Button>
          
          {user ? (
            <>
              <Typography variant="body1" sx={{ alignSelf: 'center', fontWeight: 'medium', mr: 1 }}>
                {user.name}
              </Typography>
              <Button variant="outlined" color="secondary" onClick={logout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              {/* Bouton Inscription (ajouté) */}
              <Button 
                variant="outlined" 
                color="primary" 
                component={Link} 
                to="/register"
              >
                S'inscrire
              </Button>

              {/* Bouton Connexion */}
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to="/login"
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