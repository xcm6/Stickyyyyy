/**
 * Firebase Realtime Database Integration
 * 
 * Database paths used:
 * - "checkins" - for uploading check-in/game results
 * - "organismState" - for real-time state listening
 */

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

// Lazy load Firebase SDK using unpkg CDN
let firebaseModules = null;
let app = null;
let db = null;

async function loadFirebaseModules() {
    if (firebaseModules) return firebaseModules;
    
    try {
        // Use unpkg CDN which supports ES modules
        const [appModule, dbModule] = await Promise.all([
            import('https://unpkg.com/firebase@10.7.1/app/dist/index.esm.js'),
            import('https://unpkg.com/firebase@10.7.1/database/dist/index.esm.js')
        ]);
        
        firebaseModules = {
            initializeApp: appModule.initializeApp,
            getDatabase: dbModule.getDatabase,
            ref: dbModule.ref,
            push: dbModule.push,
            set: dbModule.set,
            update: dbModule.update,
            onValue: dbModule.onValue,
            serverTimestamp: dbModule.serverTimestamp
        };
    } catch (error) {
        console.error('Failed to load Firebase modules:', error);
        throw error;
    }
    
    return firebaseModules;
}

async function initFirebase() {
    if (app && db) return { app, db, modules: firebaseModules };
    
    const modules = await loadFirebaseModules();
    if (!modules) {
        throw new Error('Firebase modules failed to load');
    }
    
    app = modules.initializeApp(firebaseConfig);
    db = modules.getDatabase(app);
    
    return { app, db, modules };
}

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
  const { db, modules } = await initFirebase();
  const { ref, push, set } = modules;
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
 * @returns {Promise<Function>} Unsubscribe function
 */
export async function listenOrganismState(callback) {
  const { db, modules } = await initFirebase();
  const { ref, onValue } = modules;
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
  const { db, modules } = await initFirebase();
  const { ref, set } = modules;
  const organismStateRef = ref(db, "organismState");
  await set(organismStateRef, data);
}
