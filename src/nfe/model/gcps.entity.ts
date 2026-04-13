import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:"tb_controle_financeiro"})
export class Gcps {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  emissao: Date;

  @Column({ type: 'date' })
  vencimento: Date;

  @Column({ type: 'date', nullable: true })
  recebido_em: Date;

  @Column({ type: 'varchar', length: 20 })
  nf: string;

  @Column({ type: 'varchar', length: 255 })
  cliente: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  faturamento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  v_recebido: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo_pg: string;
}