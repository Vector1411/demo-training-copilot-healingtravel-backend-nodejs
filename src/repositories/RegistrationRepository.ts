import admin from "firebase-admin";
import { firestore } from "../config/firebase.js";

export type RegistrationDoc = {
  tourId: string;
  fullName: string;
  phone: string;
  email?: string;
  note?: string;
  createdAt: admin.firestore.Timestamp;
};

export class RegistrationRepository {
  private col = firestore.collection("registrations");
  async create(data: Omit<RegistrationDoc,"createdAt">){
    const now=admin.firestore.Timestamp.now();
    const ref=await this.col.add({ ...data, createdAt: now });
    return ref.id;
  }
  async listByTourId(tourId: string){
    const snap=await this.col.where("tourId","==",tourId).get();
    return snap.docs.map(d=>({ id:d.id, ...(d.data() as RegistrationDoc) }));
  }
  async listAll(){
    const snap=await this.col.get();
    return snap.docs.map(d=>({ id:d.id, ...(d.data() as RegistrationDoc) }));
  }
}
