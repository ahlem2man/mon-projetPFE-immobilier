import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  InputAdornment,
  Typography,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BrandingIcon from '@mui/icons-material/Palette';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';
import API_BASE_URL from '../../config/api';


const PlatformSettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const token = localStorage.getItem('token');

  const [settings, setSettings] = useState({
    platformName: 'Immo Ahlem',
    platformCommission: 10,
    commissionType: 'percentage',
    maxUploadFileSize: 10,
    maintenanceMode: false,
    maintenanceMessage: 'La plateforme est en maintenance.',
    emailSettings: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      fromEmail: 'noreply@immo-ahlem.com',
      fromName: 'Immo Ahlem'
    },
    securitySettings: {
      requireEmailVerification: true,
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      sessionTimeout: 30
    }
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setSettings({
          platformName: response.data.brandingSettings?.platformName || 'Immo Ahlem',
          platformCommission: response.data.financialSettings?.platformCommission || 10,
          commissionType: response.data.financialSettings?.commissionType || 'percentage',
          maxUploadFileSize: response.data.platformLimits?.maxUploadFileSize || 10,
          maintenanceMode: response.data.maintenanceSettings?.maintenanceMode || false,
          maintenanceMessage: response.data.maintenanceSettings?.maintenanceMessage || '',
          emailSettings: {
            smtpHost: response.data.emailSettings?.smtpHost || 'smtp.gmail.com',
            smtpPort: response.data.emailSettings?.smtpPort || 587,
            fromEmail: response.data.emailSettings?.fromEmail || 'noreply@immo-ahlem.com',
            fromName: response.data.emailSettings?.fromName || 'Immo Ahlem'
          },
          securitySettings: {
            requireEmailVerification: response.data.securitySettings?.requireEmailVerification ?? true,
            passwordMinLength: response.data.securitySettings?.passwordMinLength || 8,
            maxLoginAttempts: response.data.securitySettings?.maxLoginAttempts || 5,
            sessionTimeout: response.data.securitySettings?.sessionTimeout || 30
          }
        });
      }
    } catch (err) {
      console.log('Utilisation des paramètres par défaut', err?.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSuccess('');
  };

  const handleNestedChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      console.log('[DEBUG] Début sauvegarde');
      console.log('[DEBUG] Token:', token ? 'présent' : 'absent');
      
      const payload = {
        brandingSettings: { platformName: settings.platformName },
        financialSettings: { 
          platformCommission: settings.platformCommission,
          commissionType: settings.commissionType
        },
        emailSettings: {
          smtpHost: settings.emailSettings.smtpHost,
          smtpPort: settings.emailSettings.smtpPort,
          fromEmail: settings.emailSettings.fromEmail,
          fromName: settings.emailSettings.fromName
        },
        securitySettings: {
          requireEmailVerification: settings.securitySettings.requireEmailVerification,
          passwordMinLength: settings.securitySettings.passwordMinLength,
          maxLoginAttempts: settings.securitySettings.maxLoginAttempts,
          sessionTimeout: settings.securitySettings.sessionTimeout
        },
        platformLimits: { maxUploadFileSize: settings.maxUploadFileSize },
        maintenanceSettings: {
          maintenanceMode: settings.maintenanceMode,
          maintenanceMessage: settings.maintenanceMessage
        }
      };
      
      console.log('[DEBUG] Payload:', payload);
      console.log('[DEBUG] URL:', `${API_BASE_URL}/admin/settings`);
      
      const response = await axios.put(`${API_BASE_URL}/admin/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('[DEBUG] Réponse:', response);
      console.log('[DEBUG] Message de succès affiché');
      setSuccess(' Paramètres sauvegardés avec succès !');
      setTimeout(() => {
        console.log('[DEBUG] Masquage du message de succès');
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error('[ERROR] Erreur sauvegarde:', err);
      console.error('[ERROR] Response:', err.response);
      setError('Erreur : ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSuccess('');
    setError('');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900 }}>
      <Card>
        <CardHeader title="Paramètres de la Plateforme" />
        
        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ m: 2 }}>{success}</Alert>}

        {/* TABS */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Branding" icon={<BrandingIcon />} iconPosition="start" />
          <Tab label="Email & Sécurité" icon={<EmailIcon />} iconPosition="start" />
          <Tab label="Maintenance" icon={<WarningIcon />} iconPosition="start" />
        </Tabs>

        <CardContent>
          {/* TAB 0: BRANDING */}
          {tabValue === 0 && (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>Paramètres Généraux</Typography>
              
              <TextField
                label="Nom Plateforme"
                value={settings.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
                fullWidth
                size="small"
              />

              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Paramètres Financiers</Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Commission"
                  type="number"
                  value={settings.platformCommission}
                  onChange={(e) => handleChange('platformCommission', parseFloat(e.target.value))}
                  sx={{ flex: 1 }}
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{settings.commissionType === 'percentage' ? '%' : 'DZD'}</InputAdornment>,
                  }}
                />
                <TextField
                  select
                  label="Type"
                  value={settings.commissionType}
                  onChange={(e) => handleChange('commissionType', e.target.value)}
                  sx={{ flex: 1 }}
                  size="small"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">DZD</option>
                </TextField>
              </Box>

              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Limites de Plateforme</Typography>

              <TextField
                label="Taille Max Fichiers (MB)"
                type="number"
                value={settings.maxUploadFileSize}
                onChange={(e) => handleChange('maxUploadFileSize', parseInt(e.target.value))}
                fullWidth
                size="small"
              />
            </Stack>
          )}

          {/* TAB 1: EMAIL & SÉCURITÉ */}
          {tabValue === 1 && (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>E-mail et Reset Mot de Passe</Typography>
              
              <TextField
                label="Serveur SMTP"
                value={settings.emailSettings.smtpHost}
                onChange={(e) => handleNestedChange('emailSettings', 'smtpHost', e.target.value)}
                fullWidth
                size="small"
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Port SMTP"
                  type="number"
                  value={settings.emailSettings.smtpPort}
                  onChange={(e) => handleNestedChange('emailSettings', 'smtpPort', parseInt(e.target.value))}
                  sx={{ flex: 1 }}
                  size="small"
                />
                <TextField
                  label="Adresse e-mail"
                  value={settings.emailSettings.fromEmail}
                  onChange={(e) => handleNestedChange('emailSettings', 'fromEmail', e.target.value)}
                  sx={{ flex: 1 }}
                  size="small"
                />
              </Box>

              <TextField
                label="Nom d'envoi"
                value={settings.emailSettings.fromName}
                onChange={(e) => handleNestedChange('emailSettings', 'fromName', e.target.value)}
                fullWidth
                size="small"
              />

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Sécurité du Compte</Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Vérification Email</Typography>
                <Chip label={settings.securitySettings.requireEmailVerification ? 'VERIFIE' : 'OPTIONNEL'} size="small" color={settings.securitySettings.requireEmailVerification ? 'primary' : 'default'} />
              </Box>

              <FormControlLabel
                control={<Switch checked={settings.securitySettings.requireEmailVerification} onChange={(e) => handleNestedChange('securitySettings', 'requireEmailVerification', e.target.checked)} />}
                label="Exiger la vérification de l'e-mail"
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Longueur min. mot de passe"
                  type="number"
                  value={settings.securitySettings.passwordMinLength}
                  onChange={(e) => handleNestedChange('securitySettings', 'passwordMinLength', parseInt(e.target.value))}
                  sx={{ flex: 1 }}
                  size="small"
                />
                <TextField
                  label="Temps de session (min)"
                  type="number"
                  value={settings.securitySettings.sessionTimeout}
                  onChange={(e) => handleNestedChange('securitySettings', 'sessionTimeout', parseInt(e.target.value))}
                  sx={{ flex: 1 }}
                  size="small"
                />
              </Box>

              <TextField
                label="Tentatives de connexion max"
                type="number"
                value={settings.securitySettings.maxLoginAttempts}
                onChange={(e) => handleNestedChange('securitySettings', 'maxLoginAttempts', parseInt(e.target.value))}
                fullWidth
                size="small"
              />
            </Stack>
          )}

          {/* TAB 2: MAINTENANCE */}
          {tabValue === 2 && (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>Mode Maintenance</Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>État du Mode Maintenance</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Bloquer l'accès aux utilisateurs non-admin</Typography>
                </Box>
                <Chip label={settings.maintenanceMode ? 'ACTIF' : 'INACTIF'} size="small" color={settings.maintenanceMode ? 'warning' : 'default'} />
              </Box>

              <FormControlLabel
                control={<Switch checked={settings.maintenanceMode} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} />}
                label="Activer le mode maintenance"
              />

              <TextField
                label="Message de Maintenance"
                value={settings.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                fullWidth
                multiline
                rows={3}
                size="small"
                disabled={!settings.maintenanceMode}
                placeholder="Message affiché aux utilisateurs..."
              />
            </Stack>
          )}

          {/* SAVE BUTTON */}
          <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} sx={{ flex: 1 }}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder les Paramètres'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlatformSettingsPage;
