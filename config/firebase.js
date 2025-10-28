import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'firebase-service-account.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const verifyToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return { valid: true, uid: decodedToken.uid, email: decodedToken.email };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

export default admin;