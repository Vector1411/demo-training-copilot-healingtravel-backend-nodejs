import admin from "firebase-admin";
import { env } from "./env.js";

export function initFirebase(): admin.app.App {
  if (admin.apps.length) return admin.app();
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return admin.initializeApp({ credential: admin.credential.cert(sa), projectId: env.FIREBASE_PROJECT_ID ?? sa.project_id });
  }
  return admin.initializeApp({ projectId: env.FIREBASE_PROJECT_ID });
}

export const firebaseApp = initFirebase();
export const firestore = admin.firestore(firebaseApp);
export const firebaseAuth = admin.auth(firebaseApp);
