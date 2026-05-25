import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Card, CardMedia, CardContent, Typography, 
  Button, Chip, Divider, Skeleton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';

const DocumentVerification = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState('');
  const token = localStorage.getItem('token');

  const fetchDocs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/documents/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs(res.data.data);
    } catch (err) { 
      console.error('Erreur:', err); 
    }
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchDocs(); 
  }, []);

  useEffect(() => {
    console.log('Documents chargés:', docs);
  }, [docs]);

  const getDocumentTypeLabel = (type) => {
    const types = {
      'AGENCY_LICENSE': 'Licence Immobiliere',
      'IDENTITY_CARD': 'Piece d\'identite',
      'REVENUE_PROOF': 'Justificatif de revenus',
      'WORK_CONTRACT': 'Contrat de travail',
      'OTHER': 'Autre document'
    };
    return types[type] || type;
  };

  const getFileExtension = (fileUrl) => {
    if (!fileUrl) return '';
    return fileUrl.split('.').pop().toLowerCase();
  };

  const isPdf = (fileUrl) => {
    return getFileExtension(fileUrl) === 'pdf';
  };

  const isImage = (fileUrl) => {
    const ext = getFileExtension(fileUrl);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const handleDownload = (doc) => {
    // Ouvrir le fichier dans une nouvelle fenêtre
    window.open(`http://localhost:5000${doc.fileUrl}`, '_blank');
  };

  const handleOpenDialog = (doc, type) => {
    setSelectedDoc(doc);
    setActionType(type);
    setAdminNotes('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDoc(null);
    setAdminNotes('');
    setActionType('');
  };

  const handleVerify = async () => {
    try {
      const status = actionType === 'approve' ? 'validé' : 'rejeté';
      await axios.patch(
        `http://localhost:5000/api/admin/documents/${selectedDoc._id}/verify`, 
        { status, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCloseDialog();
      await fetchDocs();
    } catch (err) { 
      alert('Erreur: ' + err.message); 
    }
  };

  if (loading) return <Skeleton variant="rectangular" height={400} />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Documents en attente de validation
        </Typography>
        <Chip 
          label={`${docs.length} document(s)`} 
          color={docs.length > 0 ? 'warning' : 'success'}
          variant="outlined"
        />
      </Box>

      {docs.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography color="text.secondary">
            Aucun document a verifier pour le moment.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {docs.map((doc) => (
            <Grid sx={{ width: { xs: '100%', md: '50%' } }} key={doc._id}>
              <Card sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: 2,
                '&:hover': { boxShadow: 4 }
              }}>
                {isImage(doc.fileUrl) ? (
                  <CardMedia
                    component="img"
                    sx={{ 
                      height: 200, 
                      objectFit: 'cover', 
                      cursor: 'pointer',
                      backgroundColor: '#f5f5f5'
                    }}
                    image={`http://localhost:5000${doc.fileUrl}`}
                    alt={doc.type}
                    onClick={() => handleDownload(doc)}
                  />
                ) : (
                  <Box sx={{ 
                    height: 200, 
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: 1
                  }} onClick={() => handleDownload(doc)}>
                    {isPdf(doc.fileUrl) ? (
                      <PictureAsPdfIcon sx={{ fontSize: 80, color: '#d32f2f' }} />
                    ) : (
                      <ImageIcon sx={{ fontSize: 80, color: '#999' }} />
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {isPdf(doc.fileUrl) ? 'Fichier PDF' : 'Document'}
                    </Typography>
                  </Box>
                )}
                
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {getDocumentTypeLabel(doc.type)}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>Proprietaire :</strong> {doc.ownerId?.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>Email :</strong> {doc.ownerId?.email}
                    </Typography>
                    <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Role :</strong>
                      </Typography>
                      <Chip 
                        label={doc.ownerId?.role === 'agency' ? 'Agence' : 'Locataire'} 
                        size="small"
                        color={doc.ownerId?.role === 'agency' ? 'primary' : 'default'}
                      />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      Soumis le : {new Date(doc.createdAt).toLocaleString('fr-FR')}
                    </Typography>
                  </Box>
                </CardContent>

                <Divider />

                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  gap: 1, 
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap'
                }}>
                  <Button 
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(doc)}
                  >
                    Telecharger
                  </Button>
                  <Button 
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircleIcon />} 
                    color="success" 
                    onClick={() => handleOpenDialog(doc, 'approve')}
                  >
                    Approuver
                  </Button>
                  <Button 
                    size="small"
                    variant="contained"
                    startIcon={<CancelIcon />} 
                    color="error"
                    onClick={() => handleOpenDialog(doc, 'reject')}
                  >
                    Rejeter
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approuver le document' : 'Rejeter le document'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedDoc && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Type :</strong> {getDocumentTypeLabel(selectedDoc.type)} <br />
                <strong>Proprietaire :</strong> {selectedDoc.ownerId?.fullName}
              </Typography>
              {actionType === 'reject' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Raison du rejet..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  label="Notes"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            Annuler
          </Button>
          <Button 
            onClick={handleVerify} 
            variant="contained" 
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            {actionType === 'approve' ? 'Approuver' : 'Rejeter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentVerification;
