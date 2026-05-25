import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Chip 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import BarChartIcon from '@mui/icons-material/BarChart';
import FolderIcon from '@mui/icons-material/Folder';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const drawerWidth = 260;

const AgencyDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isVerified, setIsVerified] = useState(false);
  const [agencyName, setAgencyName] = useState('Mon Agence');

  // Charger le statut de vérification de l'agence
  useEffect(() => {
    const fetchAgencyStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        // Ajouter un paramètre de cache-busting pour forcer le rafraîchissement
        const response = await axios.get(`${API_BASE_URL}/agency/me?t=${Date.now()}`, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        console.log('[DEBUG] Réponse /agency/me:', response.data);
        
        // Récupérer le nom de l'agence
        if (response.data && response.data.name) {
          setAgencyName(response.data.name);
        }
        
        // Utiliser isVerifiedByAdmin si disponible, sinon vérifier isVerified
        if (response.data && response.data.isVerifiedByAdmin !== undefined) {
          console.log('[DEBUG] isVerifiedByAdmin:', response.data.isVerifiedByAdmin);
          setIsVerified(response.data.isVerifiedByAdmin);
        } else if (response.data && response.data.verificationStatus === 'approved') {
          console.log('[DEBUG] verificationStatus approved');
          setIsVerified(true);
        } else {
          console.log('[DEBUG] Aucun statut de vérification trouvé');
          setIsVerified(false);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du statut d\'agence:', error);
        setIsVerified(false);
      }
    };

    fetchAgencyStatus();
    
    // Rafraîchir le statut toutes les 5 secondes pour détecter les changements de vérification
    const interval = setInterval(fetchAgencyStatus, 5000);
    return () => clearInterval(interval);
  }, []); 

  const menuItems = [
    { text: 'Vue d\'ensemble', icon: <DashboardIcon />, path: '/agency/dashboard' },
    { text: 'Gestion du Profil', icon: <PersonIcon />, path: '/agency/profile' },
    { text: 'Mes Annonces', icon: <HomeWorkIcon />, path: '/agency/properties' },
    { text: 'Analytics Global', icon: <BarChartIcon />, path: '/agency/analytics' },
    { text: 'Candidatures', icon: <PeopleIcon />, path: '/agency/applications' },
    { text: 'Rapports Demandes', icon: <BarChartIcon />, path: '/agency/requests-report' },
    { text: 'Dossiers Locatifs', icon: <FolderIcon />, path: '/agency/tenant-files' },
    { text: 'Paiements Reçus', icon: <PaymentIcon />, path: '/agency/payments-received' },
    { text: 'Vérification Profil', icon: <VerifiedUserIcon />, path: '/agency/verification' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/agency/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7fe', minHeight: '100vh' }}>
      {/* BARRE LATÉRALE */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none', boxShadow: '4px 0 10px rgba(0,0,0,0.02)' },
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1A237E' }}>
            ImmoAgency Pro
          </Typography>
          <Chip 
            label={isVerified ? "Vérifié" : "Non vérifié"} 
            color={isVerified ? "success" : "warning"}
            size="small"
            sx={{ mt: 1, fontWeight: 'bold' }}
          />
        </Box>
        
        <Divider sx={{ mx: 2 }} />

        <List sx={{ px: 2, mt: 2 }}>
          {menuItems.map((item) => {
            // Vérifier si la route actuelle correspond (y compris les routes enfants)
            const isSelected = location.pathname === item.path || 
                              location.pathname.startsWith(item.path + '/');
            
            return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                selected={isSelected}
                sx={{ 
                  borderRadius: 2,
                  '&.Mui-selected': { bgcolor: '#E8EAF6', color: '#3F51B5' },
                  '&.Mui-selected .MuiListItemIcon-root': { color: '#3F51B5' }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'medium' }} />
              </ListItemButton>
            </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', p: 2 }}>
          <ListItemButton onClick={() => { localStorage.clear(); navigate('/login'); }} sx={{ borderRadius: 2, color: 'error.main' }}>
            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* CONTENU PRINCIPAL */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', color: 'text.primary', mb: 3 }}>
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <Typography variant="body2" sx={{ mr: 2, fontWeight: 'bold' }}>{agencyName}</Typography>
            <Avatar sx={{ bgcolor: '#3F51B5' }}>A</Avatar>
          </Toolbar>
        </AppBar>

        {/* C'est ici que les pages spécifiques s'afficheront */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AgencyDashboardLayout;