const express = require('express');
const router = express.Router({ mergeParams: true });
const admin = require('firebase-admin');

// GET comments for an issue
router.get('/:issueId', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db
      .collection('comments')
      .where('issueId', '==', req.params.issueId)
      .orderBy('createdAt', 'asc')
      .get();

    const comments = [];
    snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST a new comment for an issue
router.post('/:issueId', async (req, res) => {
  try {
    const { username, text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ msg: 'Comment text is required' });
    }

    const db = admin.firestore();
    const docRef = db.collection('comments').doc();
    const newComment = {
      issueId: req.params.issueId,
      username: username ? username.trim() : 'Anonymous',
      text: text.trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await docRef.set(newComment);
    res.status(201).json({ id: docRef.id, ...newComment });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
