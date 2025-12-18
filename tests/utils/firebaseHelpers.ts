import admin from 'firebase-admin';
import fetch from 'node-fetch';

export async function signInWithPassword(apiKey: string, email: string, password: string){
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  if(!res.ok) throw new Error('Sign-in failed');
  return await res.json();
}

export async function ensureAdminDoc(firestore: any, uid: string, email: string){
  const now = admin.firestore.Timestamp.now();
  await firestore.collection('admins').doc(uid).set({ email, role: 'admin', createdAt: now });
}

export async function deleteDocsByQuery(firestore: any, collection: string, field: string, op: any, value: any){
  const snap = await firestore.collection(collection).where(field, op, value).get();
  const batch = firestore.batch();
  snap.docs.forEach((d:any)=> batch.delete(d.ref));
  await batch.commit();
}

export async function deleteDocById(firestore: any, collection: string, id: string){
  await firestore.collection(collection).doc(id).delete();
}
