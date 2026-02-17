import { Box, Container, Typography } from '@mui/material';

const Footer = () => (
  <Box sx={{ bgcolor: 'grey.200', py: 4, mt: 'auto' }}>
    <Container>
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()} ImmoAhlem. Tous droits réservés.
      </Typography>
    </Container>
  </Box>
);

export default Footer;