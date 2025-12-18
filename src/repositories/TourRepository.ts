import admin from "firebase-admin";
import { firestore } from "../config/firebase.js";

export type TourDoc = {
  title: string;
  description: string;
  itinerary: string;
  location: string;
  duration: string;
  content: {
    introduction: string;
    schedule: string;
    activities: string;
    suitableFor: string;
    notes: string;
  };
  startDate: admin.firestore.Timestamp;
  endDate: admin.firestore.Timestamp;
  price?: number;
  status: "draft"|"open"|"closed";
  images?: string[];
  createdAt: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
  // adminId?: string; // ERD relation ADMIN(1)-TOUR(N) but field not specified in API Spec (UNKNOWN)
};

export class TourRepository {
  private col = firestore.collection("tours");
  async listByStatus(status: string){
    // Firestore values may have inconsistent casing (OPEN, open).
    // Query in both lowercase and uppercase variants to be resilient.
    const variants = Array.from(new Set([status, status.toLowerCase(), status.toUpperCase()]));
    // If only one variant, use simple equality to avoid 'in' limitations.
    if (variants.length === 1) {
      const snap = await this.col.where("status","==",status).get();
      return snap.docs.map(d=>({ id:d.id, ...(d.data() as TourDoc) }));
    }
    const snap = await this.col.where("status","in",variants).get();
    return snap.docs.map(d=>({ id:d.id, ...(d.data() as TourDoc) }));
  }
  async getById(tourId: string){
    const doc=await this.col.doc(tourId).get();
    return doc.exists ? ({ id: doc.id, ...(doc.data() as TourDoc) }) : null;
  }
  async create(data: Omit<TourDoc,"createdAt"|"updatedAt">){
    const now=admin.firestore.Timestamp.now();
    const ref=await this.col.add({ ...data, createdAt: now });
    return ref.id;
  }
  async update(tourId: string, patch: Partial<TourDoc>){
    const now=admin.firestore.Timestamp.now();
    await this.col.doc(tourId).set({ ...patch, updatedAt: now }, { merge:true });
  }
  async delete(tourId: string){ await this.col.doc(tourId).delete(); }
}
