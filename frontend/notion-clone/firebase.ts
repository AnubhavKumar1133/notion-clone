import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDJ6Wt1CeGI1zG9ML56hPrvbbXoF1EtJ4o",
    authDomain: "notion-clone-e4d60.firebaseapp.com",
    projectId: "notion-clone-e4d60",
    storageBucket: "notion-clone-e4d60.firebasestorage.app",
    messagingSenderId: "901715955145",
    appId: "1:901715955145:web:31b9d29611c0384bc36c18"
  };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export {db};