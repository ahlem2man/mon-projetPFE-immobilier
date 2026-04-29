import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  ListItem, ListItemButton, ListItemIcon, ListItemText, Chip 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import GavelIcon from '@mui/icons-material/Gavel';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ErrorIcon from '@mui/icons-material/Error';

const drawerWidth = 260;

const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : 'admin');

  const menuItems = [
    { text: 'Tableau de Bord', icon: <DashboardIcon />, path: '/dashboard-admin' },
    { text: 'Gestion Utilisateurs', icon: <PeopleIcon />, path: '/dashboard-admin/users' },
    { text: 'Vérification Comptes', icon: <GavelIcon />, path: '/dashboard-admin/verification' },
    { text: 'Modération Annonces', icon: <HomeWorkIcon />, path: '/dashboard-admin/properties' },
    { text: 'Signalements', icon: <ErrorIcon />, path: '/dashboard-admin/reports' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/dashboard-admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7fe', minHeight: '100vh' }}>
      {/* BARRE LATÉRALE */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            borderRight: 'none', 
            boxShadow: '4px 0 10px rgba(0,0,0,0.02)',
            bgcolor: '#ffffff'
          },
        }}
      >
        {/* En-tête Sidebar */}
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1A237E' }}>
            HOMA Admin
          </Typography>
          <Chip 
            label={userRole === 'superadmin' ? "Super Admin" : "Admin"} 
            color="primary"
            size="small"
            sx={{ mt: 1, fontWeight: 'bold' }}
          />
        </Box>
        
        <Divider sx={{ mx: 2 }} />

        {/* Menu Items */}
        <List sx={{ px: 2, mt: 2 }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path || 
                              location.pathname.startsWith(item.path + '/');
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  selected={isSelected}
                  sx={{ 
                    borderRadius: 2,
                    '&.Mui-selected': { 
                      bgcolor: '#E8EAF6', 
                      color: '#3F51B5' 
                    },
                    '&.Mui-selected .MuiListItemIcon-root': { 
                      color: '#3F51B5' 
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 'medium' 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Logout en bas */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <ListItemButton 
            onClick={handleLogout} 
            sx={{ borderRadius: 2, color: 'error.main' }}
          >
            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* CONTENU PRINCIPAL */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar 
          position="static" 
          elevation={0} 
          sx={{ 
            bgcolor: 'transparent', 
            color: 'text.primary', 
            mb: 3 
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A237E' }}>
              Console d'Administration
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Outlet pour les pages enfants */}
        <Box sx={{ bgcolor: '#ffffff', borderRadius: 2, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboardLayout;
