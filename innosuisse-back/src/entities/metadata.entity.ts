import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryColumn()
  @ApiProperty({ description: 'Unique identifier for the session' })
  session_id: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Session datetime' })
  session_datetime: Date;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Selected role' })
  role_selected: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Selected industry' })
  industry_selected: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Selected region' })
  region_selected: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Selected funding stage' })
  funding_stage_selected: string;
}
