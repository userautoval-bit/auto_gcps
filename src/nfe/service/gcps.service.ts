import { InjectRepository } from "@nestjs/typeorm";
import { Gcps } from "../model/gcps.entity";
import { ILike, Repository } from "typeorm";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";

export class GcpsService {

     constructor(
          @InjectRepository(Gcps)
          private gcpsRepository: Repository<Gcps>,
     ) { }

     async findAll(): Promise<Gcps[]> {
          return await this.gcpsRepository.find();
     }



     //METODOS ESPECIAIS 

     //Buscar pela data de emissão
     async findByEmissao(emissao: string): Promise<Gcps[]> {
          let dataParaBusca: string;

          // Verifica se a data está no formato brasileiro (contém "/" e o ano está no fim)
          if (emissao.includes('/') && emissao.split('/')[2]?.length === 4) {
               const [dia, mes, ano] = emissao.split('/');
               dataParaBusca = `${ano}-${mes}-${dia}`;
          } else {
               // Caso já venha no padrão ISO (YYYY-MM-DD) ou com hífen
               dataParaBusca = emissao.replace(/\//g, '-');
          }

          const registros = await this.gcpsRepository.find({
               where: {
                    emissao: dataParaBusca as any
               }
          });

          if (!registros || registros.length === 0) {
               throw new NotFoundException(`Nenhum registro encontrado para a data: ${emissao}`);
          }

          return registros;
     }

      //Buscar pela data de VEncimento
     async findByVencimento(vencimento: string): Promise<Gcps[]> {
          let dataParaBusca: string;

          // Verifica se a data está no formato brasileiro (contém "/" e o ano está no fim)
          if (vencimento.includes('/') && vencimento.split('/')[2]?.length === 4) {
               const [dia, mes, ano] = vencimento.split('/');
               dataParaBusca = `${ano}-${mes}-${dia}`;
          } else {
               // Caso já venha no padrão ISO (YYYY-MM-DD) ou com hífen
               dataParaBusca = vencimento.replace(/\//g, '-');
          }

          const registros = await this.gcpsRepository.find({
               where: {
                    vencimento: dataParaBusca as any
               }
          });

          if (!registros || registros.length === 0) {
               throw new NotFoundException(`Nenhum registro encontrado para a data: ${vencimento}`);
          }

          return registros;
     }


     // Método para buscar um GCP pelo número da nota fiscal (nf)
     async findByNf(nf: string): Promise<Gcps[]> {
          const registro = await this.gcpsRepository.find({ where: { nf } });

          if (!registro || registro.length === 0) {
               throw new HttpException('Registro não encontrado', HttpStatus.NOT_FOUND);
          }

          return registro;
     }

     //Método para buscar pelo nome do cliente
     async findByCliente(cliente: string): Promise<Gcps[]> {
          const registros = await this.gcpsRepository.find({
               where: {
                    cliente: ILike(`%${cliente}%`) // O ILike faz a mágica da busca parcial
               }
          });

          if (!registros || registros.length === 0) {
               throw new NotFoundException(`Nenhum cliente encontrado com o termo: ${cliente}`);
          }

          return registros;
     }

}