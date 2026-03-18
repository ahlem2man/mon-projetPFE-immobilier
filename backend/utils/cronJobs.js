const cron = require('node-cron');
const User = require('../models/User');
const Property = require('../models/Property');
const Matching = require('../models/Matching');
const { calculateMatchScore } = require('./matchingAlgo');

/**
 * Lance le cron job de matching automatique
 * Par défaut: tous les jours à minuit
 * Pour tester: chaque minute '* * * * *'
 */
const initCronJobs = () => {
  // Cron pour le matching automatique
  // Format: '0 0 * * *' = chaque jour à 00:00
  // Format: '0 */6 * * *' = chaque 6 heures
  cron.schedule('0 0 * * *', async () => {
    console.log('\n [CRON] Lancement du Matching Automatique Nocturne');
    console.log(` Heure: ${new Date().toLocaleString('fr-FR')}`);
    
    const startTime = Date.now();
    
    try {
      // 1. Récupérer tous les locataires avec préférences
      const users = await User.find({ role: 'tenant' }).select('_id preferences');
      const usersWithPrefs = users.filter(u => u.preferences && Object.keys(u.preferences).length > 0);
      
      console.log(` Utilisateurs locataires trouvés: ${users.length}`);
      console.log(` Utilisateurs avec préférences: ${usersWithPrefs.length}`);

      if (usersWithPrefs.length === 0) {
        console.log('  Aucun utilisateur avec préférences renseignées.');
        return;
      }

      // 2. Récupérer toutes les propriétés
      const properties = await Property.find().select('_id owner type location price amenities');
      console.log(` Propriétés trouvées: ${properties.length}`);

      let totalMatchingsCreated = 0;
      let totalMatchingsUpdated = 0;
      let totalSkipped = 0; // Compteur pour propriétés non disponibles
      let errorCount = 0;

      // 3. Pour chaque utilisateur, calculer les matchings
      for (const user of usersWithPrefs) {
        try {
          console.log(`\n   Traitement utilisateur: ${user._id}`);
          
          // Exclure les propriétés de l'utilisateur lui-même
          const validProperties = properties.filter(p => p.owner.toString() !== user._id.toString());
          
          for (const property of validProperties) {
            const result = calculateMatchScore(user.preferences, property);
            
            // Si résultat est null = propriété non disponible → exclure
            if (result === null) {
              totalSkipped++;
              continue;
            }

            const { score, details } = result;

            // Filtrer les matchings avec score trop bas (bruit)
            if (score >= 10) {
              const matchResult = await Matching.findOneAndUpdate(
                { tenantId: user._id, propertyId: property._id },
                { 
                  score, 
                  details, 
                  status: 'active',
                  updatedAt: new Date()
                },
                { upsert: true, new: true }
              );

              if (matchResult.isNew || matchResult.__v === 0) {
                totalMatchingsCreated++;
              } else {
                totalMatchingsUpdated++;
              }
            }
          }
          console.log(`   Utilisateur ${user._id} traité`);
        } catch (userError) {
          errorCount++;
          console.error(`   Erreur pour utilisateur ${user._id}:`, userError.message);
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n[SUCCESS] Cron Job Terminé avec Succès`);
      console.log(`    Matchings créés: ${totalMatchingsCreated}`);
      console.log(`    Matchings mis à jour: ${totalMatchingsUpdated}`);
      console.log(`    Propriétés non disponibles exclues: ${totalSkipped}`);
      console.log(`     Erreurs: ${errorCount}`);
      console.log(`   Durée: ${duration}s\n`);

    } catch (error) {
      console.error(' Erreur critique lors du cron job:', error.message);
      console.error(error.stack);
    }
  });

  console.log(' Tâche planifiée activée: Matching automatique chaque jour à 00:00');
};

/**
 * Pour tester manuellement le matching automatique depuis contrôleur
 */
const runMatchingManually = async () => {
  console.log('\n [MANUAL] Lancement manuel du Matching');
  
  const startTime = Date.now();
  
  try {
    const users = await User.find({ role: 'tenant' }).select('_id preferences');
    const usersWithPrefs = users.filter(u => u.preferences && Object.keys(u.preferences).length > 0);
    
    const properties = await Property.find().select('_id owner type location price amenities status');

    let totalMatchingsCreated = 0;
    let totalMatchingsUpdated = 0;
    let totalSkipped = 0; // Compteur pour propriétés non disponibles

    for (const user of usersWithPrefs) {
      const validProperties = properties.filter(p => p.owner.toString() !== user._id.toString());
      
      for (const property of validProperties) {
        const result = calculateMatchScore(user.preferences, property);
        
        // Si résultat est null = propriété non disponible → exclure
        if (result === null) {
          totalSkipped++;
          continue;
        }

        const { score, details } = result;

        if (score >= 10) {
          const matchResult = await Matching.findOneAndUpdate(
            { tenantId: user._id, propertyId: property._id },
            { score, details, status: 'active' },
            { upsert: true, new: true }
          );

          if (matchResult.isNew || matchResult.__v === 0) {
            totalMatchingsCreated++;
          } else {
            totalMatchingsUpdated++;
          }
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(` Matching manuel terminé en ${duration}s`);
    console.log(`    Matchings créés: ${totalMatchingsCreated}`);
    console.log(`    Matchings mis à jour: ${totalMatchingsUpdated}`);
    console.log(`    Propriétés non disponibles exclues: ${totalSkipped}`);
    
    return {
      success: true,
      matchingsCreated: totalMatchingsCreated,
      matchingsUpdated: totalMatchingsUpdated,
      propertiesSkipped: totalSkipped,
      duration: duration
    };

  } catch (error) {
    console.error(' Erreur matching manuel:', error.message);
    throw error;
  }
};

module.exports = initCronJobs;
module.exports.runMatchingManually = runMatchingManually;