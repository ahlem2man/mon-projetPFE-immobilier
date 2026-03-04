import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Alert, CircularProgress 
} from '@mui/material';
import axios from 'axios';

const ApplyModal = ({ open, handleClose, propertyId, propertyTitle, completionRate }) => {
  // 1. On s'assure que message est TOUJOURS une chaîne (évite l'erreur de ton précédent message)
  const [message, setMessage] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    // 2. Sécurité : on bloque ici si le dossier n'est pas à 100%
    if (completionRate < 100) {
      setError(`Action impossible : Votre dossier est complété à ${completionRate}%. Veuillez atteindre 100% dans votre Dashboard.`);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      // Utilisation du header Authorization (Bearer token)
      await axios.post('http://localhost:5000/api/requests', 
        { propertyId, message },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccess(true);
      
      // On ferme la modal après 2 secondes de succès
      setTimeout(() => {
        handleClose();
        setSuccess(false);
        setMessage("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#0a1930', color: '#fff' }}>
        Postuler pour : {propertyTitle}
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Candidature envoyée avec succès ! L'agence va examiner votre dossier.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              En postulant, votre dossier complet (Profil, Revenus, Documents) sera transmis à l'annonceur.
            </Typography>

            <TextField
              label="Votre message (Optionnel)"
              multiline
              rows={4}
              fullWidth
              placeholder="Ex: Bonjour, je suis très intéressé par ce logement..."
              value={message || ""} // Sécurité anti-warning
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />

            {/* Affiche l'erreur si le dossier est incomplet ou s'il y a un souci serveur */}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            
            {/* Warning préventif si le taux est < 100 */}
            {completionRate < 100 && !error && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Votre dossier est à <strong>{completionRate}%</strong>. Complétez-le pour pouvoir envoyer cette demande.
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            sx={{ 
              bgcolor: '#0a1930',
              '&:hover': { bgcolor: '#1a2940' }
            }}
            disabled={loading} // Le bouton reste cliquable pour déclencher le message d'erreur si < 100%
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmer l'envoi"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ApplyModal;