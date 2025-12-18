import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { env } from "./env.js";

export function initFirebase(): admin.app.App {
  if (admin.apps.length) return admin.app();

  // 1) Environment-provided service account JSON (recommended for CI/servers)
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.info('[firebase] init from FIREBASE_SERVICE_ACCOUNT_JSON env var');
    return admin.initializeApp({ credential: admin.credential.cert(sa), projectId: env.FIREBASE_PROJECT_ID ?? sa.project_id });
  }

  // 2) Local well-known file in repo root (developer convenience)
  try {
    const candidate = path.resolve(process.cwd(), 'fir-github-copilot-training-firebase-adminsdk-fbsvc-c97b2d5b63.json');
    if (fs.existsSync(candidate)) {
      console.info('[firebase] init from local service account file', candidate);
      const raw = fs.readFileSync(candidate, 'utf-8');
      const sa = JSON.parse(raw);
      return admin.initializeApp({ credential: admin.credential.cert(sa), projectId: env.FIREBASE_PROJECT_ID ?? sa.project_id });
    }
  } catch (e) {
    console.warn('[firebase] failed to initialize from local file', e);
    // fallthrough to try other initialization methods
  }

  // 3) If a project ID is provided, try initializing without explicit credentials
  if (env.FIREBASE_PROJECT_ID) return admin.initializeApp({ projectId: env.FIREBASE_PROJECT_ID });

  // 4) Last resort: let Firebase SDK try Application Default Credentials
  console.info('[firebase] init default (ADC)');
  return admin.initializeApp();
}

export const firebaseApp = initFirebase();
export const firestore = admin.firestore(firebaseApp);
export const firebaseAuth = admin.auth(firebaseApp);
