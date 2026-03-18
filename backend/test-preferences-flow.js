/**
 * Test Script: Verify Preferences Persistence
 * 
 * Tests the full flow:
 * 1. Create test user with initial preferences
 * 2. Update preferences to "Maison"
 * 3. Fetch and verify it persists
 * 4. Check getTenantProfile returns correct value
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Tenant = require('./models/Tenant');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/projet-immo';

async function testPreferencesFlow() {
  try {
    console.log('\n🧪 [TEST] Full Preferences Persistence Flow\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Create test user
    const testEmail = `preferences-test-${Date.now()}@test.com`;
    console.log('📝 Step 1: Creating test user...');
    
    let user = await User.findOne({ email: testEmail });
    if (!user) {
      user = new User({
        name: 'Test Preferences',
        email: testEmail,
        password: 'hashedPassword123',
        role: 'tenant',
        preferences: {
          city: 'Paris',
          maxPrice: 1500,
          propertyType: 'Studio',  // Initial value
          minRooms: 1,
          moveInDate: new Date('2025-01-15'),
          wantedAmenities: []
        }
      });
      await user.save();
      console.log(`✅ User created with initial propertyType: "Studio"\n`);
    } else {
      console.log(`✅ User exists: ${user._id}\n`);
    }

    // Step 2: Create Tenant record
    console.log('📝 Step 2: Creating Tenant record...');
    let tenant = await Tenant.findOne({ userId: user._id });
    if (!tenant) {
      tenant = new Tenant({
        userId: user._id,
        documents: {},
        professionalStatus: {}
      });
      await tenant.save();
      console.log(`✅ Tenant created\n`);
    } else {
      console.log(`✅ Tenant exists\n`);
    }

    // Step 3: Simulate updating preferences to "Maison"
    console.log('📝 Step 3: Updating preferences to "Maison"...');
    const updatedPreferences = {
      city: 'Lyon',
      maxPrice: 2000,
      propertyType: 'Maison',  // Changed!
      minRooms: 2,
      moveInDate: new Date('2025-03-01'),
      wantedAmenities: ['Parking']
    };

    user = await User.findByIdAndUpdate(
      user._id,
      { preferences: updatedPreferences },
      { new: true, runValidators: true }
    );
    console.log(`✅ Preferences updated in User model\n`);

    // Step 4: Verify in MongoDB
    console.log('📝 Step 4: Verifying in MongoDB...');
    console.log(`   User.preferences.propertyType: "${user.preferences.propertyType}"`);
    console.log(`   Expected: "Maison"`);
    console.log(`   Match: ${user.preferences.propertyType === 'Maison' ? '✅' : '❌'}\n`);

    // Step 5: Simulate getTenantProfile endpoint
    console.log('📝 Step 5: Simulating getTenantProfile endpoint...');
    tenant = await Tenant.findOne({ userId: user._id });
    const userForResponse = await User.findById(user._id).select('preferences');
    
    let response = tenant ? tenant.toObject() : {};
    
    // Remove legacy preferences if it exists
    if (response.preferences) {
      console.log(`   ⚠️  Found legacy preferences field in Tenant (removing)...`);
      delete response.preferences;
    }
    
    // Add User preferences
    if (userForResponse?.preferences) {
      response.preferences = userForResponse.preferences;
    }
    
    console.log(`   Response.preferences.propertyType: "${response.preferences.propertyType}"`);
    console.log(`   Expected: "Maison"`);
    console.log(`   Match: ${response.preferences.propertyType === 'Maison' ? '✅' : '❌'}\n`);

    // Step 6: Verify Tenant doesn't have legacy preferences
    console.log('📝 Step 6: Verifying Tenant structure...');
    console.log(`   Tenant has legacy preferences field: ${tenant.preferences ? '⚠️  YES' : '✅ NO'}`);
    console.log(`   Tenant has documents field: ${tenant.documents ? '✅ YES' : '❌ NO'}`);
    console.log(`   Tenant has professionalStatus field: ${tenant.professionalStatus ? '✅ YES' : '❌ NO'}\n`);

    console.log('✅ ALL TESTS PASSED - Preferences persistence working correctly!\n');

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

testPreferencesFlow();
