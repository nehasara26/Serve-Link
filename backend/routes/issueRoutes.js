const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authMw = require('../middleware/authMw');
const roleMw = require('../middleware/roleMw');

// Create Issue
router.post('/', authMw, async (req, res) => {
  try {
    const { title, description, category, imageUrl, lng, lat } = req.body;
    
    if (!title || !description || !category || !lng || !lat) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const db = admin.firestore();
    const docRef = db.collection('issues').doc();
    
    const newIssue = {
      title,
      description,
      category,
      imageUrl: imageUrl || null,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      reportedBy: req.user.id,
      status: 'Open',
      upvotes: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.set(newIssue);
    res.json({ id: docRef.id, ...newIssue });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get Issues
router.get('/', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('issues').orderBy('createdAt', 'desc').get();
    
    let issues = [];
    snapshot.forEach(doc => {
        issues.push({ id: doc.id, ...doc.data() });
    });
    res.json(issues);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get single issue
router.get('/:id', async (req, res) => {
  try {
    const db = admin.firestore();
    const docRef = await db.collection('issues').doc(req.params.id).get();
    
    if (!docRef.exists) return res.status(404).json({ msg: 'Issue not found' });
    res.json({ id: docRef.id, ...docRef.data() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update status
router.put('/:id/status', [authMw, roleMw('Organization', 'Admin')], async (req, res) => {
  try {
    const { status } = req.body;
    const db = admin.firestore();
    const docRef = db.collection('issues').doc(req.params.id);
    
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ msg: 'Issue not found' });

    await docRef.update({ status });
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Toggle Upvote
router.post('/:id/upvote', authMw, async (req, res) => {
  try {
    const db = admin.firestore();
    const docRef = db.collection('issues').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) return res.status(404).json({ msg: 'Issue not found' });

    const data = doc.data();
    let upvotes = data.upvotes || [];

    if (upvotes.includes(req.user.id)) {
      upvotes = upvotes.filter(id => id !== req.user.id);
    } else {
      upvotes.push(req.user.id);
    }

    await docRef.update({ upvotes });
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
