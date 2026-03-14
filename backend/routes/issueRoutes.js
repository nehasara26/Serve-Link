const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authMw = require('../middleware/authMw');

// Optional auth middleware - doesn't block if no token
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return next();
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret');
    req.user = decoded;
  } catch (err) {
    // Invalid token — continue without user
  }
  next();
};

// Create Issue (auth optional — uses reporterName from body as fallback)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { title, description, category, imageUrl, lng, lat, mentionedOrg, reporterName } = req.body;

    if (!title || !description) {
      return res.status(400).json({ msg: 'Title and description are required' });
    }

    const db = admin.firestore();
    const docRef = db.collection('issues').doc();

    const newIssue = {
      title,
      description,
      category: category || 'General',
      imageUrl: imageUrl || null,
      location: (lng && lat) ? {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      } : null,
      mentionedOrg: mentionedOrg || null,
      reportedBy: req.user ? req.user.id : null,
      reporterName: req.user ? null : (reporterName || 'Anonymous'),
      status: 'Open',
      upvotes: [],
      upvoteCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.set(newIssue);
    res.status(201).json({ id: docRef.id, ...newIssue });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get all issues — sorted by upvoteCount descending
router.get('/', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('issues').orderBy('upvoteCount', 'desc').get();

    const issues = [];
    snapshot.forEach(doc => issues.push({ id: doc.id, ...doc.data() }));
    res.json(issues);
  } catch (err) {
    // Fallback: if index not ready yet, fetch without ordering
    try {
      const db = admin.firestore();
      const snapshot = await db.collection('issues').get();
      const issues = [];
      snapshot.forEach(doc => issues.push({ id: doc.id, ...doc.data() }));
      issues.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
      res.json(issues);
    } catch (err2) {
      console.error(err2);
      res.status(500).send('Server Error');
    }
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

// Update status (Organization/Admin only)
router.put('/:id/status', authMw, async (req, res) => {
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

// Toggle Upvote (anonymous-friendly: uses session key or IP-based key for demo)
router.post('/:id/upvote', async (req, res) => {
  try {
    const db = admin.firestore();
    const docRef = db.collection('issues').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ msg: 'Issue not found' });

    const data = doc.data();
    // Use a voter identifier: authenticated user id OR a clientKey from body
    const jwt = require('jsonwebtoken');
    let voterId = null;
    const authHeader = req.header('Authorization');
    if (authHeader) {
      try {
        const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret');
        voterId = decoded.id;
      } catch (_) {}
    }
    if (!voterId) voterId = req.body.clientKey || 'anon';

    let upvotes = data.upvotes || [];
    let upvoteCount = data.upvoteCount || 0;

    if (upvotes.includes(voterId)) {
      upvotes = upvotes.filter(id => id !== voterId);
      upvoteCount = Math.max(0, upvoteCount - 1);
    } else {
      upvotes.push(voterId);
      upvoteCount += 1;
    }

    await docRef.update({ upvotes, upvoteCount });
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
