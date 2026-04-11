const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Explicitly load .env from the same directory
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Role = require('./models/Role');

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in .env file");
        }

        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB successfully.');

        // Seed Roles
        console.log('Seeding roles...');
        const roles = [
            { roleId: 1, roleName: 'learner', description: 'Learner role' },
            { roleId: 2, roleName: 'instructor', description: 'Instructor role' },
            { roleId: 3, roleName: 'admin', description: 'Administrator role' }
        ];

        for (const role of roles) {
            await Role.findOneAndUpdate({ roleId: role.roleId }, role, { upsert: true });
        }
        console.log('Roles seeded.');

        const adminEmail = 'admin@kattran.com';
        const existingAdmin = await User.findOne({ userEmail: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists. Updating password to "admin123"...');
            existingAdmin.password = await bcrypt.hash('admin123', 10);
            existingAdmin.roles = [1, 2, 3];
            existingAdmin.status = 'active';
            await existingAdmin.save();
        } else {
            console.log('Creating new Admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                userName: 'Platform Admin',
                userEmail: adminEmail,
                password: hashedPassword,
                roles: [1, 2, 3],
                status: 'active'
            });
        }

        console.log('Admin seeded successfully! You can now log in with:');
        console.log('Email: admin@kattran.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (err) {
        console.error('Seeding FAILED:', err.message);
        process.exit(1);
    }
};

seedAdmin();
