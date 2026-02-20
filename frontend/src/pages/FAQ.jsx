import { Container, Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQ() {
  const faqs = [
    {
      question: "Comment fonctionnent les services de HOMA?",
      answer: "HOMA vous accompagne dans votre recherche de logement. Nous trouvons votre logement idéal et vous pouvez choisir le pack adapté à vos besoins (Essentiel, Confort ou Premium). Nous défendons votre dossier auprès des agences et propriétaires pour maximiser vos chances d'accéder au logement."
    },
    {
      question: "Qu'est-ce qui inclus dans le Pack Essentiel?",
      answer: "Le Pack Essentiel est destiné aux clients autonomes qui veulent un bon coup de pouce. C'est la base de nos services avec un accompagnement adapté à vos besoins."
    },
    {
      question: "Qu'est-ce qui inclus dans le Pack Confort?",
      answer: "Le Pack Confort offre une relocation clé en main. Vous arrivez, tout est prêt. Ce pack comprend jusqu'à 5 visites, organisées pour vous, et un suivi personnalisé à chaque étape."
    },
    {
      question: "Qu'est-ce qui inclus dans le Pack Premium?",
      answer: "Le Pack Premium est votre logement clé en main avec un accompagnement renforcé et personnalisé. Vous bénéficiez de 10 visites incluses, des échanges réguliers, et un suivi complet jusqu'à l'emménagement."
    },
    {
      question: "Comment puis-je contacter un conseiller HOMA?",
      answer: "Vous pouvez nous contacter via le formulaire de contact disponible sur notre site, ou directement par email à hello@ho-ma.fr ou par téléphone au +33 (0)9 80 80 57 75."
    },
    {
      question: "Combien de temps prend le processus de recherche?",
      answer: "Le délai dépend de vos critères et des disponibilités. Notre équipe travaille pour trouver rapidement le logement idéal adapté à vos besoins, généralement entre 2 à 4 semaines selon le pack choisi."
    },
    {
      question: "Est-ce que vous opérez partout en France?",
      answer: "Oui, nous sommes une agence spécialisée dans l'organisation du parcours locatif en France. Nous opérons sur tout le territoire français avec un réseau de partenaires."
    },
    {
      question: "Quels sont les avantages de faire confiance à HOMA?",
      answer: "HOMA défend votre dossier directement auprès des agences et propriétaires pour maximiser vos chances. Vous bénéficiez d'un accompagnement personnalisé, de logements vérifiés via notre réseau de partenaires, et d'un suivi complet jusqu'à votre emménagement."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
          Questions Fréquemment Posées
        </Typography>
        <Typography variant="h6" sx={{ color: '#666' }}>
          Trouvez les réponses à vos questions sur les services HOMA
        </Typography>
      </Box>

      {/* FAQ Accordion */}
      <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
        {faqs.map((faq, index) => (
          <Accordion key={index} sx={{ mb: 2, '&.MuiAccordion-root': { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: '#f9f9f9',
                '&:hover': { backgroundColor: '#f0f0f0' },
                py: 2
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: '600', color: '#333' }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 3, pb: 3, backgroundColor: '#fff' }}>
              <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.7 }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* CTA Section */}
      <Box sx={{ mt: 8, textAlign: 'center', bgcolor: '#f9f9f9', p: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: '#333', mb: 2 }}>
          Vous n'avez pas trouvé la réponse que vous cherchiez?
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
          Contactez notre équipe pour toute question supplémentaire
        </Typography>
        <Typography variant="body2" sx={{ color: '#0099cc' }}>
          hello@ho-ma.fr | +33 (0)9 80 80 57 75
        </Typography>
      </Box>
    </Container>
  );
}