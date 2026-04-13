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
     async findById(nf: string): Promise<Gcps> {
          const nfe_num = await this.gcpsRepository.findOneBy({ nf });

          if(!nfe_num){
               throw new HttpException(
                    'GCP não encontrado', 
                    HttpStatus.NOT_FOUND
               );
          }
          return nfe_num;
     }

}