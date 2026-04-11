const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        // 1. Seed Roles with UUIDs (if not already seeded)
        const { v4: uuidv4 } = require('uuid');
        
        const existingRoles = await Role.find({});
        if (existingRoles.length === 0) {
            const roles = [
                { roleId: uuidv4(), roleName: 'learner', description: 'Learner role' },
                { roleId: uuidv4(), roleName: 'instructor', description: 'Instructor role' },
                { roleId: uuidv4(), roleName: 'admin', description: 'Administrator role' }
            ];
            await Role.insertMany(roles);
            console.log('✅ Roles seeded with UUIDs');
        }

        // 2. Fetch role UUIDs
        const learnerRole = await Role.findOne({ roleName: 'learner' });
        const instructorRole = await Role.findOne({ roleName: 'instructor' });
        const adminRole = await Role.findOne({ roleName: 'admin' });

        // 3. Seed Admin User
        const adminEmail = 'admin@kattran.com';
        let admin = await User.findOne({ userEmail: adminEmail });

        const hashedPassword = await bcrypt.hash('admin123', 10);

        if (admin) {
            console.log('🔄 Updating existing Admin user...');
            admin.password = hashedPassword;
            admin.roles = [learnerRole.roleId, instructorRole.roleId, adminRole.roleId];
            admin.status = 'active';
            await admin.save();
        } else {
            console.log('✨ Creating new Admin user...');
            await User.create({
                userName: 'Platform Admin',
                userEmail: adminEmail,
                password: hashedPassword,
                roles: [learnerRole.roleId, instructorRole.roleId, adminRole.roleId],
                status: 'active'
            });
        }
    
    } catch (error) {
        console.error('❌ Admin Seeding FAILED:', error.message);
    }
};

module.exports = seedAdmin;
