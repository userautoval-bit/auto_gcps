import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { GcpsService } from "../service/gcps.service";
import { Gcps } from "../model/gcps.entity";
import { ApiTags } from "@nestjs/swagger/dist/decorators/api-use-tags.decorator";
import { ApiOkResponse } from "@nestjs/swagger";

@ApiTags('gcps')
@Controller('gcps')
export class GcpsController {
  constructor(private gcpsService: GcpsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Gcps] }) // Isso faz os campos (emissao, cliente, faturamento) aparecerem no Swagger
  findAll(): Promise<Gcps[]> {
    return this.gcpsService.findAll();
  }


  // Endpoint para buscar um GCP pelo número da nota fiscal (nf)
  @Get(':nf')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Gcps }) // Isso faz os campos (emissao, cliente, faturamento) aparecerem no Swagger
  findById(@Param('nf') nf: string): Promise<Gcps[]> {
    return this.gcpsService.findByNf(nf);
  }

    // Endpoint para buscar um GCP pelo nome do cliente
    @Get(':cliente')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: Gcps }) // Isso faz os campos (emissao, cliente, faturamento) aparecerem no Swagger
    findByCliente(@Param('cliente') cliente: string): Promise<Gcps[]> {
        return this.gcpsService.findByCliente(cliente);
    }


}