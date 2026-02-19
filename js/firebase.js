/**
 * Firebase Realtime Database Integration
 * 
 * Database paths used:
 * - "checkins" - for uploading check-in/game results
 * - "organismState" - for real-time state listening
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, update, onValue, serverTimestamp } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDj-SCNES5gK3YdbOii4nqWvcHETveWJLU",
  authDomain: "machine-learning-9af8d.firebaseapp.com",
  databaseURL: "https://machine-learning-9af8d-default-rtdb.firebaseio.com",
  projectId: "machine-learning-9af8d",
  storageBucket: "machine-learning-9af8d.firebasestorage.app",
  messagingSenderId: "383662638043",
  appId: "1:383662638043:web:1f047cace6353f9ea35dfe",
  measurementId: "G-SMX8YJCX02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Upload a check-in/game result to Firebase
 * @param {Object} params - Check-in data
 * @param {string} params.userId - User ID (or "anon")
 * @param {string} params.gameId - Game identifier
 * @param {number} params.score - Game score
 * @param {Object} params.payload - Additional data object
 * @returns {Promise<string>} The pushed key/reference
 */
export async function uploadCheckin({ userId, gameId, score, payload }) {
  const checkinsRef = ref(db, "checkins");
  const newCheckinRef = push(checkinsRef);
  
  await set(newCheckinRef, {
    userId: userId || "anon",
    gameId: gameId || "unknown",
    score: score || 0,
    payload: payload || {},
    time: Date.now()
  });
  
  return newCheckinRef.key;
}

/**
 * Listen to organismState changes in real-time
 * @param {Function} callback - Called with (data) whenever state changes
 * @returns {Function} Unsubscribe function
 */
export function listenOrganismState(callback) {
  const organismStateRef = ref(db, "organismState");
  
  const unsubscribe = onValue(organismStateRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
  
  return unsubscribe;
}

/**
 * Set/update organismState in Firebase
 * @param {Object} data - State data to set
 * @returns {Promise<void>}
 */
export async function setOrganismState(data) {
  const organismStateRef = ref(db, "organismState");
  await set(organismStateRef, data);
}

