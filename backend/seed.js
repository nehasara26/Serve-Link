require('dotenv').config();
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const seedDatabase = async () => {
  try {
    console.log('Starting Firestore Seed...');

    // 1. Create an Organization
    const orgRef = db.collection('organizations').doc();
    await orgRef.set({
      name: 'Green Earth Initiative',
      description: 'Focused on environmental cleanups and planting trees.',
      contactEmail: 'contact@greenearth.org',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.730610]
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Created Organization: Green Earth Initiative (ID: ${orgRef.id})`);

    // 2. Create Volunteer User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const volunteerRef = db.collection('users').doc();
    await volunteerRef.set({
      name: 'Test Volunteer',
      email: 'volunteer@test.com',
      password: hashedPassword,
      role: 'Volunteer',
      organizationId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Created Volunteer User: volunteer@test.com / password123`);

    // 3. Create Org Admin User
    const adminRef = db.collection('users').doc();
    await adminRef.set({
      name: 'Org Admin',
      email: 'admin@greenearth.org',
      password: hashedPassword,
      role: 'Organization',
      organizationId: orgRef.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Created Org Admin User: admin@greenearth.org / password123`);

    // 4. Create Issue Reports
    const issues = [
      {
        title: 'Fallen Tree Blocking Road',
        description: 'A large oak tree fell during the storm, completely blocking Elm Street.',
        category: 'Infrastructure',
        location: { type: 'Point', coordinates: [-73.94, 40.74] },
        reportedBy: volunteerRef.id,
        status: 'Open',
        upvotes: [volunteerRef.id],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        title: 'Park Needs Cleanup',
        description: 'Trash bins are overflowing at Centennial Park after the weekend festival.',
        category: 'Environment',
        location: { type: 'Point', coordinates: [-73.92, 40.72] },
        reportedBy: volunteerRef.id,
        status: 'Open',
        upvotes: [volunteerRef.id, adminRef.id],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        title: 'Medical Supplies Needed',
        description: 'The local clinic is running critically low on basic first aid supplies.',
        category: 'Health',
        location: { type: 'Point', coordinates: [-73.95, 40.71] },
        reportedBy: adminRef.id,
        status: 'In Progress',
        upvotes: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const issue of issues) {
      await db.collection('issues').add(issue);
    }
    console.log('Created 3 Sample Issue Reports.');

    console.log('\nDatabase Seeding Complete!');
    console.log('\nTest Login Credentials:');
    console.log('  Volunteer: volunteer@test.com / password123');
    console.log('  Org Admin: admin@greenearth.org / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDatabase();
