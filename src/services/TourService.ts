import admin from "firebase-admin";
import { TourRepository } from "../repositories/TourRepository.js";
import { AppError } from "../shared/AppError.js";

export class TourService {
  constructor(private repo=new TourRepository()){}

  async listPublicTours(status?: string){
    const effective = status ?? "open"; // API-01 default open
    try{
      const rows=await this.repo.listByStatus(effective);
      return rows.map(r=>({
        tourId: r.id,
        title:r.title,
        startDate:r.startDate.toDate().toISOString().slice(0,10),
        endDate:r.endDate.toDate().toISOString().slice(0,10),
        price: r.price ?? null,
        status:r.status,
        thumbnail: r.images?.[0] ?? null // UNKNOWN: API uses thumbnail; ERD uses images[]
      }));
    }catch(e){
      throw new AppError(500,"TOUR_FETCH_FAILED","Không lấy được dữ liệu",e);
    }
  }

  async getTourDetail(tourId: string){
    const t=await this.repo.getById(tourId);
    if(!t) throw new AppError(404,"TOUR_NOT_FOUND","Không tồn tại tour");
    return {
      tourId: t.id, title:t.title,description:t.description,itinerary:t.itinerary,
      startDate:t.startDate.toDate().toISOString().slice(0,10),
      endDate:t.endDate.toDate().toISOString().slice(0,10),
      price:t.price ?? null,status:t.status,images:t.images ?? []
    };
  }

  async adminListTours(){
    // Minimal admin response schema (approved): map to { tourId, title, startDate, endDate, price?, status, thumbnail? }
    const snap = await admin.firestore().collection("tours").get();
    return snap.docs.map(d=>{
      const data = d.data() as any;
      const start = data.startDate?.toDate?.()?.toISOString?.()?.slice(0,10) ?? null;
      const end = data.endDate?.toDate?.()?.toISOString?.()?.slice(0,10) ?? null;
      return {
        tourId: d.id,
        title: data.title ?? null,
        startDate: start,
        endDate: end,
        price: data.price ?? null,
        status: data.status ?? null,
        thumbnail: data.images?.[0] ?? null
      };
    });
  }

  async adminCreateTour(body:any){
    const start=admin.firestore.Timestamp.fromDate(new Date(body.startDate));
    const end=admin.firestore.Timestamp.fromDate(new Date(body.endDate));
    const id=await this.repo.create({
      title:body.title,description:body.description,itinerary:body.itinerary,
      startDate:start,endDate:end,price:body.price,status:body.status,images:body.images
    });
    return { tourId: id };
  }

  async adminUpdateTour(tourId:string, patch:any){
    const p:any={...patch};
    if(typeof p.startDate==="string") p.startDate=admin.firestore.Timestamp.fromDate(new Date(p.startDate));
    if(typeof p.endDate==="string") p.endDate=admin.firestore.Timestamp.fromDate(new Date(p.endDate));
    await this.repo.update(tourId,p);
    return { tourId };
  }

  async adminDeleteTour(tourId:string){
    await this.repo.delete(tourId);
    return { tourId };
  }
}
