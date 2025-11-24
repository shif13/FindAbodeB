// backend/services/initAdmin.js
import User from '../models/user.js';
import admin from '../config/firebase.js';

/**
 * Automatically creates default admin user if none exists
 * This runs on server startup
 */
export const initializeDefaultAdmin = async () => {
  try {
    // Check if any admin user exists
    const existingAdmin = await User.findOne({
      where: { userType: 'admin' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    console.log('⚠️  No admin user found. Creating default admin...');

    // Default admin credentials from environment variables
    const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@findabode.com';
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';
    const defaultAdminName = process.env.DEFAULT_ADMIN_NAME || 'Admin';
    const defaultAdminPhone = process.env.DEFAULT_ADMIN_PHONE || null;

    let firebaseUid;

    try {
      // Check if user exists in Firebase
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().getUserByEmail(defaultAdminEmail);
        firebaseUid = firebaseUser.uid;
        console.log('✅ Found existing Firebase user:', defaultAdminEmail);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create user in Firebase
          firebaseUser = await admin.auth().createUser({
            email: defaultAdminEmail,
            password: defaultAdminPassword,
            emailVerified: true,
            displayName: defaultAdminName
          });
          firebaseUid = firebaseUser.uid;
          console.log('✅ Created Firebase user:', defaultAdminEmail);
        } else {
          throw error;
        }
      }
    } catch (firebaseError) {
      console.error('❌ Firebase error:', firebaseError.message);
      console.error('⚠️  Could not create Firebase user. Admin creation skipped.');
      console.error('💡 Please create admin manually in Firebase console');
      return;
    }

    // Create admin in database
    const adminUser = await User.create({
      firebaseUid,
      email: defaultAdminEmail,
      name: defaultAdminName,
      phone: defaultAdminPhone,
      userType: 'admin',
      providerType: null,
      approvalStatus: 'approved',
      isActive: true,
      isVerified: true
    });

    console.log('\n🎉 DEFAULT ADMIN CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════');
    console.log('📧 Email:', defaultAdminEmail);
    console.log('🔑 Password:', defaultAdminPassword);
    console.log('👤 Name:', defaultAdminName);
    console.log('🆔 UID:', firebaseUid);
    console.log('═══════════════════════════════════════════════════');
    console.log('⚠️  IMPORTANT: Change password after first login!');
    console.log('💡 Set custom credentials in .env file:');
    console.log('   DEFAULT_ADMIN_EMAIL=your@email.com');
    console.log('   DEFAULT_ADMIN_PASSWORD=YourSecurePassword');
    console.log('   DEFAULT_ADMIN_NAME=Your Name');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Failed to initialize default admin:', error.message);
    console.error('💡 You may need to create admin manually');
  }
};

/**
 * Check if default admin credentials are being used (security warning)
 */
export const checkDefaultAdminSecurity = async () => {
  try {
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@findabode.com';
    const isUsingDefaultEmail = defaultEmail === 'admin@findabode.com';
    const hasDefaultPassword = !process.env.DEFAULT_ADMIN_PASSWORD;

    if (isUsingDefaultEmail || hasDefaultPassword) {
      console.warn('\n⚠️  SECURITY WARNING ⚠️');
      console.warn('═══════════════════════════════════════════════════');
      console.warn('You are using default admin credentials!');
      console.warn('This is insecure for production environments.');
      console.warn('');
      console.warn('Please update your .env file with:');
      console.warn('DEFAULT_ADMIN_EMAIL=your-secure-email@domain.com');
      console.warn('DEFAULT_ADMIN_PASSWORD=YourVerySecurePassword123!');
      console.warn('DEFAULT_ADMIN_NAME=Your Name');
      console.warn('═══════════════════════════════════════════════════\n');
    }
  } catch (error) {
    console.error('Error checking admin security:', error);
  }
};