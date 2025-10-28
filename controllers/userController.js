// backend/controllers/userController.js - UPDATED FOR 2 USER TYPES
import User from '../models/user.js';

// ============================================
// CREATE USER AFTER FIREBASE SIGNUP
// ============================================
export const createUser = async (req, res) => {
  try {
    const { 
      firebaseUid, 
      email, 
      name, 
      phone,
      userType,        // 'seeker' or 'provider'
      providerType,    // 'owner', 'agent', or 'builder' (only if provider)
      city,
      state,
      address,
      // Agent-specific fields
      agencyName,
      licenseNumber,
      reraNumber,
      // Builder-specific fields
      companyName,
      gstNumber
    } = req.body;

    // ============================================
    // VALIDATION
    // ============================================
    if (!firebaseUid || !email || !name || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID, email, name, and userType are required'
      });
    }

    // Validate userType
    if (!['seeker', 'provider', 'admin'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userType. Must be seeker, provider, or admin'
      });
    }

    // If provider, validate providerType
    if (userType === 'provider') {
      if (!providerType || !['owner', 'agent', 'builder'].includes(providerType)) {
        return res.status(400).json({
          success: false,
          message: 'Provider must specify providerType: owner, agent, or builder'
        });
      }

      // Validate required fields for agents
      if (providerType === 'agent') {
        if (!agencyName || !licenseNumber) {
          return res.status(400).json({
            success: false,
            message: 'Agents must provide agency name and license number'
          });
        }
      }

      // Validate required fields for builders
      if (providerType === 'builder') {
        if (!companyName || !reraNumber) {
          return res.status(400).json({
            success: false,
            message: 'Builders must provide company name and RERA number'
          });
        }
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { firebaseUid } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // ============================================
    // DETERMINE APPROVAL STATUS
    // ============================================
    let approvalStatus = 'approved'; // Default for seekers and owners
    
    if (userType === 'provider' && (providerType === 'agent' || providerType === 'builder')) {
      approvalStatus = 'pending'; // Agents and builders need approval
    }

    // ============================================
    // BUILD USER DATA OBJECT
    // ============================================
    const userData = {
      firebaseUid,
      email,
      name,
      phone,
      userType,
      providerType: userType === 'provider' ? providerType : null,
      approvalStatus,
      city,
      state,
      address
    };

    // Add provider-specific fields
    if (userType === 'provider') {
      if (providerType === 'agent') {
        userData.agencyName = agencyName;
        userData.licenseNumber = licenseNumber;
        userData.reraNumber = reraNumber || null;
      } else if (providerType === 'builder') {
        userData.companyName = companyName;
        userData.reraNumber = reraNumber;
        userData.gstNumber = gstNumber || null;
      }
    }

    // ============================================
    // CREATE USER IN DATABASE
    // ============================================
    const user = await User.create(userData);

    // ============================================
    // PREPARE RESPONSE MESSAGE
    // ============================================
    let message = 'Account created successfully!';
    let needsApproval = false;

    if (userType === 'provider' && providerType === 'agent') {
      message = 'Agent account created! Pending admin approval.';
      needsApproval = true;
    } else if (userType === 'provider' && providerType === 'builder') {
      message = 'Builder account created! Pending admin approval.';
      needsApproval = true;
    }

    res.status(201).json({
      success: true,
      message,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        providerType: user.providerType,
        approvalStatus: user.approvalStatus
      },
      needsApproval
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// ============================================
// GET USER BY FIREBASE UID
// ============================================
export const getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ 
      where: { firebaseUid: uid },
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// ============================================
// UPDATE USER PROFILE
// ============================================
export const updateProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;

    const user = await User.findOne({ where: { firebaseUid: uid } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent updating sensitive fields
    delete updateData.firebaseUid;
    delete updateData.email;
    delete updateData.userType;
    delete updateData.providerType;
    delete updateData.approvalStatus;

    await user.update(updateData);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// ============================================
// ADMIN: GET ALL USERS
// ============================================
export const getAllUsers = async (req, res) => {
  try {
    const { userType, providerType, approvalStatus } = req.query;
    
    const whereClause = {};
    if (userType) whereClause.userType = userType;
    if (providerType) whereClause.providerType = providerType;
    if (approvalStatus) whereClause.approvalStatus = approvalStatus;

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['firebaseUid'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// ============================================
// ADMIN: APPROVE USER (Agent/Builder)
// ============================================
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only approve providers (agents/builders)
    if (user.userType !== 'provider' || 
        (user.providerType !== 'agent' && user.providerType !== 'builder')) {
      return res.status(400).json({
        success: false,
        message: 'Only agents and builders need approval'
      });
    }

    user.approvalStatus = 'approved';
    user.isActive = true;
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.providerType.charAt(0).toUpperCase() + user.providerType.slice(1)} approved successfully`,
      data: user
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user',
      error: error.message
    });
  }
};

// ============================================
// ADMIN: REJECT USER
// ============================================
export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.approvalStatus = 'rejected';
    user.isActive = false;
    user.rejectionReason = reason || 'Your account was rejected by admin';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User rejected',
      data: user
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user',
      error: error.message
    });
  }
};

// ============================================
// ADMIN: DELETE USER
// ============================================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// ============================================
// ADMIN: TOGGLE USER STATUS
// ============================================
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error.message
    });
  }
};