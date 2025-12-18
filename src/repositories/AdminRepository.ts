import admin from "firebase-admin";
import { firestore } from "../config/firebase.js";

export type AdminDoc = {
  email: string;
  passwordHash: string;
  role: "admin";
  createdAt: admin.firestore.Timestamp;
  lastLoginAt?: admin.firestore.Timestamp;
};

export class AdminRepository {
  private col=firestore.collection("admins");
  async findById(adminId: string){
    const doc=await this.col.doc(adminId).get();
    return doc.exists ? ({ id: doc.id, ...(doc.data() as AdminDoc) }) : null;
  }
  async findByEmail(email: string){
    const snap=await this.col.where("email","==",email).limit(1).get();
    if(snap.empty) return null;
    const d=snap.docs[0];
    return { id:d.id, ...(d.data() as AdminDoc) };
  }
  async touchLastLogin(adminId: string){
    await this.col.doc(adminId).set({ lastLoginAt: admin.firestore.Timestamp.now() }, { merge:true });
  }
}
