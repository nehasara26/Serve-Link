const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authMw = require('../middleware/authMw');

// Haversine formula for distance calculation
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

// Get Nearby Organizations
router.get('/nearby', authMw, async (req, res) => {
  try {
    const { lng, lat, radius = 50000 } = req.query; // default radius 50km
    
    if (!lng || !lat) {
      return res.status(400).json({ msg: 'Longitude and latitude required' });
    }

    const db = admin.firestore();
    const snapshot = await db.collection('organizations').get();
    
    let orgs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.location && data.location.coordinates) {
          const orgLng = data.location.coordinates[0];
          const orgLat = data.location.coordinates[1];
          const distance = getDistance(parseFloat(lat), parseFloat(lng), orgLat, orgLng);
          
          if (distance <= parseInt(radius)) {
              orgs.push({ id: doc.id, ...data });
          }
      }
    });

    res.json(orgs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get Org Profile
router.get('/:id', async (req, res) => {
  try {
    const db = admin.firestore();
    const docRef = await db.collection('organizations').doc(req.params.id).get();
    
    if (!docRef.exists) return res.status(404).json({ msg: 'Organization not found' });
    res.json({ id: docRef.id, ...docRef.data() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
