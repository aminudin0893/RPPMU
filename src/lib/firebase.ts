import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Connectivity check as per skill
async function testConnection() {
  try {
    // Try to get a non-existent doc just to check connectivity
    await getDocFromServer(doc(db, '_internal_', 'probe'));
    console.log("Firebase initialized and reachable.");
  } catch (error: any) {
    console.warn("Firebase Probe:", error.message);
    if (error.message.includes('the client is offline') || error.message.includes('failed-precondition')) {
      console.error("Firebase connection issue: Please ensure Firestore is enabled in Native Mode in your GCP project.");
    }
  }
}
testConnection();
