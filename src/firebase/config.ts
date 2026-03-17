
'use client';

/**
 * @fileOverview Firebase configuration object.
 * Uses environment variables for the API key to ensure security and flexibility across environments.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "studio-3673070449-f277c.firebaseapp.com",
  projectId: "studio-3673070449-f277c",
  storageBucket: "studio-3673070449-f277c.firebasestorage.app",
  messagingSenderId: "3673070449",
  appId: "1:3673070449:web:531610e238977c0594314c"
};
