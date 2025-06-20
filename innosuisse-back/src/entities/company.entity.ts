import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { FundingRound } from './deals.entity';

@Entity('companies')
export class Company {
  @PrimaryColumn()
  @ApiProperty({ description: 'Company code (unique identifier)' })
  code: string;

  @Column()
  @ApiProperty({ description: 'Company title' })
  title: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Industry sector' })
  industry: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Vertical market' })
  vertical: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Canton location' })
  canton: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Spin-offs information' })
  spin_offs: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'City location' })
  city: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Year of establishment' })
  year: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Company highlights' })
  highlights: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Gender of CEO' })
  gender_ceo: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Out of business status' })
  oob: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Funding status' })
  funded: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Additional comments' })
  comment: string;

  @OneToMany(() => FundingRound, (fundingRound) => fundingRound.companyRelation)
  fundingRounds: FundingRound[];
}
