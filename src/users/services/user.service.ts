import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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

    
    // async findByUsuario(usuario: string): Promise<Usuario | undefined> {
    //     return await this.usuarioRepository.findOne({
    //         where: {
    //             usuario: usuario
    //         }
    //     })
    // }

    async findAll(): Promise<Usuario[]> {
        return await this.usuarioRepository.find({

        });
    }

    async findById(id: number): Promise<Usuario> {

        const usuario = await this.usuarioRepository.findOne({
            where: {
                id
            }
        });

        if (!usuario)
            throw new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND);

        return usuario;

    }


}