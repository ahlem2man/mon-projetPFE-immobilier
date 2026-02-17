import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

const PropertyCard = ({ property }) => (
  <Card sx={{ maxWidth: 345, borderRadius: 2, transition: '0.3s', '&:hover': { boxShadow: 10 } }}>
    <CardMedia 
      component="img" 
      height="200" 
      image="https://images.unsplash.com/photo-1568605114967-8130f3a36994" 
      alt="propriété" 
    />
    <CardContent>
      <Typography variant="h6" gutterBottom>{property.title}</Typography>
      <Typography variant="body2" color="text.secondary">{property.location}</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="h6" color="primary">{property.price} DT</Typography>
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>{property.rooms} Pièces</Typography>
      </Box>
    </CardContent>
  </Card>
);

export default PropertyCard; 