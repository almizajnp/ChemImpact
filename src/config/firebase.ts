import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCGGQuFFpy1niUq6pSS7-hUeILLEYhQFjY",
  authDomain: "chemimpact-9c995.firebaseapp.com",
  projectId: "chemimpact-9c995",
  storageBucket: "chemimpact-9c995.firebasestorage.app",
  messagingSenderId: "641738771422",
  appId: "1:641738771422:web:c6756807ddce8c37abeb4f",
  measurementId: "G-5JXDLS42EY",
  databaseURL:
    "https://chemimpact-9c995-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;
