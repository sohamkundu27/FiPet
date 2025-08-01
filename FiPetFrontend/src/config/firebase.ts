import { initializeApp } from '@firebase/app';
import { getReactNativePersistence, initializeAuth, connectAuthEmulator } from '@firebase/auth';
import { getFirestore, connectFirestoreEmulator } from '@firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDh1F64AeCS_xzkgATynBu4K4xOEIi1mns",
  authDomain: "fipet-521d1.firebaseapp.com",
  projectId: "fipet-521d1",
  storageBucket: "fipet-521d1.firebasestorage.app",
  messagingSenderId: "365751870741",
  appId: "1:365751870741:web:a0afa3d48256677627751c",
  measurementId: "G-S8BFBHYL8B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
if (process.env.EXPO_PUBLIC_USE_EMULATOR === "true") {
  connectAuthEmulator(auth, `http://${process.env.EXPO_PUBLIC_EMULATOR_IP}:9099`);
}

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
if (process.env.EXPO_PUBLIC_USE_EMULATOR === "true") {
  connectFirestoreEmulator(db, process.env.EXPO_PUBLIC_EMULATOR_IP as string, 8080);
}

export { auth, db };
