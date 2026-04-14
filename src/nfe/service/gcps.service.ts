import { InjectRepository } from "@nestjs/typeorm";
import { Gcps } from "../model/gcps.entity";
import { Between, ILike, IsNull, Repository } from "typeorm";
import { HttpException, HttpStatus, NotFoundException, InternalServerErrorException, Injectable } from "@nestjs/common";


export class GcpsService {

     constructor(
          @InjectRepository(Gcps)
          private gcpsRepository: Repository<Gcps>,
     ) { }

     // Método para buscar todos os GCPs
     async findAll(page: number = 1, limit: number = 10) {
          const [registros, total] = await this.gcpsRepository.findAndCount({
               order: { emissao: 'ASC' }, // Mostra os mais antigos primeiro
               skip: (page - 1) * limit,
               take: limit,
          });

          return {
               data: registros,
               total,
               page,
               lastPage: Math.ceil(total / limit),
          };
     }


     //Método para criar um novo GCP
     async create(gcpsData: Gcps): Promise<Gcps> {
          const buscarRegistro = await this.gcpsRepository.findOne({ where: { nf: gcpsData.nf } });

          if (buscarRegistro) {
               throw new HttpException('Já existe um registro com essa NF', HttpStatus.BAD_REQUEST);
          }
          const novoRegistro = this.gcpsRepository.create(gcpsData);
          return this.gcpsRepository.save(novoRegistro);
     }


     //Método para editar um GCP existente com o PATCH
   async updateGCPS(gcpsData: Gcps): Promise<Gcps> {
          await this.findByNf(gcpsData.nf); 
          
          if(gcpsData.id  === undefined || gcpsData.id === null ) {
               throw new HttpException('ID é obrigatório para atualização', HttpStatus.BAD_REQUEST);
          }
          await this.gcpsRepository.update({ id: gcpsData.id }, gcpsData);      

          return this.gcpsRepository.save( gcpsData);
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
          const registro = await this.gcpsRepository.find({
               where: { nf }
          });

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
               where: { faturamento }
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

     // Método para buscar notas vencidas (não recebidas e com vencimento anterior a hoje)
     async findVencidas(page: number = 1, limit: number = 10) {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          // Criamos o QueryBuilder para buscar apenas notas não recebidas e vencidas
          const queryBuilder = this.gcpsRepository.createQueryBuilder('gcps')
               .where('gcps.recebido_em IS NULL')
               .andWhere('gcps.vencimento < :hoje', { hoje })
               .orderBy('gcps.vencimento', 'ASC') // As mais antigas primeiro
               .skip((page - 1) * limit)
               .take(limit);

          const [registros, total] = await queryBuilder.getManyAndCount();

          // Mapeamos para incluir o cálculo de dias vencidos
          const data = registros.map(item => {
               const dataVencimento = new Date(item.vencimento);
               const diffInMs = hoje.getTime() - dataVencimento.getTime();
               const diasVencidos = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

               return {
                    nf: item.nf,
                    cliente: item.cliente,
                    emissao: item.emissao,
                    vencimento: item.vencimento,
                    faturamento: item.faturamento,
                    status: 'Vencida',
                    dias_vencidos: diasVencidos
               };
          });

          return {
               data,
               total,
               page,
               lastPage: Math.ceil(total / limit)
          };
     }

     //Prevendo o faturamento mensal (total previsto para um mês/ano específico, considerando apenas os registros que ainda não foram recebidos)
     async findPrevisaoMensal(mes: number, ano: number) {
          // 1. Criar a data de início: dia 01 do mês e ano escolhidos
          const dataInicio = new Date(ano, mes - 1, 1);

          // 2. Criar a data de fim: dia 01 do PRÓXIMO mês, menos 1 milisegundo (gera o último dia do mês atual)
          const dataFim = new Date(ano, mes, 0, 23, 59, 59);

          const registros = await this.gcpsRepository.find({
               where: {
                    vencimento: Between(dataInicio, dataFim),
                    recebido_em: IsNull(), // Opcional: Remova se quiser ver TUDO (pagos e não pagos)
               },
               order: { vencimento: 'ASC' }
          });

          // 3. Calcular o totalizador
          const totalPrevisto = registros.reduce((sum, item) => sum + Number(item.faturamento), 0);

          return {
               periodo: `${mes}/${ano}`,
               totalPrevisto: totalPrevisto.toFixed(2),
               quantidadeNotas: registros.length,
               notas: registros.map(item => ({
                    nf: item.nf,
                    cliente: item.cliente,
                    vencimento: item.vencimento,
                    faturamento: item.faturamento
               }))
          };
     }
}