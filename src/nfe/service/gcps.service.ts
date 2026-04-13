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

     // Método para buscar um GCP pelo número da nota fiscal (nf)
     async findByNf(nf: string): Promise<Gcps[]> {
          const registro = await this.gcpsRepository.find({ where: { nf } });

          if(!registro || registro.length === 0) {
               throw new HttpException('Registro não encontrado', HttpStatus.NOT_FOUND);
          }
          
          return registro;
     }

     //Método para buscar pelo nome do cliente
     async findByCliente(cliente: string): Promise<Gcps[]> {
          const registros = await this.gcpsRepository.find({ where: { cliente } });

          if(!registros || registros.length === 0) {
               throw new HttpException('Registro não encontrado', HttpStatus.NOT_FOUND);
          }

          return registros;
     }

}