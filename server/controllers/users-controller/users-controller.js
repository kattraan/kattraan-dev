// controllers/users-controller.js

const User = require('../../models/User');
const DeletedUser = require('../../models/DeletedUser');
const bcrypt = require('bcryptjs');

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const users = await User
      .find(filter)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 }); // Newest first
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('getUsers Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User
      .findById(id)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('getUserById Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.roleNames?.map((r) => String(r).toLowerCase()).includes('admin');
    if (String(req.user._id) !== String(id) && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile' });
    }
    const update = { ...req.body };

    // If password is being updated, hash it
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    // Merge enrollmentData with existing so partial updates don't wipe other fields
    if (update.enrollmentData && typeof update.enrollmentData === 'object') {
      const existing = await User.findById(id).select('enrollmentData').lean();
      const merged = { ...(existing?.enrollmentData || {}), ...update.enrollmentData };
      // Deep merge for nested objects (e.g. socialLinks, socialDisplayOnProfile, invoiceAddress)
      if (merged.socialLinks && typeof merged.socialLinks === 'object') {
        merged.socialLinks = { ...(existing?.enrollmentData?.socialLinks || {}), ...merged.socialLinks };
      }
      if (merged.socialDisplayOnProfile && typeof merged.socialDisplayOnProfile === 'object') {
        merged.socialDisplayOnProfile = { ...(existing?.enrollmentData?.socialDisplayOnProfile || {}), ...merged.socialDisplayOnProfile };
      }
      if (merged.invoiceAddress && typeof merged.invoiceAddress === 'object') {
        merged.invoiceAddress = { ...(existing?.enrollmentData?.invoiceAddress || {}), ...merged.invoiceAddress };
      }
      update.enrollmentData = merged;
    }

    const user = await User
      .findByIdAndUpdate(id, update, { new: true })
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Enrich with role names so frontend hasRole() works (avoids redirect to home after save)
    const Role = require('../../models/Role');
    const rolesData = await Role.find({ roleId: { $in: user.roles || [] } });
    const roleNames = rolesData.map((r) => r.roleName);
    const data = { ...user, roles: roleNames.length > 0 ? roleNames : user.roles };

    return res.json({ success: true, data });
  } catch (err) {
    console.error('updateUser Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/users/:id
// “Soft delete”: copy to DeletedUser then remove from User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Archive into DeletedUser
    await DeletedUser.create({
      originalId: user._id,
      data: user.toObject(),
    });

    // Remove from User collection
    await user.deleteOne();

    return res.json({ success: true, message: 'User deleted (archived)' });
  } catch (err) {
    console.error('deleteUser Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
// GET /api/users/me
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Since we want to keep logic consistent, we'll fetch the role name
    const Role = require('../../models/Role');
    const rolesData = await Role.find({ roleId: { $in: user.roles } });
    const primaryRole = rolesData.find(r => r.roleName === 'admin') || 
                       rolesData.find(r => r.roleName === 'instructor') || 
                       rolesData.find(r => r.roleName === 'learner');

    const safeProfile = {
      userName: user.userName,
      userEmail: user.userEmail,
      status: user.status,
      role: primaryRole ? primaryRole.roleName : 'learner'
    };

    return res.json({ success: true, data: safeProfile });
  } catch (err) {
    console.error('getMyProfile Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
