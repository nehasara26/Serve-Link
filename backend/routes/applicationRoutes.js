const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authMw = require('../middleware/authMw');

// POST /api/applications - Apply for a job
router.post('/', authMw, async (req, res) => {
  try {
    const { jobId, message } = req.body;
    
    if (req.user.role !== 'Volunteer') {
      return res.status(403).json({ msg: 'Only volunteers can apply for jobs' });
    }

    const db = admin.firestore();
    
    // Check if job exists
    const jobRef = db.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    const jobData = jobDoc.data();

    // Check if already applied
    const existingApp = await db.collection('applications')
      .where('jobId', '==', jobId)
      .where('volunteerId', '==', req.user.id)
      .get();

    if (!existingApp.empty) {
      return res.status(400).json({ msg: 'You have already applied for this job' });
    }

    const newApp = {
      jobId,
      jobTitle: jobData.title,
      orgName: jobData.orgName,
      orgId: jobData.postedBy,
      volunteerId: req.user.id,
      volunteerName: req.user.name || 'Anonymous',
      volunteerEmail: req.user.email || '',
      message: message || '',
      status: 'pending', // pending, accepted, rejected
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('applications').add(newApp);
    res.status(201).json({ id: docRef.id, ...newApp });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /api/applications/job/:jobId - Get applications for a specific job (Org only)
router.get('/job/:jobId', authMw, async (req, res) => {
  try {
    const db = admin.firestore();
    
    // Check if job exists and if requester is the owner
    const jobDoc = await db.collection('jobs').doc(req.params.jobId).get();
    if (!jobDoc.exists) return res.status(404).json({ msg: 'Job not found' });
    
    const jobData = jobDoc.data();
    if (jobData.postedBy !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view these applications' });
    }

    const snapshot = await db.collection('applications')
      .where('jobId', '==', req.params.jobId)
      .get();

    const apps = [];
    snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /api/applications/my - Get my applications (Volunteer only)
router.get('/my', authMw, async (req, res) => {
  try {
    if (req.user.role !== 'Volunteer') {
      return res.status(403).json({ msg: 'Only volunteers can have applications' });
    }

    const db = admin.firestore();
    const snapshot = await db.collection('applications')
      .where('volunteerId', '==', req.user.id)
      .get();

    const apps = [];
    snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// PATCH /api/applications/:id/status - Update application status (Org only)
router.patch('/:id/status', authMw, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Status must be accepted or rejected' });
    }

    const db = admin.firestore();
    const appRef = db.collection('applications').doc(req.params.id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) return res.status(404).json({ msg: 'Application not found' });
    
    const appData = appDoc.data();
    
    // Check if requester is the org that posted the job
    const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
    if (jobDoc.data().postedBy !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this application' });
    }

    await appRef.update({ status });

    // If accepted, decrement neededVolunteers in the jobs collection
    if (status === 'accepted') {
      const jobRef = db.collection('jobs').doc(appData.jobId);
      const jobDoc = await jobRef.get();
      
      if (jobDoc.exists) {
        const currentNeeded = parseInt(jobDoc.data().neededVolunteers) || 0;
        if (currentNeeded > 0) {
          await jobRef.update({
            neededVolunteers: admin.firestore.FieldValue.increment(-1)
          });
        }
      }
    }

    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
