import { InjectRepository } from "@nestjs/typeorm";
import { Gcps } from "../model/gcps.entity";
import { Between, ILike, Repository } from "typeorm";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { max, min } from "rxjs";

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

     //Buscar pela data de Recebimento
     async findByRecebido(recebido_em: string): Promise<Gcps[]> {
          let dataParaBusca: string;

          // Verifica se a data está no formato brasileiro (contém "/" e o ano está no fim)
          if (recebido_em.includes('/') && recebido_em.split('/')[2]?.length === 4) {
               const [dia, mes, ano] = recebido_em.split('/');
               dataParaBusca = `${ano}-${mes}-${dia}`;
          } else {
               // Caso já venha no padrão ISO (YYYY-MM-DD) ou com hífen
               dataParaBusca = recebido_em.replace(/\//g, '-');
          }

          const registros = await this.gcpsRepository.find({
               where: {
                    recebido_em: dataParaBusca as any
               }
          });

          if (!registros || registros.length === 0) {
               throw new NotFoundException(`Nenhum registro encontrado para a data: ${recebido_em}`);
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

     // Método para buscar um GCP pelo número da nota fiscal (nf)
     async findByFaturamento(faturamento: number): Promise<Gcps[]> {
          const registro = await this.gcpsRepository.find({
               where: {
                    faturamento: Between(faturamento - 10, faturamento + 100)
               }
          });

          if (!registro) {
               throw new HttpException('Registro não encontrado', HttpStatus.NOT_FOUND);
          }

          return registro;
     }

     // Verificar se um GCP está vencido
     async checkVencimento(nf: string) {
          const registros = await this.gcpsRepository.find({ where: { nf } });

          if (!registros || registros.length === 0) {
               throw new NotFoundException(`Nota Fiscal ${nf} não encontrada.`);
          }

          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas os dias

          return registros.map(item => {
               const dataVencimento = new Date(item.vencimento);
               let status = 'Em dia';
               let diasVencidos = 0;

               // Se não foi recebida e o vencimento é menor que hoje
               if (!item.recebido_em && dataVencimento < hoje) {
                    status = 'Vencida';
                    const diffInMs = hoje.getTime() - dataVencimento.getTime();
                    diasVencidos = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
               } else if (item.recebido_em) {
                    status = 'Recebida';
               }

               return {
                    nf: item.nf,
                    cliente: item.cliente,
                    emissao: item.emissao,
                    vencimento: item.vencimento,
                    recebido_em: item.recebido_em,
                    faturamento: item.faturamento,
                    status: status,
                    dias_vencidos: diasVencidos
               };
          });
     }
}