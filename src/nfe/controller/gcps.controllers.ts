import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { GcpsService } from "../service/gcps.service";
import { Gcps } from "../model/gcps.entity";
import { ApiTags } from "@nestjs/swagger/dist/decorators/api-use-tags.decorator";

@ApiTags('gcps')
@Controller('gcps')
export class GcpsController {

    constructor(private gcpsService: GcpsService){}

    @Get()
    @HttpCode(HttpStatus.OK)
    findAll(): Promise<Gcps[]>{
        return this.gcpsService.findAll()
    }
}