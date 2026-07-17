const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Role = require('./models/Role');

/**
 * One-off CLI seed. Creates admin only if missing — never resets an existing password.
 * Prefer ADMIN_PASSWORD / ADMIN_EMAIL env vars.
 */
const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const { v4: uuidv4 } = require('uuid');
    const existingRoles = await Role.find({});
    if (existingRoles.length === 0) {
      await Role.insertMany([
        { roleId: uuidv4(), roleName: 'learner', description: 'Learner role' },
        { roleId: uuidv4(), roleName: 'instructor', description: 'Instructor role' },
        { roleId: uuidv4(), roleName: 'admin', description: 'Administrator role' },
      ]);
      console.log('Roles seeded.');
    }

    const learnerRole = await Role.findOne({ roleName: 'learner' });
    const instructorRole = await Role.findOne({ roleName: 'instructor' });
    const adminRole = await Role.findOne({ roleName: 'admin' });
    if (!learnerRole || !instructorRole || !adminRole) {
      throw new Error('Required roles are missing');
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@kattran.com').trim().toLowerCase();
    const existingAdmin = await User.findOne({ userEmail: adminEmail });

    if (existingAdmin) {
      console.log(`Admin already exists (${adminEmail}) — password not reset.`);
      process.exit(0);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    let password = (process.env.ADMIN_PASSWORD || '').trim();
    if (!password) {
      if (isProduction) {
        throw new Error('ADMIN_PASSWORD is required to create the initial admin in production');
      }
      password = 'admin123';
      console.warn('ADMIN_PASSWORD not set — using temporary password for local seed only.');
    }

    await User.create({
      userName: 'Platform Admin',
      userEmail: adminEmail,
      password: await bcrypt.hash(password, 10),
      roles: [learnerRole.roleId, instructorRole.roleId, adminRole.roleId],
      status: 'active',
    });

    console.log(`Admin created successfully (${adminEmail}).`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding FAILED:', err.message);
    process.exit(1);
  }
};

seedAdmin();
