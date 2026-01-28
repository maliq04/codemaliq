import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration, using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Validate Firebase configuration
const isFirebaseConfigValid = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  return requiredFields.every(field => firebaseConfig[field as keyof typeof firebaseConfig]);
};

// Initialize Firebase with error handling
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let realtimeDb: any = null;

try {
  if (isFirebaseConfigValid()) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize services with error handling
    try {
      auth = getAuth(app);
    } catch (error) {
      console.warn('Firebase Auth initialization failed:', error);
    }
    
    try {
      db = getFirestore(app);
    } catch (error) {
      console.warn('Firestore initialization failed:', error);
    }
    
    try {
      storage = getStorage(app);
    } catch (error) {
      console.warn('Firebase Storage initialization failed:', error);
    }
    
    try {
      if (firebaseConfig.databaseURL) {
        realtimeDb = getDatabase(app);
      }
    } catch (error) {
      console.warn('Realtime Database initialization failed:', error);
    }
  } else {
    console.warn('Firebase configuration is incomplete. Some features may not work.');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { app, auth, db, storage, realtimeDb };