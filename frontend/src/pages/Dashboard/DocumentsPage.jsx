import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, 
  Container, IconButton, LinearProgress, Snackbar, Alert, 
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const DocumentsPage = () => {
  // Situation professionnelle et garant
  const [applicantProfile, setApplicantProfile] = useState({
    professionalStatus: '',
    hasGuarantee: false,
    guaranteeDetails: ''
  });

  const [completion, setCompletion] = useState(0);

  // Documents structurés selon les critères complets
  const [documents, setDocuments] = useState({
    // Pièce d'identité
    identityCard: { file: null, label: "Pièce d'identité", description: "CNI, Passeport ou Titre de séjour", section: "Identité" },

    // Justificatifs de revenus
    taxNotice: { file: null, label: "Avis d'imposition", description: "Derniers avis d'imposition", section: "Revenus" },
    lastThreePayslips: { file: null, label: "3 derniers bulletins de salaire", description: "Bulletins de paie des 3 derniers mois", section: "Revenus" },
    employmentContract: { file: null, label: "Contrat de travail", description: "Contrat signé et actualisé", section: "Revenus" },
    employerAttestation: { file: null, label: "Attestation employeur", description: "Document signée et tamponnée", section: "Revenus" },

    // Situation actuelle de logement
    rentalReceipts: { file: null, label: "3 dernières quittances de loyer", description: "Justificatif de paiement loyer", section: "Logement" },
    propertyTax: { file: null, label: "Taxe foncière (si propriétaire)", description: "Document certes si propriétaire", section: "Logement" },
    accommodationAttestation: { file: null, label: "Attestation d'hébergement", description: "Si hébergé chez un tiers", section: "Logement" },

    // Justificatif de domicile
    utilityBill: { file: null, label: "Facture récente (électricité, gaz, eau, internet, etc.)", description: "Facture EDF ou autre facture utilitaire", section: "Domicile" }
  });

  const [uploading, setUploading] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // États pour l'envoi du dossier aux agences
  const [agencies, setAgencies] = useState([]);
  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [openAgenciesDialog, setOpenAgenciesDialog] = useState(false);
  const [sendingMessage, setSendingMessage] = useState('');

  // Charger le profil au démarrage (Étape 8)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/tenants/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data) {
          setCompletion(res.data.completionPercentage || 0);
          
          // Charger infos professionnelles
          if (res.data.professionalStatus) {
            setApplicantProfile({
              professionalStatus: res.data.professionalStatus.status || '',
              hasGuarantee: res.data.professionalStatus.hasGuarantee || false,
              guaranteeDetails: res.data.professionalStatus.guaranteeDetails || ''
            });
          }
          
          // 🆕 Charger les documents sauvegardés au backend
          if (res.data.documents) {
            setDocuments(prev => {
              const updated = { ...prev };
              Object.keys(res.data.documents).forEach(key => {
                if (res.data.documents[key]) {
                  // Les documents du backend sont des chemins (strings)
                  // On les garde en mémoire avec un marker spécial
                  updated[key] = {
                    ...updated[key],
                    uploadedPath: res.data.documents[key],
                    file: null // Le fichier ne peut pas être re-uploaded depuis le browser
                  };
                }
              });
              return updated;
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // Charger les agences quand le dialog s'ouvre
  useEffect(() => {
    if (openAgenciesDialog && agencies.length === 0) {
      fetchAgencies();
    }
  }, [openAgenciesDialog]);

  const fetchAgencies = async () => {
    try {
      setLoadingAgencies(true);
      const res = await axios.get(`${API_BASE_URL}/tenants/agencies`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAgencies(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement agences:', err);
      showNotify('Impossible de charger les agences', 'error');
    } finally {
      setLoadingAgencies(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const showNotify = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotify('Le fichier est trop volumineux (max 5Mo)', 'error');
        return;
      }
      setDocuments(prev => ({
        ...prev,
        [key]: { ...prev[key], file: file }
      }));
      showNotify(`Fichier "${file.name}" ajouté au dossier`, 'info');
    }
  };

  const removeFile = async (key) => {
    const fileName = documents[key].file?.name || documents[key].uploadedPath?.split('/').pop();
    
    // Afficher une alerte de confirmation
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le document "${fileName}" ?`);
    
    if (!confirmed) return; // Si l'utilisateur annule, ne rien faire
    
    // Si c'est un fichier uploadé (uploadedPath), supprimer du backend
    if (documents[key].uploadedPath) {
      try {
        await axios.delete(
          `${API_BASE_URL}/tenants/delete-doc/${key}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        showNotify(`Le document "${fileName}" a été supprimé avec succès`, 'success');
      } catch (err) {
        console.error("Erreur suppression:", err);
        showNotify(`Erreur lors de la suppression`, 'error');
        return;
      }
    } else {
      showNotify(`Le document "${fileName}" a été supprimé avec succès`, 'success');
    }
    
    setDocuments(prev => ({
      ...prev,
      [key]: { ...prev[key], file: null, uploadedPath: null }
    }));
  };

  const handleUploadAll = async () => {
    // Validation : statut professionnel requis
    if (!applicantProfile.professionalStatus) {
      showNotify('Veuillez sélectionner votre situation professionnelle', 'warning');
      return;
    }

    // Validation : au moins la pièce d'identité requise
    if (!documents.identityCard.file && !documents.identityCard.uploadedPath) {
      showNotify('La pièce d\'identité est obligatoire', 'warning');
      return;
    }

    // Validation : au moins une agence sélectionnée
    if (selectedAgencies.length === 0) {
      showNotify('Veuillez sélectionner au moins une agence', 'warning');
      return;
    }

    // ALERTE DE DÉBUT
    showNotify('Préparation et envoi de votre dossier en cours...', 'info');
    setUploading(true);
    
    try {
      const token = localStorage.getItem('token');

      // ÉTAPE 1 : Envoyer les infos de profil (JSON)
      await axios.put(`${API_BASE_URL}/tenants/profile`, {
        professionalStatus: applicantProfile.professionalStatus,
        hasGuarantee: applicantProfile.hasGuarantee,
        guaranteeDetails: applicantProfile.guaranteeDetails
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // ÉTAPE 2 : Envoyer les documents (FormData)
      const formData = new FormData();
      let hasFilesToUpload = false;

      // Ajouter tous les documents avec .file (en attente d'envoi)
      // Les documents avec .uploadedPath sont déjà sur le backend
      Object.keys(documents).forEach(key => {
        if (documents[key].file) {
          formData.append(key, documents[key].file);
          hasFilesToUpload = true;
        }
      });

      // Si des documents à envoyer, les envoyer
      if (hasFilesToUpload) {
        const response = await axios.post(
          `${API_BASE_URL}/tenants/upload-docs`, 
          formData, 
          {
            headers: { 
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}` 
            }
          }
        );

        // Mettre à jour la complétude (Étape 8)
        if (response.data.completionPercentage !== undefined) {
          setCompletion(response.data.completionPercentage);
        }

        // Recharger les documents depuis le backend
        const refreshRes = await axios.get(`${API_BASE_URL}/tenants/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (refreshRes.data?.documents) {
          setDocuments(prev => {
            const updated = { ...prev };
            Object.keys(refreshRes.data.documents).forEach(key => {
              if (refreshRes.data.documents[key]) {
                updated[key] = {
                  ...updated[key],
                  uploadedPath: refreshRes.data.documents[key],
                  file: null
                };
              }
            });
            return updated;
          });
        }
      }

      // ÉTAPE 3 : Envoyer le dossier aux agences sélectionnées
      await axios.post(
        `${API_BASE_URL}/tenants/submit-dossier`,
        {
          agencyIds: selectedAgencies
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotify(`Dossier envoyé à ${selectedAgencies.length} agence(s)! Complétude: ${completion}%`, 'success');
      setOpenAgenciesDialog(false);
      setSelectedAgencies([]);
    } catch (err) {
      console.error("Erreur détaillée :", err.response?.data);
      showNotify(err.response?.data?.message || "Erreur lors de l'envoi du dossier.", 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleAgency = (agencyId) => {
    setSelectedAgencies(prev => 
      prev.includes(agencyId) 
        ? prev.filter(id => id !== agencyId)
        : [...prev, agencyId]
    );
  };

  const handleSendDossierToAgencies = async () => {
    if (selectedAgencies.length === 0) {
      showNotify('Sélectionnez au moins une agence', 'warning');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      
      const res = await axios.post(
        `${API_BASE_URL}/tenants/submit-dossier`,
        {
          agencyIds: selectedAgencies
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotify(` Dossier envoyé à ${selectedAgencies.length} agence(s)!`, 'success');
      setOpenAgenciesDialog(false);
      setSelectedAgencies([]);
    } catch (err) {
      console.error('Erreur envoi dossier:', err);
      showNotify(err.response?.data?.message || 'Erreur lors de l\'envoi', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#0a1930" gutterBottom>
          Mon Dossier Locataire Complet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complétez votre profil et uploadez vos documents au format PDF ou JPG (Max 5Mo par fichier).
        </Typography>
      </Box>


      {/* SECTION 1 : SITUATION PROFESSIONNELLE ET GARANT */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: '12px', 
          border: '2px solid #0a1930',
          bgcolor: '#f5f7fa'
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#0a1930" gutterBottom sx={{ mb: 3 }}>
           Situation Professionnelle et Garant
        </Typography>

        <Grid container spacing={3}>
          {/* Situation professionnelle */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Situation professionnelle *</InputLabel>
              <Select
                value={applicantProfile.professionalStatus}
                onChange={(e) => setApplicantProfile({ ...applicantProfile, professionalStatus: e.target.value })}
                label="Situation professionnelle *"
              >
                <MenuItem value="">-- Sélectionner --</MenuItem>
                <MenuItem value="Étudiant(e)">Étudiant(e)</MenuItem>
                <MenuItem value="Salarié(e)">Salarié(e)</MenuItem>
                <MenuItem value="Indépendant(e)">Indépendant(e)</MenuItem>
                <MenuItem value="Demandeur d'emploi">Demandeur d'emploi</MenuItem>
                <MenuItem value="Autre">Autre</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Garant */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={applicantProfile.hasGuarantee}
                  onChange={(e) => setApplicantProfile({ ...applicantProfile, hasGuarantee: e.target.checked })}
                />
              }
              label="J'ai un garant"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Si non : nous travaillons avec un partenaire garant
            </Typography>
          </Grid>

          {/* Détails garant si oui */}
          {applicantProfile.hasGuarantee && (
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Détails du garant</InputLabel>
                <Select
                  value={applicantProfile.guaranteeDetails}
                  onChange={(e) => setApplicantProfile({ ...applicantProfile, guaranteeDetails: e.target.value })}
                  label="Détails du garant"
                >
                  <MenuItem value="">-- Sélectionner --</MenuItem>
                  <MenuItem value="Parent">Parent</MenuItem>
                  <MenuItem value="Ami">Ami</MenuItem>
                  <MenuItem value="Employeur">Employeur</MenuItem>
                  <MenuItem value="Autre">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* SECTION 2 : DOCUMENTS ORGANISÉS PAR CATÉGORIE */}
      <Box>
        {/* Titre général des documents */}
        <Typography variant="h6" fontWeight="bold" color="#0a1930" sx={{ mb: 3 }}>
       Pièces nécessaires pour constituer un dossier locatif complet
        </Typography>

        {/* Grouper par section */}
        {['Identité', 'Revenus', 'Logement', 'Domicile'].map((section) => (
          <Box key={section} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="#0a1930" sx={{ mb: 2, pl: 1, borderLeft: '4px solid #0a1930' }}>
              {section === 'Identité' && ' Pièce d\'identité'}
              {section === 'Revenus' && ' Justificatifs de revenus'}
              {section === 'Logement' && ' Situation actuelle de logement'}
              {section === 'Domicile' && ' Justificatif de domicile'}
            </Typography>

            <Grid container spacing={2}>
              {Object.keys(documents)
                .filter(key => documents[key].section === section)
                .map((key) => (
                  <Grid size={{ xs: 12 }} key={key}> 
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderRadius: '12px',
                        borderColor: documents[key].file ? '#4caf50' : '#e0e0e0',
                        bgcolor: documents[key].file ? '#fafffa' : '#fff',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                        <Box sx={{ 
                          bgcolor: documents[key].file ? '#e8f5e9' : '#f5f5f5', 
                          p: 1.5, 
                          borderRadius: '10px',
                          display: 'flex' 
                        }}>
                          {documents[key].file || documents[key].uploadedPath ? 
                            <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 32 }} /> : 
                            <InsertDriveFileIcon sx={{ color: '#607d8b', fontSize: 32 }} />
                          }
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0a1930' }}>
                            {documents[key].label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {documents[key].description}
                          </Typography>
                          {documents[key].file && (
                            <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: '500', mt: 0.5 }}>
                              ✓ Prêt à envoyer: {documents[key].file.name}
                            </Typography>
                          )}
                          {documents[key].uploadedPath && !documents[key].file && (
                            <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: '500', mt: 0.5 }}>
                              ✓ Uploadé avec succès
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box>
                        {!documents[key].file && !documents[key].uploadedPath ? (
                          <Button
                            variant="contained"
                            component="label" 
                            startIcon={<CloudUploadIcon />}
                            sx={{ 
                              bgcolor: '#0a1930', 
                              textTransform: 'none',
                              borderRadius: '8px',
                              px: 2,
                              whiteSpace: 'nowrap',
                              '&:hover': { bgcolor: '#1a2940' } 
                            }}
                          >
                            Uploader
                            <input 
                              type="file" 
                              hidden={true}
                              onChange={(e) => handleFileChange(e, key)} 
                              accept=".pdf,image/*" 
                            />
                          </Button>
                        ) : (
                          <IconButton 
                            onClick={() => removeFile(key)} 
                            disabled={uploading}
                            sx={{ 
                              color: '#d32f2f', 
                              bgcolor: '#ffebee',
                              '&:hover': { bgcolor: '#ffcdd2' } 
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          </Box>
        ))}
      </Box>

      {uploading && <LinearProgress sx={{ mt: 4, borderRadius: 2 }} />}

      {/* SECTION 3 : ENVOYER LE DOSSIER AUX AGENCES */}
      <Paper 
        sx={{ 
          p: 4, 
          mt: 5, 
          mb: 5, 
          borderRadius: '12px', 
          border: '2px solid #2196f3',
          bgcolor: '#e3f2fd'
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#0a1930" gutterBottom sx={{ mb: 2 }}>
          Envoyer votre dossier à des agences
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Une fois votre dossier complété, vous pouvez l'envoyer directement aux agences de votre choix. Elles pourront examiner votre profil et vous contacter pour des opportunités.
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setOpenAgenciesDialog(true)}
          disabled={completion < 100}
          sx={{
            bgcolor: '#2196f3',
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': { bgcolor: '#1976d2' },
            '&:disabled': { bgcolor: '#e0e0e0' }
          }}
        >
          Sélectionner des agences
        </Button>
        
        {completion < 100 && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 2 }}>
            Votre dossier doit être à 100% pour envoyer aux agences
          </Typography>
        )}
      </Paper>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          size="large"
          onClick={handleUploadAll}
          disabled={uploading || (!documents.identityCard.file && !documents.identityCard.uploadedPath)}
          sx={{ 
            bgcolor: '#0a1930', 
            px: 10, 
            py: 2, 
            fontWeight: 'bold',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            '&:hover': { bgcolor: '#1a2940' },
            '&:disabled': { bgcolor: '#e0e0e0' }
          }}
        >
          {uploading ? 'Envoi en cours...' : 'Valider et envoyer mon dossier complet'}
        </Button>
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: '8px' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* DIALOG SÉLECTION DES AGENCES */}
      <Dialog open={openAgenciesDialog} onClose={() => setOpenAgenciesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#2196f3', color: 'white' }}>
           Envoyer votre dossier aux agences
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {loadingAgencies ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <Typography>Chargement des agences...</Typography>
            </Box>
          ) : agencies.length === 0 ? (
            <Alert severity="info">Aucune agence disponible pour le moment</Alert>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sélectionnez une ou plusieurs agences pour envoyer votre dossier complet:
              </Typography>
              
              {agencies.map(agency => (
                <FormControlLabel
                  key={agency._id}
                  control={
                    <Checkbox
                      checked={selectedAgencies.includes(agency._id)}
                      onChange={() => handleToggleAgency(agency._id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        {agency.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {agency.email}
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}
                />
              ))}

              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
                <Button
                  onClick={handleSendDossierToAgencies}
                  variant="contained"
                  disabled={selectedAgencies.length === 0 || uploading}
                  fullWidth
                  sx={{
                    bgcolor: '#0a1930',
                    py: 2,
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    '&:hover': { bgcolor: '#1a2940' },
                    '&:disabled': { bgcolor: '#e0e0e0' }
                  }}
                >
                  {uploading ? 'Envoi en cours...' : 'VALIDER ET ENVOYER MON DOSSIER COMPLET'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default DocumentsPage;