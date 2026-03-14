const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authMw = require('../middleware/authMw');
const roleMw = require('../middleware/roleMw');

// Create Survey Template
router.post('/', [authMw, roleMw('Organization', 'Admin')], async (req, res) => {
  try {
    const { title, description, fields } = req.body;
    
    const createdBy = req.user.organizationId;
    if (!createdBy) return res.status(400).json({ msg: 'User not bound to an organization' });

    const db = admin.firestore();
    const docRef = db.collection('surveyTemplates').doc();
    
    const newTemplate = {
      title,
      description,
      createdBy,
      fields,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.set(newTemplate);
    res.json({ id: docRef.id, ...newTemplate });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get Survey Structure
router.get('/:id', async (req, res) => {
  try {
    const db = admin.firestore();
    const docRef = await db.collection('surveyTemplates').doc(req.params.id).get();
    
    if (!docRef.exists) return res.status(404).json({ msg: 'Survey not found' });
    res.json({ id: docRef.id, ...docRef.data() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Submit Survey Response
router.post('/:id/responses', authMw, async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionId, value }
    const db = admin.firestore();
    const docRef = db.collection('surveyResponses').doc();
    
    const newResponse = {
      templateId: req.params.id,
      submittedBy: req.user ? req.user.id : null,
      answers,
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.set(newResponse);
    res.json({ id: docRef.id, ...newResponse });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get Survey Responses
router.get('/:id/responses', [authMw, roleMw('Organization', 'Admin')], async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('surveyResponses').where('templateId', '==', req.params.id).get();
    
    let responses = [];
    snapshot.forEach(doc => {
      responses.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
