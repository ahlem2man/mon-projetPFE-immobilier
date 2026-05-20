import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, CircularProgress, Alert, Button,
  List, ListItem, ListItemIcon, ListItemText, Divider, Card, CardContent,
  Chip, Stack, Avatar
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { AuthContext } from '../../context/AuthContext';

const TenantFilesDetailPage = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState('');
  const token = localStorage.getItem('token');

  // Mappage des types de documents avec descriptions
  const documentTypes = {
    identityCard: {
      name: 'Pièce d\'identité',
      description: 'Carte d\'identité, passeport ou titre de séjour',
      category: 'Identité'
    },
    taxNotice: {
      name: 'Avis d\'imposition',
      description: 'Avis d\'imposition de l\'année précédente',
      category: 'Revenus'
    },
    lastThreePayslips: {
      name: 'Trois derniers bulletins de salaire',
      description: 'Bulletins de paie des 3 derniers mois',
      category: 'Revenus'
    },
    employmentContract: {
      name: 'Contrat de travail',
      description: 'Contrat de travail CDI/CDD ou équivalent',
      category: 'Emploi'
    },
    employerAttestation: {
      name: 'Attestation employeur',
      description: 'Lettre de l\'employeur confirmant l\'emploi',
      category: 'Emploi'
    },
    rentalReceipts: {
      name: 'Quittances de loyer',
      description: 'Preuves de paiement du loyer actuel',
      category: 'Situation actuelle'
    },
    propertyTax: {
      name: 'Taxe foncière',
      description: 'Taxe foncière ou avis de taxe d\'habitation',
      category: 'Situation actuelle'
    },
    accommodationAttestation: {
      name: 'Attestation d\'hébergement',
      description: 'Attestation de domicile actuellement chez un tiers',
      category: 'Situation actuelle'
    },
    utilityBill: {
      name: 'Facture de domicile',
      description: 'Facture EDF/GDF/Internet datant de moins de 3 mois',
      category: 'Domicile'
    }
  };

  useEffect(() => {
    const fetchTenantProfile = async () => {
      try {
        setLoading(true);
        console.log('[useEffect] Récupération profil pour tenantId (userId):', tenantId);
        
        const res = await axios.get(`${API_BASE_URL}/tenants/profile/${tenantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('[useEffect] Profil reçu:', res.data);
        console.log('[useEffect] Tenant._id:', res.data.data?._id, 'Documents:', Object.keys(res.data.data?.documents || {}).length);
        
        setTenant(res.data.data);
        setError('');
      } catch (err) {
        console.error('Erreur fetch profil:', err);
        setError('Impossible de charger le dossier du locataire');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantProfile();
  }, [tenantId, token]);

  const countDocuments = (documents) => {
    if (!documents) return 0;
    return Object.values(documents).filter(doc => doc).length;
  };

  const getDocumentUrl = (filePath) => {
    if (!filePath) return null;
    
    // Normaliser les chemins Windows en chemins Unix
    let normalizedPath = filePath.replace(/\\/g, '/');
    
    // S'assurer que le chemin commence par /uploads
    if (!normalizedPath.startsWith('/uploads')) {
      normalizedPath = '/uploads/' + normalizedPath.replace(/^uploads\/?/, '');
    }
    
    // Construire l'URL complète (SANS /api)
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${normalizedPath}`;
  };

  const openDocument = (filePath) => {
    if (!filePath) {
      alert('Document non disponible');
      return;
    }
    
    try {
      const docUrl = getDocumentUrl(filePath);
      console.log('Ouverture du document:', docUrl);
      window.open(docUrl, '_blank');
    } catch (err) {
      console.error('Erreur ouverture document:', err);
      alert('Impossible d\'ouvrir le document');
    }
  };

  const downloadDocument = (filePath, docName) => {
    if (!filePath) {
      alert('Document non disponible');
      return;
    }
    
    try {
      const docUrl = getDocumentUrl(filePath);
      console.log('Téléchargement du document:', docUrl);
      
      // Extraire l'extension du fichier
      const fileExtension = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
      const fileName = `${docName}${fileExtension}`;
      
      // Utiliser fetch pour forcer le téléchargement
      fetch(docUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          // Créer une URL blob
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Créer un élément <a> pour télécharger
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          
          // Nettoyer
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          }, 100);
        })
        .catch(err => {
          console.error('Erreur téléchargement document:', err);
          alert('Impossible de télécharger le document: ' + err.message);
        });
    } catch (err) {
      console.error('Erreur téléchargement document:', err);
      alert('Impossible de télécharger le document');
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      // Use the Tenant document _id when available (returned by the profile API),
      // otherwise fall back to the route param which may contain the userId.
      const targetTenantId = tenant?._id || tenantId;
      console.log('[handleStatusChange] Envoi PATCH avec targetTenantId:', targetTenantId, 'status:', newStatus);
      
      const response = await axios.patch(
        `${API_BASE_URL}/tenants/file/${targetTenantId}/status`,
        {
          status: newStatus,
          note: note || null
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('[handleStatusChange] PATCH réponse:', response.data);
      setTenant(response.data.data);
      setNote('');
      
      // Vérification: relire le profil immédiatement pour confirmer la persistance
      console.log('[handleStatusChange] Vérification: relecture du profil...');
      const verifyRes = await axios.get(`${API_BASE_URL}/tenants/profile/${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[handleStatusChange] Profil vérifié - fileStatus:', verifyRes.data.data?.fileStatus);
      
      if (verifyRes.data.data?.fileStatus !== newStatus) {
        console.warn('[handleStatusChange] ⚠️ ALERTE: Le statut n\'a pas persisté! Attendu:', newStatus, 'Reçu:', verifyRes.data.data?.fileStatus);
        alert(`⚠️ Attention: La mise à jour peut ne pas avoir fonctionné. Statut actuel: ${verifyRes.data.data?.fileStatus}`);
      }
      
      alert(`Dossier mis à jour en ${newStatus}`);
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      alert('Erreur lors de la mise à jour du dossier');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      alert('Veuillez entrer une note');
      return;
    }

    setActionLoading(true);
    try {
      const targetTenantId = tenant?._id || tenantId;
      const response = await axios.post(
        `${API_BASE_URL}/tenants/file/${targetTenantId}/note`,
        { note },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setTenant(response.data.data);
      setNote('');
      alert('Note ajoutée avec succès');
    } catch (err) {
      console.error('Erreur ajout note:', err);
      alert('Erreur lors de l\'ajout de la note');
    } finally {
      setActionLoading(false);
    }
  };

  const groupDocumentsByCategory = () => {
    const grouped = {};
    if (!tenant?.documents) return grouped;

    Object.entries(tenant.documents).forEach(([key, path]) => {
      const docType = documentTypes[key];
      if (!docType) return;

      if (!grouped[docType.category]) {
        grouped[docType.category] = [];
      }

      grouped[docType.category].push({
        key,
        path,
        ...docType
      });
    });

    return grouped;
  };

  // Filtrer l'historique pour n'afficher que celui de l'agence connectée
  const getFilteredHistory = () => {
    if (!tenant?.fileHistory || tenant.fileHistory.length === 0) {
      return [];
    }
    
    return tenant.fileHistory.filter(entry => {
      // Gérer les deux cas: agencyId peut être un string (ID) ou un objet (popuplé)
      const entryAgencyId = entry.agencyId?._id || entry.agencyId;
      return entryAgencyId === user?.id;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: 2 }}>
        <CircularProgress />
        <Typography variant="h6">Chargement du dossier...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>;
  }

  const groupedDocs = groupDocumentsByCategory();
  const docCount = countDocuments(tenant?.documents);
  const isComplete = docCount === Object.keys(documentTypes).length;

  return (
    <Box>
      {/* Bouton retour */}
      <Button
        onClick={() => navigate('/agency/tenant-files')}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: '#0a1930', fontWeight: '500' }}
      >
        Retour aux dossiers
      </Button>

      {/* En-tête: Infos du locataire */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '2rem',
                  color: '#fff',
                }}
              >
                {tenant?.fullName?.charAt(0).toUpperCase() || tenant?.userId?.fullName?.charAt(0).toUpperCase() || 'L'}
              </Avatar>
              <Box sx={{ color: '#fff' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                  {tenant?.fullName || tenant?.userId?.fullName || 'Locataire'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2">{tenant?.email || tenant?.userId?.email || 'N/A'}</Typography>
                  </Box>
                  {(tenant?.phone || tenant?.userId?.phone) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" />
                      <Typography variant="body2">{tenant?.phone || tenant?.userId?.phone}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Statistiques */}
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            <Box sx={{ color: '#fff' }}>
              <Typography variant="h4" fontWeight="bold">
                {docCount}/{Object.keys(documentTypes).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Documents fournis
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={tenant?.completionPercentage || 0 + '%'}
                  sx={{
                    bgcolor: isComplete ? '#4caf50' : '#ff9800',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    height: '32px',
                  }}
                  icon={isComplete ? <CheckCircleIcon /> : <WarningIcon />}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Sections de documents groupés par catégorie */}
      <Stack spacing={3}>
        {Object.entries(groupedDocs).length === 0 ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <WarningIcon sx={{ mt: 0.5, flexShrink: 0 }} />
              <Box>
                <Typography fontWeight="bold">Aucun document fourni</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Le dossier de ce locataire est vide. Vous pouvez demander les documents nécessaires via la candidature.
                </Typography>
              </Box>
            </Box>
          </Alert>
        ) : (
          Object.entries(groupedDocs).map(([category, docs]) => (
            <Card key={category} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon sx={{ color: '#3F51B5' }} />
                  {category}
                </Typography>

                <List sx={{ p: 0 }}>
                  {docs.map((doc, index) => (
                    <Box key={doc.key}>
                      {index > 0 && <Divider />}
                      <ListItem
                        sx={{
                          py: 2,
                          px: 0,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          '&:hover': {
                            bgcolor: 'rgba(63, 81, 181, 0.02)',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <DescriptionIcon sx={{ color: '#3F51B5' }} />
                          <Box>
                            <Typography fontWeight="500" variant="body2">
                              {doc.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {doc.description}
                            </Typography>
                          </Box>
                        </Box>

                        {doc.path ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<OpenInNewIcon />}
                              onClick={() => openDocument(doc.path)}
                            >
                              Ouvrir
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              onClick={() => downloadDocument(doc.path, doc.name)}
                            >
                              Télécharger
                            </Button>
                          </Box>
                        ) : (
                          <Chip
                            label="Non fourni"
                            variant="outlined"
                            color="error"
                            size="small"
                          />
                        )}
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>

      {/* Infos supplémentaires du locataire */}
      {tenant?.professionalStatus && (
        <Card sx={{ mt: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Informations Professionnelles
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  Statut Professionnel
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {tenant.professionalStatus.status || 'Non spécifié'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  Garant
                </Typography>
                <Chip
                  label={tenant.professionalStatus.hasGuarantee ? 'Oui' : 'Non'}
                  color={tenant.professionalStatus.hasGuarantee ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Section Actions et Notes */}
      <Card sx={{ mt: 4, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
             Actions et Notes
          </Typography>

          {/* Statut actuel */}
          <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
              Statut du dossier
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={tenant?.fileStatus || 'En attente'}
                color={
                  tenant?.fileStatus === 'verified' ? 'success' :
                  tenant?.fileStatus === 'rejected' ? 'error' :
                  tenant?.fileStatus === 'info_required' ? 'warning' :
                  'default'
                }
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>

          {/* Boutons d'action */}
          <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 2 }}>
              Évaluer le dossier
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusChange('verified')}
                disabled={actionLoading || tenant?.fileStatus === 'verified'}
                sx={{ minWidth: 140 }}
              >
                 Approuver
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() => handleStatusChange('info_required')}
                disabled={actionLoading || tenant?.fileStatus === 'info_required'}
                sx={{ minWidth: 140 }}
              >
                 Demander infos
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleStatusChange('rejected')}
                disabled={actionLoading || tenant?.fileStatus === 'rejected'}
                sx={{ minWidth: 140 }}
              >
                 Refuser
              </Button>
            </Stack>
          </Box>

          {/* Section notes */}
          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 2 }}>
              Ajouter une note interne
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <input
                type="text"
                placeholder="Votre note interne..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontFamily: 'inherit',
                  fontSize: '14px'
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddNote}
                disabled={actionLoading || !note.trim()}
              >
                Ajouter
              </Button>
            </Box>
          </Box>

          {/* Historique */}
          {tenant?.fileHistory && tenant.fileHistory.length > 0 && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 2 }}>
                 Historique de cette agence
              </Typography>
              {(() => {
                const filteredHistory = getFilteredHistory();
                
                if (filteredHistory.length === 0) {
                  return (
                    <Typography variant="body2" color="textSecondary">
                      Aucune action enregistrée pour votre agence
                    </Typography>
                  );
                }
                
                return (
                  <Stack spacing={1}>
                    {filteredHistory.map((entry, idx) => (
                      <Box key={idx} sx={{
                        p: 1.5,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        fontSize: '0.85rem'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 0.5 }}>
                          <Chip
                            label={entry.status}
                            size="small"
                            color={
                              entry.status === 'verified' ? 'success' :
                              entry.status === 'rejected' ? 'error' :
                              entry.status === 'info_required' ? 'warning' :
                              'default'
                            }
                            variant="outlined"
                          />
                          <Typography variant="caption" color="textSecondary">
                            {new Date(entry.createdAt).toLocaleString('fr-FR')}
                          </Typography>
                        </Box>
                        {entry.note && (
                          <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                             {entry.note}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                );
              })()}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantFilesDetailPage;
