import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario } from "../model/user.entity";



@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
        //private bcrypt: Bcrypt
    ) { }

async findAll(): Promise<Usuario[]> {
        return await this.usuarioRepository.find({
    
        });
    }

}