import { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Stack,
  Typography,
  Paper,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export default function NotificationPanel() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);

  // Charger les notifications au démarrage et toutes les 10 secondes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(res.data);
      
      // Compter les non-lues
      const unread = res.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (err) {
      console.error('Erreur marquage notification:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification._id);
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'status_change': return 'info';
      case 'new_message': return 'warning';
      default: return 'default';
    }
  };

  return (
    <>
      {/* Bell Icon */}
      <IconButton
        onClick={handleClick}
        sx={{
          color: '#0a1930',
          position: 'relative',
          ml: 2,
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Notification Panel */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ width: 400, maxHeight: 500, overflow: 'auto', p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Contenu */}
          {notifications.length === 0 ? (
            <Alert severity="info">Aucune notification pour le moment</Alert>
          ) : (
            <Stack spacing={1}>
              {notifications.map((notification) => (
                <Paper
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    backgroundColor: notification.isRead ? '#f5f5f5' : '#e3f2fd',
                    borderLeft: `4px solid ${notification.isRead ? '#ddd' : '#2196f3'}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: notification.isRead ? '#eeeeee' : '#bbdefb',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  {/* Type Badge */}
                  <Chip
                    label={notification.type === 'status_change' ? 'Candidature' : 'Message'}
                    size="small"
                    color={getTypeColor(notification.type)}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />

                  {/* Message */}
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {notification.message}
                  </Typography>

                  {/* Date */}
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>

                  {/* Bouton si non lue */}
                  {!notification.isRead && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        sx={{ color: '#2196f3', textTransform: 'none', fontSize: '0.85rem' }}
                      >
                        Marquer comme lue
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Popover>
    </>
  );
}
