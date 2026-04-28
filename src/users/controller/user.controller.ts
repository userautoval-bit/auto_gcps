import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsuarioService } from "../services/user.service";
import { Usuario } from "../model/user.entity";
 
@ApiTags('Usuario')
@Controller("/usuarios")
export class UsuarioController{
 
    constructor(private readonly usuarioService: UsuarioService){ }

    @Get('/all')
    @HttpCode(HttpStatus.OK)
    findAll(): Promise<Usuario[]>{
        return this.usuarioService.findAll();
    }

}