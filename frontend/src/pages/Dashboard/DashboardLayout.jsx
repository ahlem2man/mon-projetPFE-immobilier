import { Box, List, ListItem, ListItemIcon, ListItemText, Drawer, AppBar, Toolbar, Typography, LinearProgress, Stack, Paper } from '@mui/material';
import { Person, Settings, Description, Favorite, Search } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AssignmentIcon from '@mui/icons-material/Assignment';

const drawerWidth = 260;

export default function DashboardLayout() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tenant/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setCompletion(res.data?.completionPercentage || 0);
      } catch (err) {
        console.error('Error fetching completion:', err);
      }
    };
    fetchCompletion();
    const interval = setInterval(fetchCompletion, 5000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { text: 'Profil', icon: <Person />, path: '/dashboard/profile' },
    { text: 'Préférences', icon: <Settings />, path: '/dashboard/preferences' },
    { text: 'Mes Documents', icon: <Description />, path: '/dashboard/documents' },
    { text: 'Recherches', icon: <Search />, path: '/dashboard/searches' },
    { text: 'Mes Favoris', icon: <Favorite />, path: '/dashboard/favorites' },
    { text: 'Mes Candidatures', icon: <AssignmentIcon />, path: '/dashboard/applications' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* EN-TETE DASHBOARD */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #00BCD4 0%, #a6c1db 100%)',
          borderBottom: 'none',
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              letterSpacing: 0.5,
              color: '#ffffff',
            }}
          >
             HOMA - Espace Locataire
          </Typography>
        </Toolbar>
      </AppBar>

      {/* LAYOUT PRINCIPAL */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        
        {/* SIDEBAR GAUCHE */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              position: 'relative',
              height: 'auto',
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
              bgcolor: '#ffffff',
              mt: 0,
              pt: 3,
            },
          }}
        >
          <Box sx={{ overflow: 'auto', pb: 3 }}>
            
            {/* WIDGET COMPLÉTUDE */}
            <Paper 
              sx={{ 
                p: 2.5, 
                mx: 2, 
                mb: 3, 
                borderRadius: 2,
                background: completion === 100 
                  ? 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)'
                  : 'linear-gradient(135deg, #fff3cd 0%, #ffe0b2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 'bold', 
                  display: 'block', 
                  mb: 1.5,
                  color: completion === 100 ? '#2e7d32' : '#e65100',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Profil complet
              </Typography>
              
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: completion === 100 ? '#2e7d32' : '#e65100',
                  mb: 1,
                }}
              >
                {completion}%
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={completion} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: completion === 100 ? '#a5d6a7' : '#ffe0b2',
                  mb: 1.5,
                  '& .MuiLinearProgress-bar': { 
                    background: completion === 100 
                      ? 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)'
                      : 'linear-gradient(90deg, #ff9800 0%, #fb8c00 100%)',
                    borderRadius: 4,
                  } 
                }} 
              />
              
              <Typography 
                variant="body2"
                sx={{ 
                  color: completion === 100 ? '#2e7d32' : '#e65100',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                {completion === 100 
                  ? '✓ Votre profil est complet !'
                  : `${100 - completion}% à compléter`
                }
              </Typography>
            </Paper>

            {/* MENU NAVIGATION */}
            <List sx={{ px: 1 }}>
              {menuItems.map((item, index) => (
                <ListItem 
                  key={item.text} 
                  component={Link} 
                  to={item.path}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.8,
                    px: 2,
                    py: 1.2,
                    color: '#0a1930',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      bgcolor: 'rgba(0, 188, 212, 0.1)',
                      transform: 'translateX(4px)',
                    },
                    '&.active': {
                      bgcolor: 'rgba(0, 188, 212, 0.15)',
                      borderLeft: '3px solid #00BCD4',
                      pl: '1.4rem',
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: '#00BCD4',
                      minWidth: 40,
                      fontSize: '1.2rem'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.95rem', 
                      fontWeight: '500',
                      color: '#0a1930'
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* CONTENU PRINCIPAL */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 2, md: 4 },
            bgcolor: '#f8f9fa',
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}