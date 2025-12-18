import admin from "firebase-admin";
import { TourRepository } from "../repositories/TourRepository.js";
import { AppError } from "../shared/AppError.js";

export class TourService {
  constructor(private repo=new TourRepository()){}

  async listPublicTours(filters?: { status?: string; q?: string; location?: string; minPrice?: number; maxPrice?: number }){
    const effective = filters?.status ?? "open"; // API-01 default open
    try{
      const rows=await this.repo.listByStatus(effective);
      const q = filters?.q?.toLowerCase().trim();
      const location = filters?.location?.toLowerCase().trim();
      const minPrice = filters?.minPrice;
      const maxPrice = filters?.maxPrice;

      let filtered = rows as any[];

      if (location) {
        filtered = filtered.filter(r => {
          const loc = (r as any).location;
          return typeof loc === "string" && loc.toLowerCase().includes(location);
        });
      }

      if (typeof minPrice === "number") {
        filtered = filtered.filter(r => typeof r.price === "number" && (r.price as number) >= minPrice);
      }

      if (typeof maxPrice === "number") {
        filtered = filtered.filter(r => typeof r.price === "number" && (r.price as number) <= maxPrice);
      }

      if (q) {
        filtered = filtered.filter(r => {
          const t: any = r;
          const fields: Array<string | undefined | null> = [
            t.title,
            t.description,
            t.itinerary,
            t.location,
            t.content?.introduction,
            t.content?.schedule,
            t.content?.activities,
            t.content?.suitableFor,
            t.content?.notes
          ];
          return fields.some(v => typeof v === "string" && v.toLowerCase().includes(q));
        });
      }

      const toIso = (v:any)=>{
        try{
          if(!v) return null;
          if(typeof v.toDate === 'function') return v.toDate().toISOString().slice(0,10);
          if(typeof v._seconds === 'number') return new Date(v._seconds*1000).toISOString().slice(0,10);
          if(typeof v === 'string') return new Date(v).toISOString().slice(0,10);
        }catch(_){ }
        return null;
      };
      return filtered.map(r=>({
        tourId: r.id,
        title: r.title,
          location: (r as any).location ?? null,
          duration: (r as any).duration ?? null,
        startDate: toIso(r.startDate),
        endDate: toIso(r.endDate),
        price: r.price ?? null,
        status: (r.status ?? null),
        thumbnail: r.images?.[0] ?? null // UNKNOWN: API uses thumbnail; ERD uses images[]
      }));
    }catch(e){
      throw new AppError(500,"TOUR_FETCH_FAILED","Không lấy được dữ liệu",e);
    }
  }

  async getTourDetail(tourId: string){
    const t=await this.repo.getById(tourId);
    if(!t) throw new AppError(404,"TOUR_NOT_FOUND","Không tồn tại tour");
    const toIso = (v:any)=>{
      try{
        if(!v) return null;
        if(typeof v.toDate === 'function') return v.toDate().toISOString().slice(0,10);
        if(typeof v._seconds === 'number') return new Date(v._seconds*1000).toISOString().slice(0,10);
        if(typeof v === 'string') return new Date(v).toISOString().slice(0,10);
      }catch(_){ }
      return null;
    };
    return {
      tourId: t.id,
      title: t.title,
      description: t.description,
      itinerary: t.itinerary,
      location: (t as any).location ?? null,
      duration: (t as any).duration ?? null,
      content: (t as any).content ?? null,
      startDate: toIso(t.startDate),
      endDate: toIso(t.endDate),
      price: t.price ?? null,
      status: t.status,
      images: t.images ?? []
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
        location: data.location ?? null,
        duration: data.duration ?? null,
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
      title: body.title,
      description: body.description,
      itinerary: body.itinerary,
      location: body.location,
      duration: body.duration,
      content: body.content,
      startDate: start,
      endDate: end,
      price: body.price,
      status: body.status,
      images: body.images
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
