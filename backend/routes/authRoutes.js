const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const authMw = require('../middleware/authMw');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, organizationId } = req.body;
    const db = admin.firestore();

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (!snapshot.empty) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserRef = usersRef.doc();
    const newUserData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'Volunteer',
      organizationId: organizationId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await newUserRef.set(newUserData);

    const payload = { id: newUserRef.id, role: newUserData.role, organizationId: newUserData.organizationId };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: newUserRef.id, name: newUserData.name, role: newUserData.role } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = admin.firestore();

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    let userData;
    let userId;
    snapshot.forEach(doc => {
      userData = doc.data();
      userId = doc.id;
    });

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { id: userId, role: userData.role, organizationId: userData.organizationId };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: userId, name: userData.name, role: userData.role } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get current user
router.get('/me', authMw, async (req, res) => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(req.user.id).get();
    
    if (!userDoc.exists) {
        return res.status(404).json({ msg: 'User not found' });
    }

    const userData = userDoc.data();
    delete userData.password; // Don't return password hash
    
    res.json({ id: userDoc.id, ...userData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
