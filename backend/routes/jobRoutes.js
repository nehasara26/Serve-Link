const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authMw = require('../middleware/authMw');

// GET all jobs (Firestore "platform" jobs)
router.get('/', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('jobs').orderBy('createdAt', 'desc').get();
    const jobs = [];
    snapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }));
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET my jobs (Org only)
router.get('/org/me', authMw, async (req, res) => {
  try {
    if (req.user.role !== 'Organization') {
      return res.status(403).json({ msg: 'Only organizations can view their own listings' });
    }
    const db = admin.firestore();
    const snapshot = await db.collection('jobs')
      .where('postedBy', '==', req.user.id)
      .get();
    
    const jobs = [];
    snapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }));
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET single job
router.get('/:id', async (req, res) => {
  try {
    const db = admin.firestore();
    const doc = await db.collection('jobs').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ msg: 'Job not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST create a new job (Org only)
router.post('/', authMw, async (req, res) => {
  try {
    if (req.user.role !== 'Organization') {
      return res.status(403).json({ msg: 'Only organizations can post jobs' });
    }

    const { title, orgName, location, deadline, experienceRequired, description, neededVolunteers } = req.body;
    
    if (!title || !orgName || !location || !deadline) {
      return res.status(400).json({ msg: 'Missing required fields: title, orgName, location, deadline' });
    }

    const db = admin.firestore();
    const docRef = db.collection('jobs').doc();
    const newJob = {
      title,
      orgName,
      location,
      deadline,
      experienceRequired: experienceRequired || false,
      description: description || '',
      neededVolunteers: parseInt(neededVolunteers) || 1,
      postedBy: req.user.id,
      source: 'platform',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await docRef.set(newJob);
    res.status(201).json({ id: docRef.id, ...newJob });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE a job (Org owner only)
router.delete('/:id', authMw, async (req, res) => {
  try {
    const db = admin.firestore();
    const docRef = db.collection('jobs').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ msg: 'Job not found' });
    
    if (doc.data().postedBy !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this job' });
    }

    await docRef.delete();
    res.json({ msg: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
