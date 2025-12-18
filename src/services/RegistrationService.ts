import { RegistrationRepository } from "../repositories/RegistrationRepository.js";
import { TourRepository } from "../repositories/TourRepository.js";
import { AppError } from "../shared/AppError.js";

export class RegistrationService{
  constructor(private regRepo=new RegistrationRepository(), private tourRepo=new TourRepository()){}

  async createRegistration(body:{tourId:string;fullName:string;phone:string;email?:string;note?:string;}){
    const tour=await this.tourRepo.getById(body.tourId);
    if(!tour) throw new AppError(404,"TOUR_NOT_FOUND","Không tồn tại tour");
    if(tour.status!=="open") throw new AppError(400,"TOUR_CLOSED","Tour đã đóng");
    try{
      await this.regRepo.create(body);
    }catch(e){
      throw new AppError(500,"REGISTRATION_FAILED","Lưu dữ liệu thất bại",e);
    }
  }

  async adminListRegistrations(tourId:string){
    const rows=await this.regRepo.listByTourId(tourId);
    // API-09 has no response schema in spec (UNKNOWN)
    return rows.map(r=>({
      id:r.id,tourId:r.tourId,fullName:r.fullName,phone:r.phone,
      email:r.email ?? null,note:r.note ?? null,createdAt:r.createdAt.toDate().toISOString()
    }));
  }
}
