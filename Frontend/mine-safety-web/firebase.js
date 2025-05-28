import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB0OoogLNyvKdRFFl_NFtbW044Lgr9bQqs",
  databaseURL: "https://minesafety-3b01f-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "minesafety-3b01f",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Sign in with default credentials
const signInWithDefault = async () => {
  try {
    await signInWithEmailAndPassword(auth, 'ineshindeewara@gmail.com', 'inesh112');
    console.log('Successfully signed in with default credentials');
  } catch (error) {
    console.error('Error signing in with default credentials:', error);
  }
};

signInWithDefault(); // <--- This line actually calls the function!

// Enable debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Realtime Database initialized');
  
  // Log database connection status
  const connectedRef = ref(db, '.info/connected');
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      console.log('Connected to Firebase');
    } else {
      console.log('Not connected to Firebase');
    }
  });
}
