const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

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

// POST create a new job (no strict auth for demo)
router.post('/', async (req, res) => {
  try {
    const { title, orgName, location, deadline, experienceRequired, description } = req.body;
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

// DELETE a job
router.delete('/:id', async (req, res) => {
  try {
    const db = admin.firestore();
    const docRef = db.collection('jobs').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ msg: 'Job not found' });
    await docRef.delete();
    res.json({ msg: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
