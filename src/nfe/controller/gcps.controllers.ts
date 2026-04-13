import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { GcpsService } from "../service/gcps.service";
import { Gcps } from "../model/gcps.entity";
import { ApiTags } from "@nestjs/swagger/dist/decorators/api-use-tags.decorator";
import { ApiOkResponse } from "@nestjs/swagger";

@ApiTags('gcps')
@Controller('gcps')
export class GcpsController {
    constructor(private gcpsService: GcpsService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: [Gcps] }) // Isso faz os campos (emissao, cliente, faturamento) aparecerem no Swagger
    findAll(): Promise<Gcps[]> {
        return this.gcpsService.findAll();
    }


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
    findById(@Param('nf') nf: string): Promise<Gcps[]> {
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

}