const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('C:\\Users\\Tahseen Zakir\\Desktop\\hack europa\\Serve-Link\\backend\\serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkData() {
  console.log('--- JOBS ---');
  const jobs = await db.collection('jobs').get();
  jobs.forEach(doc => console.log(doc.id, ':', doc.data().title, 'by', doc.data().postedBy));

  console.log('\n--- APPLICATIONS ---');
  const apps = await db.collection('applications').get();
  apps.forEach(doc => console.log(doc.id, 'job:', doc.data().jobId, 'vol:', doc.data().volunteerId, 'status:', doc.data().status));

  process.exit(0);
}

checkData().catch(console.error);
