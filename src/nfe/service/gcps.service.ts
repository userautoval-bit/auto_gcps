import { InjectRepository } from "@nestjs/typeorm";
import { Gcps } from "../model/gcps.entity";
import { Between, DeleteResult, ILike, IsNull, Not, Raw, Repository } from "typeorm";
import { HttpException, HttpStatus, NotFoundException, InternalServerErrorException, Injectable } from "@nestjs/common";

@Injectable()
export class GcpsService {

     constructor(
          @InjectRepository(Gcps)
          private gcpsRepository: Repository<Gcps>,
     ) { }


     // Método para buscar todos os GCPs
     async findAll(page: number = 1, limit: number = 5, search?: string, status?: string, valor?: string) {
          
    // 1. Construir a cláusula WHERE dinamicamente
    let onde: any = {};

    // Se houver busca por texto (Cliente ou NF)
    if (search) {
        onde = [
            { cliente: ILike(`%${search}%`) },
            { nf: ILike(`%${search}%`) }
        ];
    }

    // --- NOVO: Lógica para o filtro de VALOR (Faturamento) ---
    if (valor) {
        const valorFormatado = valor.replace(',', '.');
        if (Array.isArray(onde)) {
            // Se já existe um array (por causa do search), adicionamos a condição de valor em cada objeto do OR
            // Nota: Como faturamento é numeric, o ideal no TypeORM é Raw se quiser busca parcial, 
            // mas para manter sua estrutura simples, tentamos converter para string.
            onde = onde.map(condicao => ({
                ...condicao,
                faturamento: Raw((alias) => `CAST(${alias} AS TEXT) ILike :val`, { val: `%${valorFormatado}%` })
            }));
        } else {
            // Se não tem busca por texto, filtramos apenas pelo valor
            onde.faturamento = Raw((alias) => `CAST(${alias} AS TEXT) ILike :val`, { val: `%${valorFormatado}%` });
        }
    }

    // Filtro de Status (Mantendo sua lógica original de mapeamento)
    if (status && status !== 'Todos') {
        const condicaoStatus = status === 'Recebida' ? Not(IsNull()) : IsNull();
        if (Array.isArray(onde)) {
            onde = onde.map(condicao => ({
                ...condicao,
                recebido_em: condicaoStatus
            }));
        } else {
            onde.recebido_em = condicaoStatus;
        }
    }

    // 2. Executar a busca com os filtros
    const [registros, total] = await this.gcpsRepository.findAndCount({
        where: onde,
        relations: { usuario: true },
        order: { emissao: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });

    // 3. Formatar as datas (Mantendo sua lógica de segurança contra fuso horário)
    const registrosFormatados = registros.map(item => {
        return {
            ...item,
            emissao: item.emissao ? new Date(item.emissao).toISOString().split('T')[0] : null,
            vencimento: item.vencimento ? new Date(item.vencimento).toISOString().split('T')[0] : null,
            recebido_em: item.recebido_em ? new Date(item.recebido_em).toISOString().split('T')[0] : null,
        };
    });

    return {
        data: registrosFormatados, 
        total,
        page,
        lastPage: Math.ceil(total / limit),
    };
}
     //para buscar um GCP pelo ID
     async findById(id: number): Promise<Gcps> {
          const registro = await this.gcpsRepository.findOne(
               { 
                    where: 
                    { id },
               relations: { usuario: true } }
          );
          if (!registro) {
               throw new NotFoundException(`Registro com ID ${id} não encontrado.`);
          }
          return registro;
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
          // 1. Validar se o ID foi enviado
          if (!gcpsData.id) {
               throw new HttpException('ID é obrigatório para atualização', HttpStatus.BAD_REQUEST);
          }

          // 2. Verificar se o registro existe pelo ID (e não pela NF)
          const registroExistente = await this.gcpsRepository.findOne({ where: { id: gcpsData.id } });

          if (!registroExistente) {
               throw new NotFoundException(`Registro com ID ${gcpsData.id} não encontrado.`);
          }

          // 3. (OPCIONAL) Se você mudou a NF, verificar se o NOVO número já não está em uso por OUTRA nota
          if (gcpsData.nf !== registroExistente.nf) {
               const nfJaExiste = await this.gcpsRepository.findOne({ where: { nf: gcpsData.nf } });
               if (nfJaExiste) {
                    throw new HttpException('Este novo número de NF já está cadastrado em outra nota.', HttpStatus.BAD_REQUEST);
               }
          }

          // 4. Atualizar os dados
          // O save no TypeORM com ID presente faz o Update automaticamente
          return await this.gcpsRepository.save(gcpsData);
     }

     // Método para deletar um GCP pelo ID
     async delete(id: number): Promise<DeleteResult> {
          await this.findById(id);

          return await this.gcpsRepository.delete(id);
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

// Prevendo o faturamento mensal e total faturado no mês
async findPrevisaoMensal(mes: number, ano: number) {
    // 1. Criar as datas de intervalo para o filtro
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59);

    // 2. BUSCA 1: O que vai VENCER no mês (Sua lógica original que já funciona)
    const registrosVencimento = await this.gcpsRepository.find({
        where: {
            vencimento: Between(dataInicio, dataFim),
            recebido_em: IsNull(), // Mantém apenas o que está pendente
        },
        order: { vencimento: 'ASC' }
    });

    // 3. BUSCA 2: Tudo que foi EMITIDO no mês (Faturamento Bruto / Regime de Competência)
    // Aqui buscamos todas as notas, independente de estarem pagas ou não
    const registrosEmissao = await this.gcpsRepository.find({
        where: {
            emissao: Between(dataInicio, dataFim),
        }
    });

    // 4. Calcular os totalizadores
    const totalPrevisto = registrosVencimento.reduce((sum, item) => sum + Number(item.faturamento), 0);
    
    // Soma do Faturamento Bruto (Baseado na data de emissão)
    const totalFaturadoNoMes = registrosEmissao.reduce((sum, item) => sum + Number(item.faturamento), 0);

    // 5. Retorno completo para o Front-end
    return {
        periodo: `${mes}/${ano}`,
        totalPrevisto: totalPrevisto.toFixed(2),
        totalFaturadoNoMes: totalFaturadoNoMes.toFixed(2), // NOVO DADO
        quantidadeNotas: registrosVencimento.length,
        notas: registrosVencimento.map(item => ({
            nf: item.nf,
            cliente: item.cliente,
            vencimento: item.vencimento,
            faturamento: item.faturamento
        }))
    };
}

     //Método para saber quantidade notas, valores, e pendencia de pagamento para o dashboard
     async getDashboardStats() {
          // 1. TOTAL NFES: Conta apenas números de NF distintos (ignora parcelas repetidas)
          const resTotalNf = await this.gcpsRepository
               .createQueryBuilder("g")
               .select("COUNT(DISTINCT(g.nf))", "total")
               .getRawOne();

          // 2. APROVADAS: Conta parcelas individuais que já foram pagas (recebido_em preenchido)
          const aprovadas = await this.gcpsRepository.count({
               where: { recebido_em: Not(IsNull()) }
          });

          // 3. PENDENTES: Conta parcelas individuais que ainda não foram pagas
          const pendentes = await this.gcpsRepository.count({
               where: { recebido_em: IsNull() }
          });

          // 4. VALOR TOTAL: Soma o faturamento de todas as parcelas no banco
          const resSoma = await this.gcpsRepository
               .createQueryBuilder("g")
               .select("SUM(g.faturamento)", "total")
               .getRawOne();

          return {
               totalNfes: parseInt(resTotalNf.total) || 0,
               aprovadas,
               pendentes,
               valorTotal: parseFloat(resSoma.total) || 0,
          };
     }


     async getRelatorioAnual(ano: number) {
          const dadosRaw = await this.gcpsRepository
               .createQueryBuilder("g")
               .select("EXTRACT(MONTH FROM g.vencimento)", "mes")
               .addSelect("SUM(g.faturamento)", "faturado")
               .addSelect(
                    "SUM(CASE WHEN g.recebido_em IS NOT NULL THEN g.faturamento ELSE 0 END)",
                    "recebido"
               )
               .addSelect(
                    "COUNT(CASE WHEN g.recebido_em IS NULL THEN 1 END)",
                    "qtd_pendente"
               )
               .where("EXTRACT(YEAR FROM g.vencimento) = :ano", { ano })
               .groupBy("mes")
               .orderBy("mes", "ASC")
               .getRawMany();

          // Vamos formatar para garantir que os números venham como números e não strings
          return dadosRaw.map(d => ({
               mes: parseInt(d.mes),
               faturado: parseFloat(d.faturado || 0),
               recebido: parseFloat(d.recebido || 0),
               pendente: parseFloat(d.faturado || 0) - parseFloat(d.recebido || 0),
               quantidadePendentes: parseInt(d.qtd_pendente || 0)
          }));
     }



  // Este é o método que traz o "filme completo" do mês para a nova visualização
async findRelatorioMensalDetalhado(mes: number, ano: number) {
    // 1. Definir o intervalo do mês
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59);

    // 2. Buscar TODOS os registros do intervalo (sem filtrar por recebido_em)
    const notas = await this.gcpsRepository.find({
        where: {
            vencimento: Between(dataInicio, dataFim)
        },
        order: { vencimento: 'ASC' }
    });

    // 3. Calcular os totais baseados no que veio do banco
    const totalFaturado = notas.reduce((acc, n) => acc + Number(n.faturamento), 0);
    const totalRecebido = notas.reduce((acc, n) => acc + (n.recebido_em ? Number(n.faturamento) : 0), 0);
    const totalPendente = totalFaturado - totalRecebido;

    // 4. Retornar o objeto estruturado para o Front
    return {
        busca: { mes, ano },
        totais: {
            faturado: totalFaturado,
            recebido: totalRecebido,
            pendente: totalPendente,
            quantidade: notas.length
        },
        // Retornamos as notas com o campo recebido_em para o Front saber colorir a linha
        notas: notas.map(n => ({
            nf: n.nf,
            emissao: n.emissao,
            cliente: n.cliente,
            vencimento: n.vencimento,
            faturamento: n.faturamento,
            recebido_em: n.recebido_em,
            tipo_pg: n.tipo_pg || "---"
        }))
    };
}


     // Exemplo de lógica para o seu Service
     async buscarDadosPrevisao(mes: number, ano: number) {
          // Query para buscar as notas que VENCEM no mês (Previsão de Caixa)
          const notasVencimento = await this.gcpsRepository
               .createQueryBuilder("g")
               .where("EXTRACT(MONTH FROM g.vencimento) = :mes AND EXTRACT(YEAR FROM g.vencimento) = :ano", { mes, ano })
               .getMany();

          // Query para somar o quanto foi EMITIDO no mês (Faturamento Bruto)
          const faturamentoMes = await this.gcpsRepository
               .createQueryBuilder("g")
               .select("SUM(g.faturamento)", "total")
               .where("EXTRACT(MONTH FROM g.emissao) = :mes AND EXTRACT(YEAR FROM g.emissao) = :ano", { mes, ano })
               .getRawOne();

          return {
               periodo: `${mes}/${ano}`,
               totalPrevisto: notasVencimento.reduce((acc, nota) => acc + nota.faturamento, 0),
               totalFaturadoNoMes: faturamentoMes.total || 0, // O novo dado!
               quantidadeNotas: notasVencimento.length,
               notas: notasVencimento
          };
     }
}

