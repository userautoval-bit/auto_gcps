import { ApiProperty } from "@nestjs/swagger";
import { Usuario } from "src/users/model/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:"tb_controle_financeiro"})
export class Gcps {

  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'date' })
  emissao: Date;

  @ApiProperty()
  @Column({ type: 'date' })
  vencimento: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  recebido_em: Date;

  @ApiProperty()
  @Column({ type: 'varchar', length: 20 })
  nf: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  cliente: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  faturamento: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  v_recebido: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo_pg: string;

  
  @ApiProperty({ type: () => Usuario })  
  @ManyToOne(() => Usuario, (usuario) => usuario.gcps, {
            onDelete: "CASCADE"
        })
  usuario: Usuario

  @JoinColumn({ name: "usuario_id" }) // <-- FORÇA O TYPEORM A USAR O NOME DO BANCO
  usuario: Usuario;

}