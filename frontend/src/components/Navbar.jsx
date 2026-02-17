import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <AppBar position="static" color="default" elevation={1}>
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}>
        ImmoAhlem
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button component={Link} to="/about">À propos</Button>
        <Button component={Link} to="/contact">Contact</Button>
        <Button component={Link} to="/faq">FAQ</Button>
        <Button variant="contained" color="primary">Connexion</Button>
      </Stack>
    </Toolbar>
  </AppBar>
);
export default Navbar;