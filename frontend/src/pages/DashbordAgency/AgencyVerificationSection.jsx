import React, { useState, useContext } from 'react';
import { 
  Box, Typography, Button, Card, Stack, 
  MenuItem, TextField, LinearProgress, Alert 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const AgencyVerificationSection = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('Kbis');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', msg: '' }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus(null);

    // Récupérer le token
    const token = localStorage.getItem('token');

    // Créer FormData pour l'envoi du fichier
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);

    try {
      await axios.post('http://localhost:5000/api/agency/upload-docs', 
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      setStatus({ type: 'success', msg: `${docType} téléchargé avec succès. Votre profil est en attente de validation.` });
      setFile(null);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Erreur lors de l\'envoi du document.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card sx={{ p: 3, mt: 3, border: '1px dashed #3F51B5', bgcolor: '#f8f9ff' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Vérification de l'identité professionnelle
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Veuillez fournir vos documents officiels pour activer la publication d'annonces.
      </Typography>

      {status && <Alert severity={status.type} sx={{ mb: 2 }}>{status.msg}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <TextField
          select
          label="Type de document"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="Kbis">Extrait Kbis (moins de 3 mois)</MenuItem>
          <MenuItem value="CartePro">Carte Professionnelle (T ou G)</MenuItem>
          <MenuItem value="Assurance">Attestation Assurance RCP</MenuItem>
        </TextField>

        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          sx={{ height: 56 }}
        >
          {file ? file.name : "Choisir un fichier"}
          <input type="file" hidden onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
        </Button>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          sx={{ height: 56, px: 4, bgcolor: '#3F51B5' }}
        >
          {uploading ? "Envoi..." : "Envoyer"}
        </Button>
      </Stack>

      {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />}
    </Card>
  );
};

export default AgencyVerificationSection;