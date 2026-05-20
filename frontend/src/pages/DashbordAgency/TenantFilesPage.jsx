import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, TextField, Button, CircularProgress,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar,
  Chip, Alert, InputAdornment, Card, CardContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const TenantFilesPage = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // Récupérer les dossiers reçus par cette agence
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        
        // Récupérer uniquement les dossiers reçus par cette agence
        const tenantsRes = await axios.get(`${API_BASE_URL}/tenants/received-dossiers`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Dossiers reçus:', tenantsRes.data);
        
        if (tenantsRes.data.data && Array.isArray(tenantsRes.data.data)) {
          // Transformer les données reçues pour compatibilité avec le reste de la page
          const formattedTenants = tenantsRes.data.data.map(submission => ({
            _id: submission._id,
            userId: submission.tenantId?._id || submission.tenantId, // Extraire l'ID si c'est un objet populate
            fullName: submission.profileSnapshot?.fullName,
            email: submission.profileSnapshot?.email,
            phone: submission.profileSnapshot?.phone,
            profession: submission.profileSnapshot?.profession,
            documents: submission.documents,
            createdAt: submission.createdAt,
            message: submission.message,
            status: submission.submissions?.[0]?.status
          }));
          setTenants(formattedTenants);
          setError('');
        }
      } catch (err) {
        console.error('Erreur fetch dossiers:', err);
        setError('Impossible de charger les dossiers reçus');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [token]);

  // Filtrer les locataires par terme de recherche
  const filteredTenants = tenants.filter(tenant =>
    tenant.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.phone?.includes(searchTerm)
  );

  // Compter les documents d'un locataire
  const countDocuments = (documents) => {
    if (!documents) return 0;
    return Object.values(documents).filter(doc => doc).length;
  };

  const handleTenantClick = (tenant) => {
    // Use the User ID in the URL and pass submissionId in state
    navigate(`/agency/tenant-files/${tenant.userId}`, { state: { tenant, submissionId: tenant._id } });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: 2 }}>
        <CircularProgress />
        <Typography variant="h6">Chargement des dossiers locatifs...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
         Dossiers Locatifs
      </Typography>

      {/* Barre de recherche */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Rechercher un locataire (nom, email, téléphone)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {filteredTenants.length === 0 ? (
        <Alert severity="info">
          {searchTerm ? 'Aucun locataire correspondant à votre recherche' : 'Aucun locataire n\'a postulé à vos propriétés'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredTenants.map((tenant) => {
            const docCount = countDocuments(tenant.documents);
            const hasAllDocs = docCount >= 8;

            return (
              <Grid size={{ xs: 12 }} key={tenant._id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transform: 'translateY(-4px)',
                    },
                    borderRadius: 2,
                  }}
                  onClick={() => handleTenantClick(tenant)}
                >
                  <CardContent>
                    <Grid container spacing={3} alignItems="center">
                      {/* Avatar et infos basiques */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: '#3F51B5',
                              fontSize: '1.5rem',
                            }}
                          >
                            {tenant.fullName?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {tenant.fullName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <EmailIcon sx={{ fontSize: '0.9rem', color: '#666' }} />
                              <Typography variant="caption" color="textSecondary">
                                {tenant.email}
                              </Typography>
                            </Box>
                            {tenant.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <PhoneIcon sx={{ fontSize: '0.9rem', color: '#666' }} />
                                <Typography variant="caption" color="textSecondary">
                                  {tenant.phone}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Grid>

                      {/* Documents et statistiques */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                          <Box sx={{ textAlign: 'right' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <FolderIcon sx={{ color: '#3F51B5' }} />
                              <Typography variant="h6" fontWeight="bold">
                                {docCount}/9
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              {docCount === 9 ? '✓ Dossier complet' : 'Dossier incomplet'}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={`${tenant.completionPercentage || 0}% complet`}
                                size="small"
                                color={tenant.completionPercentage >= 80 ? 'success' : 'warning'}
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          <ArrowForwardIcon sx={{ color: '#999' }} />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default TenantFilesPage;
