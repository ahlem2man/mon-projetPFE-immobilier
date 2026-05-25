import { Container, Box, Typography, Grid, Card, CardContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function About() {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 4, pt: 6, pb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#1a237e' }}>
          À propos de HOMA
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          Votre agence spécialisée dans l'organisation du parcours locatif
        </Typography>
      </Box>

      {/* Mission Section */}
      <Box sx={{ textAlign: 'center', mb: 4, bgcolor: '#f5f5f5', py: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1a237e' }}>
            Notre Mission
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', maxWidth: '600px', mx: 'auto' }}>
            Nous sommes HOMA. Votre agence spécialisée dans l'organisation du parcours locatif en France. 
            Notre mission est simple : Faire le match parfait entre vous et votre propriétaire.
          </Typography>
        </Container>
      </Box>

      {/* Services Section with Blue Background */}
      <Box sx={{ bgcolor: '#00bcd4', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: 'white', textAlign: 'center', mb: 4, fontSize: '16px', fontWeight: 500 }}>
            Nous trouvons votre logement idéal, à vous de choisir le pack adapté.
          </Typography>

          <Grid container spacing={3}>
            {/* Pack Essentiel */}
            <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                    Pack Essentiel
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2, fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                    Pour les clients autonomes qui veulent un bon coup de pouce
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#666', mb: 2, fontSize: '0.85rem', lineHeight: 1.6 }}>
                    Vous avez repéré des annonces, mais vous manquez de temps ou de retours positifs ? Nous prenons le relais pour donner à votre dossier la force qu'il mérite.
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    Avec ce pack, vous nous transmettez les logements qui vous intéressent, et nous intervenons directement auprès des agences immobilières et des propriétaires. Grâce à notre expertise du marché et à une approche proactive, nous mettons en avant votre profil, valorisons votre dossier et négocions les conditions pour vous permettre d'accéder plus facilement au logement convoité.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Pack Confort */}
            <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                    Pack Confort
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2, fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                    La relocation clé en main : vous arrivez, tout est prêt
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#666', mb: 2, fontSize: '0.85rem', lineHeight: 1.6 }}>
                    Vous souhaitez gagner du temps et élargir vos opportunités ? Ce pack combine efficacité, réseau et accompagnement sur le terrain.
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    En plus de l'appui stratégique du Pack 1, nous vous proposons des logements ciblés via notre réseau de partenaires de confiance. Notre expertise nous permet de vous orienter vers des biens adaptés à votre profil et à vos critères. Ce pack comprend jusqu'à <strong>5 visites organisées</strong>, en présentiel ou à distance, selon vos disponibilités.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Pack Premium */}
            <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                    Pack Premium
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2, fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                    Votre logement clé en main avec accompagnement personnalisé
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#666', mb: 2, fontSize: '0.85rem', lineHeight: 1.6 }}>
                    Vous recherchez un accompagnement intensif et entièrement personnalisé ? Ce pack est conçu pour ceux qui veulent être guidés à chaque étape, en toute sérénité.
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    En plus des services inclus dans les Packs 1 et 2, vous bénéficiez d'un suivi renforcé et d'un interlocuteur dédié qui pilote l'ensemble de votre recherche. Nous affinons vos critères, ajustons les candidatures en temps réel, et assurons une coordination continue jusqu'à la signature du bail. Ce pack inclut jusqu'à <strong>10 visites</strong>, avec une prise en charge complète de la logistique.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1a237e', textAlign: 'center' }}>
          Pourquoi choisir HOMA ?
        </Typography>
        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <CheckCircleIcon sx={{ color: '#00bcd4', flexShrink: 0, mt: 0.5 }} /> 
              <span>Nous défendons votre dossier auprès des agences et propriétaires en les contactant directement pour maximiser vos chances</span>
            </Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <CheckCircleIcon sx={{ color: '#00bcd4', flexShrink: 0, mt: 0.5 }} /> 
              <span>Un suivi sur mesure, jusqu'à l'emménagement</span>
            </Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <CheckCircleIcon sx={{ color: '#00bcd4', flexShrink: 0, mt: 0.5 }} /> 
              <span>Logements issus de notre réseau de partenaires</span>
            </Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <CheckCircleIcon sx={{ color: '#00bcd4', flexShrink: 0, mt: 0.5 }} /> 
              <span>Accompagnement renforcé et personnalisé</span>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}