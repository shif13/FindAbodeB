// backend/controllers/userController.js
import User from '../models/user.js';

// Create user after Firebase signup
export const createUser = async (req, res) => {
  try {
    const { 
      firebaseUid, 
      email, 
      name, 
      phone,
      userType,
      city,
      state,
      address,
      // Agent fields
      agencyName,
      licenseNumber,
      reraNumber,
      // Builder fields
      companyName,
      gstNumber
    } = req.body;

    // Validation
    if (!firebaseUid || !email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID, email, and name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { firebaseUid } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Set approval status based on userType
    let approvalStatus = 'approved'; // Default for buyer/tenant/owner
    if (userType === 'agent' || userType === 'builder') {
      approvalStatus = 'pending'; // Needs admin approval
    }

    // Build user data object
    const userData = {
      firebaseUid,
      email,
      name,
      phone,
      userType: userType || 'buyer',
      approvalStatus,
      city,
      state,
      address
    };

    // Add agent-specific fields
    if (userType === 'agent') {
      userData.agencyName = agencyName;
      userData.licenseNumber = licenseNumber;
      userData.reraNumber = reraNumber;
    }

    // Add builder-specific fields
    if (userType === 'builder') {
      userData.companyName = companyName;
      userData.reraNumber = reraNumber;
      userData.gstNumber = gstNumber;
    }

    // Create user in database
    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: userType === 'agent' || userType === 'builder' 
        ? 'Account created! Pending admin approval.' 
        : 'Account created successfully!',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        approvalStatus: user.approvalStatus
      },
      needsApproval: approvalStatus === 'pending'
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

// Get user by Firebase UID
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

// Update user profile
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

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { userType, approvalStatus } = req.query;
    
    const whereClause = {};
    if (userType) whereClause.userType = userType;
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

// Admin: Approve user
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

    user.approvalStatus = 'approved';
    user.isActive = true;
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
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

// Admin: Reject user
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

// Admin: Delete user
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

// Admin: Toggle user active status
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