const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authMw = require('../middleware/authMw');

// Get Top Issues Analytics
router.get('/top-issues', authMw, async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('issues')
      .where('status', 'in', ['Open', 'In Progress'])
      .get();
      
    let issues = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const upvoteCount = data.upvotes ? data.upvotes.length : 0;
      
      issues.push({
        id: doc.id,
        title: data.title,
        category: data.category,
        status: data.status,
        upvoteCount: upvoteCount,
        location: data.location,
        lng: data.location?.coordinates?.[0],
        lat: data.location?.coordinates?.[1],
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(0)
      });
    });

    // In-memory sort by upvotes (desc) then createdAt (desc)
    issues.sort((a, b) => {
      if (b.upvoteCount !== a.upvoteCount) {
        return b.upvoteCount - a.upvoteCount;
      }
      return b.createdAt - a.createdAt;
    });

    // Limit to top 5
    const topIssues = issues.slice(0, 5);
    res.json(topIssues);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
