import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}