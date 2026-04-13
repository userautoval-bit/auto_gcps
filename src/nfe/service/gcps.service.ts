import { InjectRepository } from "@nestjs/typeorm";
import { Gcps } from "../model/gcps.entity";
import { Repository } from "typeorm";

export class GcpsService{

     constructor(
        @InjectRepository(Gcps)
        private gcpsRepository: Repository<Gcps>,
    ){}

         findAll(): Promise<Gcps[]> {
         throw new Error("Method not implemented.");
     }


}