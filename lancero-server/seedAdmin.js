// Creates the first Admin account (registration always creates "Customer").
// Usage:  npm run seed:admin
// Optional env vars: ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // One-time cleanup: accounts created before the role names became
    // "Customer" / "Admin" still have lowercase roles and would be rejected.
    await User.collection.updateMany({ role: 'admin' }, { $set: { role: 'Admin' } });
    await User.collection.updateMany({ role: 'customer' }, { $set: { role: 'Customer' } });

    const email = (process.env.ADMIN_EMAIL || 'admin@bulldogsexchange.com').toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
        existing.role = 'Admin';
        await existing.save();
        console.log(`Existing user ${email} is now an Admin.`);
    } else {
        await User.create({
            name: process.env.ADMIN_NAME || 'Admin',
            email,
            password: process.env.ADMIN_PASSWORD || 'Admin123!',
            role: 'Admin'
        });
        console.log(`Admin created: ${email}  (change the default password!)`);
    }

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
