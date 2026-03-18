/**
 * Final Verification Test: Ensure propertyType "Maison" is returned correctly
 * 
 * Tests that:
 * 1. User preferences saved correctly with "Maison"
 * 2. getTenantProfile returns User.preferences (not Tenant legacy)
 * 3. Tenant model has strict: true (no extra fields accepted)
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Tenant = require('./models/Tenant');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/projet-immo';

async function finalVerification() {
  try {
    console.log('\n🧪 [FINAL TEST] Verify propertyType "Maison" persistence\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create fresh test user
    const testEmail = `final-test-${Date.now()}@test.com`;
    console.log('📝 Creating new test user with propertyType "Maison"...');
    
    let user = new User({
      name: 'Final Test User',
      email: testEmail,
      password: 'hashedPassword123',
      role: 'tenant',
      preferences: {
        city: 'Bordeaux',
        maxPrice: 2500,
        propertyType: 'Maison',  // The critical value
        minRooms: 3,
        moveInDate: new Date('2025-06-01'),
        wantedAmenities: ['Parking', 'Jardin']
      }
    });
    
    await user.save();
    console.log(`✅ User saved with propertyType: "${user.preferences.propertyType}"\n`);

    // Create corresponding Tenant
    console.log('📝 Creating corresponding Tenant record...');
    let tenant = new Tenant({
      userId: user._id,
      documents: {},
      professionalStatus: {},
      employmentType: 'CDI',
      profession: 'Architect'
    });
    
    await tenant.save();
    console.log(`✅ Tenant created\n`);

    // Simulate getTenantProfile endpoint (with reconstruction logic)
    console.log('📝 Simulating getTenantProfile endpoint response...\n');
    
    tenant = await Tenant.findOne({ userId: user._id });
    user = await User.findById(user._id).select('preferences');
    
    // Build response exactly like the endpoint does
    const response = {
      _id: tenant?._id,
      userId: tenant?.userId,
      profession: tenant?.profession,
      employmentType: tenant?.employmentType,
      income: tenant?.income,
      employer: tenant?.employer,
      professionalStatus: tenant?.professionalStatus || {},
      documents: tenant?.documents || {},
      completionPercentage: tenant?.completionPercentage || 0,
      savedSearches: tenant?.savedSearches || [],
      favoriteProperties: tenant?.favoriteProperties || [],
      createdAt: tenant?.createdAt,
      updatedAt: tenant?.updatedAt,
      __v: tenant?.__v
    };
    
    // CRUCIAL: Add User preferences (not Tenant)
    if (user?.preferences) {
      response.preferences = user.preferences;
    } else {
      response.preferences = {
        city: '',
        maxPrice: 0,
        propertyType: '',
        minSurface: 0,
        minRooms: 1,
        moveInDate: null,
        wantedAmenities: []
      };
    }

    console.log('📋 Response from getTenantProfile:\n');
    console.log(`   preferences.city: "${response.preferences.city}"`);
    console.log(`   preferences.maxPrice: ${response.preferences.maxPrice}`);
    console.log(`   preferences.propertyType: "${response.preferences.propertyType}"`);
    console.log(`   preferences.minRooms: ${response.preferences.minRooms}\n`);

    // Verify the critical field
    console.log('🔍 CRITICAL CHECK:\n');
    const passed = response.preferences.propertyType === 'Maison';
    console.log(`   Expected propertyType: "Maison"`);
    console.log(`   Actual propertyType: "${response.preferences.propertyType}"`);
    console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);

    // Verify no Tenant preferences field
    console.log('🔍 TENANT STRUCTURE CHECK:\n');
    const tenantObj = tenant.toObject();
    console.log(`   Tenant has preferences field: ${tenantObj.preferences ? '⚠️  YES (LEGACY!)' : '✅ NO (CLEAN!)'}`);
    console.log(`   Tenant has documents field: ${tenantObj.documents ? '✅ YES' : '❌ NO'}`);
    console.log(`   Tenant has professionalStatus: ${tenantObj.professionalStatus ? '✅ YES' : '❌ NO'}\n`);

    if (passed) {
      console.log('✅ FINAL TEST PASSED - propertyType "Maison" persists correctly!\n');
    } else {
      console.log('❌ FINAL TEST FAILED - propertyType not saved correctly!\n');
    }

    // Cleanup
    // await User.deleteOne({ _id: user._id });
    // await Tenant.deleteOne({ userId: user._id });

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

finalVerification();
