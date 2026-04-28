import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { Gcps } from "src/nfe/model/gcps.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";


@Entity({ name: "tb_usuarios" })
export class Usuario {

    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number;

    @IsNotEmpty({ message: "O nome não pode estar vazio" })
    @Column({ length: 100, nullable: false }) // Ajustado para 100 conforme seu SQL
    @ApiProperty()
    nome: string;

    @IsEmail({}, { message: "Formato de e-mail inválido" })
    @IsNotEmpty()
    @Column({ length: 50, nullable: false, unique: true }) // Adicionado UNIQUE e ajustado para 50
    @ApiProperty({ example: "email@email.com.br" })
    username: string;

    @IsNotEmpty()
    @MinLength(8, { message: "A senha deve ter no mínimo 8 caracteres" })
    @Column({ length: 255, nullable: false }) 
    @ApiProperty()
    password: string;

    @CreateDateColumn({ type: 'timestamptz' }) // Faz o mapeamento do created_at automaticamente
    @ApiProperty()
    created_at: Date;

    @ApiProperty() 
    @OneToMany(() => Gcps, (gcps) => gcps.usuario) 
    gcps: Gcps []
}