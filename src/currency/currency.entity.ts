import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('MOEDA')
export class Currency {
  @ApiProperty({ example: 'BTC', description: 'Currency code' })
  @PrimaryColumn({ name: 'codigo' })
  code: string;

  @ApiProperty({ example: 'Bitcoin', description: 'Currency name' })
  @Column({ name: 'nome' })
  name: string;

  @ApiProperty({
    example: 'CRYPTO',
    description: 'Currency type (CRYPTO or FIAT)',
  })
  @Column({ name: 'tipo' })
  type: string; // 'CRYPTO' or 'FIAT'
}
