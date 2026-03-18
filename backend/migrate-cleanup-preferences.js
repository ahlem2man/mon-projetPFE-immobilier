/**
 * Migration Script: Clean up legacy preferences field from Tenant records
 * 
 * Removes the old preferences field from ALL Tenant records in MongoDB
 * This field should NEVER exist in Tenant model - preferences should only come from User model
 */

const mongoose = require('mongoose');
const Tenant = require('./models/Tenant');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/projet-immo';

async function cleanupLegacyPreferences() {
  try {
    console.log('\n🧹 [MIGRATION] Cleaning up legacy preferences field from Tenant records\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all Tenants with preferences field
    console.log('📝 Step 1: Finding Tenant records with legacy preferences field...');
    const tenantsWithPrefs = await Tenant.find({ preferences: { $exists: true } });
    console.log(`   Found: ${tenantsWithPrefs.length} records\n`);

    if (tenantsWithPrefs.length > 0) {
      console.log('📝 Step 2: Removing preferences field from all Tenant records...');
      
      const result = await Tenant.updateMany(
        { preferences: { $exists: true } },
        { $unset: { preferences: "" } }
      );

      console.log(`   ✅ Updated: ${result.modifiedCount} records\n`);
    } else {
      console.log('   ✅ No legacy preferences found - database is clean\n');
    }

    // Verify cleanup
    console.log('📝 Step 3: Verifying cleanup...');
    const remaining = await Tenant.find({ preferences: { $exists: true } });
    console.log(`   Remaining records with preferences: ${remaining.length}`);
    console.log(`   Status: ${remaining.length === 0 ? '✅ CLEAN' : '❌ STILL DIRTY'}\n`);

    console.log('✅ MIGRATION COMPLETE\n');

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

cleanupLegacyPreferences();
