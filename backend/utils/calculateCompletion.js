/**
 * Calcule le pourcentage de complétude du profil locataire
 * @param {Object} tenant - Objet tenant de la BDD
 * @returns {Number} Pourcentage de 0 à 100
 */
function calculateCompletion(tenant) {
  if (!tenant) return 0;

  // Déterminer tous les champs "obligatoires" pour un profil complet
  const requiredFields = {
    // Infos personnelles (du User via userId)
    'userId': tenant.userId ? 1 : 0,

    // Infos pro (Étape 1-2)
    'profession': tenant.profession ? 1 : 0,
    'employmentType': tenant.employmentType && tenant.employmentType !== 'Autre' ? 1 : 0,
    'income': tenant.income && tenant.income > 0 ? 1 : 0,
    'employer': tenant.employer ? 1 : 0,

    // Préférences (Étape 3)
    'preferences.location': tenant.preferences?.location ? 1 : 0,
    'preferences.budgetMax': tenant.preferences?.budgetMax && tenant.preferences.budgetMax > 0 ? 1 : 0,
    'preferences.propertyType': tenant.preferences?.propertyType && tenant.preferences.propertyType !== 'Tous' ? 1 : 0,
    'preferences.moveInDate': tenant.preferences?.moveInDate ? 1 : 0,

    // Situation professionnelle (Étape 4)
    'professionalStatus.status': tenant.professionalStatus?.status ? 1 : 0,
    'professionalStatus.hasGuarantee': tenant.professionalStatus?.hasGuarantee !== undefined ? 1 : 0,

    // Documents (Étape 7)
    // Pièce d'identité (OBLIGATOIRE)
    'documents.identityCard': tenant.documents?.identityCard ? 2 : 0,

    // At least one proof of income
    'documents.income': (
      tenant.documents?.taxNotice || 
      tenant.documents?.lastThreePayslips || 
      tenant.documents?.employmentContract
    ) ? 2 : 0,

    // Proof of current accommodation
    'documents.accommodation': (
      tenant.documents?.rentalReceipts || 
      tenant.documents?.propertyTax || 
      tenant.documents?.accommodationAttestation
    ) ? 1 : 0,

    // Proof of address
    'documents.address': tenant.documents?.utilityBill ? 1 : 0
  };

  // Calculer le total possible et rempli
  const totalPossible = Object.values(requiredFields).reduce((a, b) => a + b, 0);
  const totalFilled = Object.values(requiredFields).reduce((a, b) => a + b, 0);

  // Total possible (ou total rempli si on utilise le poids)
  const maxPoints = 
    1 + // userId
    4 + // infos pro (4 champs)
    4 + // préférences (4 champs)
    2 + // situation professionnelle (2 champs)
    2 + // identityCard (poids 2)
    2 + // revenu (poids 2)
    1 + // accommodation
    1;  // address

  // Calculer le pourcentage
  let filledPoints = 0;
  Object.entries(requiredFields).forEach(([field, value]) => {
    filledPoints += value;
  });

  const percentage = Math.min(100, Math.round((filledPoints / maxPoints) * 100));

  return percentage;
}

module.exports = calculateCompletion;
