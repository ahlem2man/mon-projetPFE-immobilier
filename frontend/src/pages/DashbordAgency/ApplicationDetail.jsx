import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Divider, Button, TextField,
  List, ListItem, ListItemText, ListItemIcon, Chip, Avatar, Modal, CircularProgress
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import EuroIcon from '@mui/icons-material/Euro';
import HistoryIcon from '@mui/icons-material/History';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningIcon from '@mui/icons-material/Warning';
import BusinessIcon from '@mui/icons-material/Business';
import NoteIcon from '@mui/icons-material/Note';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [note, setNote] = useState("");
  const [openDoc, setOpenDoc] = useState(null); // Pour le visualiseur
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/requests/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ Candidature chargée:", res.data);
        setApp(res.data.data);
      } catch (err) {
        console.error("❌ Erreur fetch:", err);
        alert("Erreur de chargement: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, token]);

  // Point 8 : Ajouter une note (SANS changer le statut)
  const handleAddNote = async () => {
    if (!note.trim()) {
      alert('Veuillez entrer une note');
      return;
    }

    try {
      setActionLoading(true);
      // Envoyer la note SANS changer de statut (on ne passe pas 'status')
      await axios.patch(`${API_BASE_URL}/requests/${id}`, 
        { 
          internalNote: note  // SEULEMENT la note, pas de changement de statut
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert('✅ Note enregistrée !');
      // Recharger les données
      const res = await axios.get(`${API_BASE_URL}/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApp(res.data.data);
      setNote(''); // Vider le champ
    } catch (err) {
      console.error("❌ Erreur:", err);
      alert("Erreur: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Point 7 : Changer le statut de la candidature
  const handleAction = async (newStatus) => {
    try {
      setActionLoading(true);
      await axios.patch(`${API_BASE_URL}/requests/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert(`✅ Statut changé en: ${newStatus}`);
      // Recharger les données
      const res = await axios.get(`${API_BASE_URL}/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApp(res.data.data);
    } catch (err) {
      console.error("❌ Erreur:", err);
      alert("Erreur: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: 2 }}>
      <CircularProgress />
      <Typography variant="h6">Chargement des détails...</Typography>
    </Box>
  );

  if (!app) return <Typography color="error" sx={{ p: 4 }}>Erreur: Candidature non trouvée</Typography>;

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Détails de la Candidature</Typography>
      
      <Grid container spacing={3}>
        {/* Colonne Gauche : Infos Locataire & Message */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#1A237E', mr: 2 }}><PersonIcon /></Avatar>
              <Box>
                <Typography variant="h6">{app.tenantId?.fullName}</Typography>
                <Typography variant="body2" color="textSecondary">{app.tenantId?.email} • {app.tenantId?.phone}</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Message du locataire :</Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic', bgcolor: '#f9f9f9', p: 2, borderRadius: 2 }}>
              "{app.message || "Aucun message fourni"}"
            </Typography>
          </Paper>

          {/* Point 6 : Visualiseur de Documents */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon /> Pièces Justificatives
            </Typography>
            {app.documents && app.documents.length > 0 ? (
              <List>
                {app.documents.map((doc, index) => {
                  // ✨ Corriger le chemin URL en ajoutant le slash s'il manque
                  const docUrl = doc.url.startsWith('/') ? `${API_BASE_URL}${doc.url}` : `${API_BASE_URL}/${doc.url}`;
                  return (
                    <ListItem 
                      key={index} 
                      button 
                      onClick={() => setOpenDoc(docUrl)}
                      sx={{ border: '1px solid #eee', borderRadius: 2, mb: 1, bgcolor: '#f5f5f5' }}
                    >
                      <ListItemIcon><DescriptionIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={doc.name || `Document ${index + 1}`} 
                        secondary="Cliquer pour prévisualiser" 
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ p: 2, bgcolor: '#fff3cd', borderRadius: 2, border: '1px solid #ffc107', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <WarningIcon sx={{ color: '#856404', mt: 0.5, flexShrink: 0 }} />
                <Typography variant="body2" color="warning.dark">
                  Aucune pièce justificative fournie par le locataire
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Cliquez sur "Demander plus d'infos" pour demander les documents nécessaires
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Informations d'emploi du locataire */}
          <Paper sx={{ p: 3, borderRadius: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon /> Situation Professionnelle
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 150 }}>Statut emploi:</Typography>
              <Chip 
                label={app.employmentStatus || "Non spécifié"} 
                variant="outlined" 
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            <Divider sx={{ my: 1 }} />
          </Paper>

          {/* ✨ NOUVEAU: Historique des changements de statut */}
          <Paper sx={{ p: 3, borderRadius: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon /> Historique de la candidature
            </Typography>
            {app.statusHistory && app.statusHistory.length > 0 ? (
              <Box>
                {app.statusHistory.map((history, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      pb: 2,
                      borderBottom: index !== app.statusHistory.length - 1 ? '1px solid #eee' : 'none'
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <HistoryIcon sx={{ color: '#1A237E', fontSize: 20 }} />
                      {index !== app.statusHistory.length - 1 && (
                        <Box sx={{ width: 2, height: 30, bgcolor: '#e0e0e0', mt: 0.5 }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Chip 
                        label={history.status} 
                        size="small" 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption" display="block" color="textSecondary">
                        {new Date(history.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                      {history.comment && (
                        <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: '#666' }}>
                          {history.comment}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Pas d'historique disponible
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Colonne Droite : Score & Actions */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#fcfcfc', border: '1px solid #ddd' }}>
            <Typography variant="h6" gutterBottom>Analyse Financière</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EuroIcon sx={{ mr: 1, color: 'green' }} />
              <Typography>Revenus : <b>{app.monthlyIncome || 'N/C'} TND / mois</b></Typography>
            </Box>
            <Chip label={app.status} color="primary" variant="outlined" sx={{ mt: 1 }} />
          </Paper>

          {/* Point 8 : Notes Internes - AVEC HISTORIQUE */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NoteIcon /> Notes de l'agence (privé)
            </Typography>
            
            {/* Historique des notes */}
            {app.internalNotes && app.internalNotes.length > 0 && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 2, maxHeight: 200, overflowY: 'auto', border: '1px solid #eee' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1A237E' }}>
                  Historique ({app.internalNotes.length})
                </Typography>
                {app.internalNotes.map((n, idx) => (
                  <Box key={idx} sx={{ mb: 2, pb: 1, borderBottom: idx !== app.internalNotes.length - 1 ? '1px solid #ddd' : 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#0a1930' }}>
                        Agence
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(n.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: '#555' }}>
                      "{n.content}"
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Champ pour ajouter une nouvelle note */}
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Ajouter une observation sur ce profil..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            {/* Bouton pour envoyer la note SEULE */}
            <Button 
              fullWidth 
              variant="contained" 
              color="info"
              startIcon={<SaveIcon />}
              onClick={handleAddNote}
              disabled={actionLoading || !note.trim()}
              sx={{ mb: 2, textTransform: 'none' }}
            >
              Enregistrer cette note
            </Button>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Point 7 : Boutons d'Action */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="contained" color="success" onClick={() => handleAction('Acceptée')} disabled={actionLoading}>
                Approuver le dossier
              </Button>
              <Button variant="contained" color="warning" onClick={() => handleAction('Infos requises')} disabled={actionLoading}>
                Demander plus d'infos
              </Button>
              <Button variant="outlined" color="error" onClick={() => handleAction('Refusée')} disabled={actionLoading}>
                Refuser la candidature
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* MODAL DU VISUALISEUR (Point 6) */}
      <Modal open={!!openDoc} onClose={() => setOpenDoc(null)}>
        <Box sx={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '80%', height: '80%', bgcolor: 'background.paper', boxShadow: 24, p: 2 
        }}>
          <iframe src={openDoc} width="100%" height="100%" title="Visualiseur" />
        </Box>
      </Modal>
    </Box>
  );
};

export default ApplicationDetail;