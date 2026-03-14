require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const issueRoutes = require('./routes/issueRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const jobRoutes = require('./routes/jobRoutes');
const commentRoutes = require('./routes/commentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const applicationRoutes = require('./routes/applicationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Higher limit for base64 image uploads

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/applications', applicationRoutes);

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Serve-Link API is running...');
});

// Database Connection
try {
  const serviceAccount = require('./serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin SDK initialized (Connected to Firestore)');

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (err) {
  console.error('Firebase initialization error:', err);
}
