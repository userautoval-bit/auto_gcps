import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, Query } from "@nestjs/common";
import { GcpsService } from "../service/gcps.service";
import { Gcps } from "../model/gcps.entity";
import { ApiTags } from "@nestjs/swagger/dist/decorators/api-use-tags.decorator";
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery } from "@nestjs/swagger";

@ApiTags('gcps')
@Controller('gcps')
export class GcpsController {
    constructor(private gcpsService: GcpsService) { }

    // Endpoint para buscar todos os GCPs com paginação
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: [Gcps] })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiQuery({ name: 'search', required: false }) // Swagger
    @ApiQuery({ name: 'status', required: false }) // Swagger
    findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,   // Captura o search
        @Query('status') status?: string    // Captura o status
    ): Promise<any> {
        return this.gcpsService.findAll(
            Number(page),
            Number(limit),
            search,
            status
        );
    }

    // Endpoint para obter estatísticas do dashboard (quantidade total, vencidas, próximas a vencer)
    @Get('stats')
    async getStats() {
        return await this.gcpsService.getDashboardStats();
    }

    // Endpoint para buscar um GCP pelo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findById(@Param('id', ParseIntPipe) id: number): Promise<Gcps> {
        return this.gcpsService.findById(id);
    }


    // Endpoint para criar um novo GCP
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() gcpsData: Gcps): Promise<Gcps> {
        return await this.gcpsService.create(gcpsData);
    }

    // Endpoint para atualizar um GCP existente
    @Put('/atualizar')
    @HttpCode(HttpStatus.OK)
    async update(@Body() gcpsData: Gcps): Promise<Gcps> {
        return this.gcpsService.updateGCPS(gcpsData)
    }

    // Endpoint para deletar um GCP pelo ID
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.gcpsService.delete(id);
    }

    //***  ESPECIAIS ***/
    //Endpoint Espeiais 
    //buscar por data de emissão
    @Get('emissao/:emissao')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: Gcps })
    findByEmissao(@Param('emissao') emissao: string): Promise<Gcps[]> {
        const dataEmissao = new Date(emissao);
        return this.gcpsService.findByEmissao(emissao);
    }

    //buscar por data de vencimento
    @Get('vencimento/:vencimento')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: Gcps })
    findByVencimento(@Param('vencimento') vencimento: string): Promise<Gcps[]> {
        const dataVencimento = new Date(vencimento);
        return this.gcpsService.findByVencimento(vencimento);
    }

    //buscar por data de Recebimento
    @Get('recebido/:recebido_em')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: Gcps })
    findByRecebido(@Param('recebido_em') recebido_em: string): Promise<Gcps[]> {
        const dataRecebido = new Date(recebido_em);
        return this.gcpsService.findByRecebido(recebido_em);
    }


    // Endpoint para buscar um GCP pelo número da nota fiscal (nf)
    @Get('nf/:nf')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: Gcps }) // Isso faz os campos (emissao, cliente, faturamento) aparecerem no Swagger
    findByNf(@Param('nf') nf: string): Promise<Gcps[]> {
        return this.gcpsService.findByNf(nf);
    }

    // Endpoint para buscar um GCP pelo nome do cliente
    @Get('cliente/:cliente')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: Gcps })
    findByCliente(@Param('cliente') cliente: string): Promise<Gcps[]> {
        return this.gcpsService.findByCliente(cliente);
    }

    // Endpoint para buscar um GCP pelo nome do cliente
    @Get('faturamento/:faturamento')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: Gcps })
    findByFaturamento(@Param('faturamento') faturamento: number): Promise<Gcps[]> {
        return this.gcpsService.findByFaturamento(faturamento);
    }


    //Verificar se um GCP está vencido
    @Get('status-vencimento/:nf')
    @ApiOkResponse({ description: 'Retorna o status de vencimento da nota' })
    async getStatusVencimento(@Param('nf') nf: string) {
        return await this.gcpsService.checkVencimento(nf);
    }

    // Endpoint para buscar notas vencidas (não recebidas e com vencimento anterior a hoje)
    @Get('relatorio/vencidas')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    async getVencidas(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        // Convertemos para garantir que sejam números
        return await this.gcpsService.findVencidas(Number(page), Number(limit));
    }


    // Endpoint para prever o faturamento mensal
    @Get('relatorio/previsao')
    @ApiQuery({ name: 'mes', example: 5 })
    @ApiQuery({ name: 'ano', example: 2026 })
    async getPrevisao(
        @Query('mes') mes: string,
        @Query('ano') ano: string
    ) {
        return await this.gcpsService.findPrevisaoMensal(Number(mes), Number(ano));
    }

    @Get('relatorio/anual/:ano')
    @ApiOperation({ summary: 'Retorna estatísticas mensais de um ano específico' })
    async getRelatorioAnual(@Param('ano', ParseIntPipe) ano: number) {
        return await this.gcpsService.getRelatorioAnual(ano);
    }

    @Get('relatorio/detalhado/:mes/:ano')
async getRelatorioDetalhado(
  @Param('mes', ParseIntPipe) mes: number,
  @Param('ano', ParseIntPipe) ano: number
) {
  return await this.gcpsService.findRelatorioMensalDetalhado(mes, ano);
}

}