import { InjectRepository } from "@nestjs/typeorm";
import { Gcps } from "../model/gcps.entity";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";

export class GcpsService{

     constructor(
        @InjectRepository(Gcps)
        private gcpsRepository: Repository<Gcps>,
    ){}

      async findAll(): Promise<Gcps[]> {
         return await this.gcpsRepository.find();
     }



//METODOS ESPECIAIS 

     // Método para buscar um GCP por ID
     async findByNf(nf: string): Promise<Gcps[]> {
          return await this.gcpsRepository.find({ where: { nf } });
     }

}