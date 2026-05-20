import React, { useState, useEffect } from 'react';
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
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import API_BASE_URL from '../../config/api';


const PlatformSettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/settings`);
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
      console.log('Utilisation des paramètres par défaut');
    } finally {
      setLoading(false);
    }
  };

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
      await axios.put(`${API_BASE_URL}/admin/settings`, payload);
      setSuccess('Paramètres sauvegardés !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur : ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Card>
        <CardHeader title="Paramètres" />
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Stack spacing={2.5}>
            <TextField
              label="Nom Plateforme"
              value={settings.platformName}
              onChange={(e) => handleChange('platformName', e.target.value)}
              fullWidth
              size="small"
            />

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

            <TextField
              label="Taille Max Fichiers (MB)"
              type="number"
              value={settings.maxUploadFileSize}
              onChange={(e) => handleChange('maxUploadFileSize', parseInt(e.target.value))}
              fullWidth
              size="small"
            />

            <Divider />

            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                E-mail et reset mot de passe
              </Typography>
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

              <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Sécurité du compte</span>
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
              </Box>
            </Stack>

            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Mode Maintenance</span>
                  <Chip label={settings.maintenanceMode ? 'ACTIF' : 'INACTIF'} size="small" color={settings.maintenanceMode ? 'warning' : 'default'} />
                </Box>
                <FormControlLabel
                  control={<Switch checked={settings.maintenanceMode} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} />}
                  label="Activer"
                />
                <TextField
                  label="Message"
                  value={settings.maintenanceMessage}
                  onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  disabled={!settings.maintenanceMode}
                />
              </Stack>
            </Box>

            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} fullWidth>
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlatformSettingsPage;
