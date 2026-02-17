import { Container, Grid, Typography, Box } from '@mui/material';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';


const mockProperties = [
  { id: 1, title: 'Appartement Moderne', price: 1200, location: 'Tunis', rooms: 3, type: 'Appartement' },
  { id: 2, title: 'Villa avec Jardin', price: 2500, location: 'Hammamet', rooms: 5, type: 'Maison' },
  { id: 3, title: 'Studio Centre Ville', price: 600, location: 'Sousse', rooms: 1, type: 'Studio' },
];

const Home = () => {
  return (
    <Box>
      {/* Hero Section avec Background */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, textAlign: 'center' }}>
        <Container>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Trouvez votre futur foyer
          </Typography>
          <Typography variant="h6">
            Des milliers d'annonces vérifiées par nos agences partenaires
          </Typography>
        </Container>
      </Box>

      <Container sx={{ mb: 8 }}>
        {/* Barre de recherche avec filtres */}
        <SearchBar />

        <Typography variant="h4" sx={{ mt: 6, mb: 4, fontWeight: 'medium' }}>
          Propriétés récentes
        </Typography>

        {/* Grille de cartes responsive */}
        <Grid container spacing={4}>
          {mockProperties.map((property) => (
            <Grid item key={property.id} xs={12} sm={6} md={4}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;