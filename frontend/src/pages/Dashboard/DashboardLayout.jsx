import { Box, List, ListItem, ListItemIcon, ListItemText, Drawer, AppBar, Toolbar, Typography } from '@mui/material';
import { Person, Settings, Description, Favorite, Search } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom';

const drawerWidth = 240;

export default function DashboardLayout() {
  const menuItems = [
    { text: 'Profil', icon: <Person />, path: '/dashboard/profile' },
    { text: 'Préférences', icon: <Settings />, path: '/dashboard/preferences' },
    { text: 'Mes Documents', icon: <Description />, path: '/dashboard/documents' },
    { text: 'Recherches', icon: <Search />, path: '/dashboard/searches' },
    { text: 'Favoris', icon: <Favorite />, path: '/dashboard/favorites' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. Sous-barre noire (HOMA - Espace Locataire) 
          On enlève "fixed" pour qu'elle s'affiche SOUS ta Navbar blanche principale */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ bgcolor: '#0a1930', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            HOMA - Espace Locataire
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* 2. Le Drawer (Menu latéral) 
            On ajuste sa position pour qu'il ne couvre pas le haut de la page */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              position: 'relative', // Changé de fixed à relative pour rester dans le flux
              height: 'calc(100vh - 144px)', // Hauteur totale moins (Navbar + Sous-barre)
              borderRight: '1px solid #e0e0e0',
              bgcolor: '#fff'
            },
          }}
        >
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <List>
              {menuItems.map((item) => (
                <ListItem 
                  key={item.text} 
                  component={Link} 
                  to={item.path}
                  sx={{
                    '&:hover': { bgcolor: '#f0f7ff' },
                    mb: 0.5,
                    cursor: 'pointer'
                  }}
                >
                  <ListItemIcon sx={{ color: '#0a1930' }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontSize: '14px', fontWeight: '500' }} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* 3. Zone de contenu principal */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            bgcolor: '#f5f7fa', 
            minHeight: 'calc(100vh - 144px)' 
          }}
        >
          {/* Outlet affiche ProfilePage, PreferencesPage, etc. */}
          <Outlet /> 
        </Box>
      </Box>
    </Box>
  );
}