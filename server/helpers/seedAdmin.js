const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

/**
 * Ensures roles exist and creates the platform admin once.
 * Never overwrites an existing admin password or roles on boot.
 */
const seedAdmin = async () => {
  try {
    const { v4: uuidv4 } = require('uuid');

    const existingRoles = await Role.find({});
    if (existingRoles.length === 0) {
      const roles = [
        { roleId: uuidv4(), roleName: 'learner', description: 'Learner role' },
        { roleId: uuidv4(), roleName: 'instructor', description: 'Instructor role' },
        { roleId: uuidv4(), roleName: 'admin', description: 'Administrator role' },
      ];
      await Role.insertMany(roles);
      console.log('Roles seeded with UUIDs');
    }

    const learnerRole = await Role.findOne({ roleName: 'learner' });
    const instructorRole = await Role.findOne({ roleName: 'instructor' });
    const adminRole = await Role.findOne({ roleName: 'admin' });

    if (!learnerRole || !instructorRole || !adminRole) {
      console.error('Admin seeding skipped: required roles are missing');
      return;
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@kattran.com').trim().toLowerCase();
    const existingAdmin = await User.findOne({ userEmail: adminEmail });

    if (existingAdmin) {
      console.log(`Admin already exists (${adminEmail}) — password not reset`);
      return;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    let password = (process.env.ADMIN_PASSWORD || '').trim();

    if (!password) {
      if (isProduction) {
        console.error(
          'Admin not created: set ADMIN_PASSWORD (and optionally ADMIN_EMAIL) to seed the first admin in production',
        );
        return;
      }
      password = 'admin123';
      console.warn(
        'ADMIN_PASSWORD not set — creating initial admin with a temporary password. Change it after first login.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      userName: 'Platform Admin',
      userEmail: adminEmail,
      password: hashedPassword,
      roles: [learnerRole.roleId, instructorRole.roleId, adminRole.roleId],
      status: 'active',
    });
    console.log(`Created initial admin (${adminEmail})`);
  } catch (error) {
    console.error('Admin Seeding FAILED:', error.message);
  }
};

module.exports = seedAdmin;
