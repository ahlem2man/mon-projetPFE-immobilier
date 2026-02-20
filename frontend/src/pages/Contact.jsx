import { Container, Box, Typography, TextField, Button, Grid, Stack } from '@mui/material';
import { useState } from 'react';
import logoHoma from '../assets/logo-homa.avif'; 

export default function Contact() {
  const [formData, setFormData] = useState({
    prenom: '',
    email: '',
    criteria: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Merci pour votre demande ! Nous vous recontacterons très bientôt.');
    setFormData({ prenom: '', email: '', criteria: '', phone: '' });
  };

  return (
    /* Conteneur principal pour centrer verticalement et horizontalement */
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', // Centrage vertical
        alignItems: 'center',     // Centrage horizontal
        bgcolor: '#fff',          // Couleur de fond de page
        py: 8                     // Padding pour éviter que ça colle aux bords sur mobile
      }}
    >
      <Container maxWidth="lg">
        
        {/* SECTION EN-TÊTE (HERO) - Centrée par défaut avec textAlign */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: '700', color: '#1a1a1a', mb: 2, fontFamily: 'serif' }}>
            Contactez-nous pour votre mobilité en France
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
            Nous sommes là pour vous aider à trouver votre logement.
          </Typography>
        </Box>

        {/* SECTION FORMULAIRE + LOGO */}
        <Grid 
          container 
          sx={{ 
            borderRadius: 6, 
            overflow: 'hidden', 
            bgcolor: 'white',
            boxShadow: '0px 15px 50px rgba(0,0,0,0.08)', // Ajout d'une ombre pour faire ressortir le bloc centré
            mb: 10
          }}
        >
          {/* GAUCHE : FORMULAIRE */}
          <Grid item xs={12} md={7}>
            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ 
                bgcolor: '#f0f2f5', 
                p: { xs: 4, md: 8 }, // Augmentation du padding pour plus d'espace
                borderRadius: { xs: 0, md: '0 0 0 0' } // Ajustement des arrondis si besoin
              }}
            >
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: '600', mb: 1, color: '#333' }}>Votre prénom</Typography>
                  <TextField
                    fullWidth
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Entrez votre prénom ici"
                    sx={{ bgcolor: 'white', borderRadius: 2, '& fieldset': { border: 'none' } }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: '600', mb: 1, color: '#333' }}>Votre adresse email*</Typography>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Entrez votre email ici"
                    sx={{ bgcolor: 'white', borderRadius: 2, '& fieldset': { border: 'none' } }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: '600', mb: 1, color: '#333' }}>Votre message*</Typography>
                  <TextField
                    fullWidth
                    name="criteria"
                    value={formData.criteria}
                    onChange={handleChange}
                    required
                    placeholder="Écrivez votre message ici"
                    multiline
                    rows={4}
                    sx={{ bgcolor: 'white', borderRadius: 2, '& fieldset': { border: 'none' } }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: '600', mb: 1, color: '#333' }}>Numéro de téléphone</Typography>
                  <TextField
                    fullWidth
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Entrez votre numéro de téléphone ici"
                    sx={{ bgcolor: 'white', borderRadius: 2, '& fieldset': { border: 'none' } }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: '#0a1930',
                    color: '#fff',
                    borderRadius: '50px',
                    py: 2,
                    px: 6,
                    width: 'fit-content',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1rem',
                    alignSelf: { xs: 'stretch', sm: 'flex-start' }, // Bouton large sur mobile, normal sur PC
                    '&:hover': { backgroundColor: '#1a252f' }
                  }}
                >
                  Envoyer votre demande
                </Button>
              </Stack>
            </Box>
          </Grid>

          {/* DROITE : LOGO HOMA */}
          <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 6, bgcolor: 'white' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box 
                component="img"
                src={logoHoma} 
                alt="HOMA Logo"
                sx={{ width: '100%', maxWidth: '300px', objectFit: 'contain', mb: 2 }}
              />
              
            </Box>
          </Grid>
        </Grid>

        {/* SECTION INFOS & CARTE */}
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={5}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Contactez-nous</Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>Whatsapp</Typography>
                <Typography variant="h6" sx={{ color: '#00adef', fontWeight: '400' }}>+33 6 11 61 05 95</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>Téléphone</Typography>
                <Typography variant="h6" sx={{ color: '#00adef', fontWeight: '400' }}>+33 9 80 80 57 75</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>Mail</Typography>
                <Typography variant="h6" sx={{ color: '#00adef', fontWeight: '400' }}>hello@ho-ma.fr</Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box sx={{ borderRadius: 6, overflow: 'hidden', height: '450px', boxShadow: '0px 10px 30px rgba(0,0,0,0.1)' }}>
              <iframe
                title="Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.292292615674389!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca97e141270!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1647444315203!5m2!1sfr!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}