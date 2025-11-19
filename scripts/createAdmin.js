// backend/scripts/createAdmin.js
// Run this script ONCE to create the first admin user
// Usage: node scripts/createAdmin.js
import User from '../models/user.js';
import sequelize from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { userType: 'admin' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      process.exit(0);
    }

    // ============================================
    // STEP 1: CREATE ADMIN USER IN FIREBASE FIRST
    // ============================================
    console.log('\n📋 INSTRUCTIONS:');
    console.log('1. Go to Firebase Console → Authentication');
    console.log('2. Add a new user with email and password');
    console.log('3. Copy the UID from Firebase');
    console.log('4. Run this script and enter the details below\n');

      
    const adminData = {
      firebaseUid: '2B3MSTYBPLOJAdIrverTmnx2Fwt1', 
      email: 'kingsyshibani13@gmail.com',       
      name: 'Admin User',
      phone: '+91 7867023051',
      userType: 'admin',
      providerType: null,
      approvalStatus: 'approved',
      isActive: true,
      isVerified: true
    };
    // Create admin user
    const admin = await User.create(adminData);

    console.log('\n✅ Admin user created successfully!');
    console.log('═══════════════════════════════════════');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('UID:', admin.firebaseUid);
    console.log('═══════════════════════════════════════\n');
    console.log('🎉 You can now login with this account!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();