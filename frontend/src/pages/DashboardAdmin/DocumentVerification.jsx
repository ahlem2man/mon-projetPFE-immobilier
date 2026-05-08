import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Card, CardMedia, CardContent, Typography, 
  Button, Chip, Divider, Skeleton 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const DocumentVerification = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchDocs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/documents/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleVerify = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/documents/${id}/verify`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // Rafraîchir la liste après action
      fetchDocs();
    } catch (err) { alert("Erreur lors de la validation"); }
  };

  if (loading) return <Skeleton variant="rectangular" height={400} />;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Documents en attente de validation ({docs.length})
      </Typography>

      {docs.length === 0 && <Typography>Aucun document à vérifier pour le moment.</Typography>}

      <Grid container spacing={3}>
        {docs.map((doc) => (
          <Grid item xs={12} md={6} key={doc._id}>
            <Card sx={{ display: 'flex', boxShadow: 3 }}>
              {/* Prévisualisation du document */}
              <CardMedia
                component="img"
                sx={{ width: 160, cursor: 'pointer' }}
                image={doc.fileUrl || 'https://via.placeholder.com/150'}
                alt="Justificatif"
                onClick={() => window.open(doc.fileUrl, '_blank')}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {doc.type === 'AGENCY_LICENSE' ? 'Licence Immobilière' : 'Pièce d’identité'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Propriétaire : **{doc.owner?.name}**
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Soumis le : {new Date(doc.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <Divider />
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-around' }}>
                  <Button 
                    startIcon={<CheckCircleIcon />} 
                    color="success" 
                    onClick={() => handleVerify(doc._id, 'verified')}
                  >
                    Approuver
                  </Button>
                  <Button 
                    startIcon={<CancelIcon />} 
                    color="error"
                    onClick={() => handleVerify(doc._id, 'rejected')}
                  >
                    Rejeter
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DocumentVerification;