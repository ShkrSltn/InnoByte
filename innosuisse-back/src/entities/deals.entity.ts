import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('deals')
export class FundingRound {
  @PrimaryColumn()
  @ApiProperty({ description: 'Unique identifier for the funding round' })
  id: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Investors involved' })
  investors: string;

  @Column({ type: 'numeric', nullable: true })
  @ApiProperty({ description: 'Amount of funding' })
  amount: number;

  @Column({ type: 'numeric', nullable: true })
  @ApiProperty({ description: 'Company valuation' })
  valuation: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Additional comments' })
  comment: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'URL with information about the funding round' })
  url: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Whether information is confidential' })
  confidential: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Whether amount is confidential' })
  amount_confidential: boolean;

  @Column({ type: 'date', nullable: true })
  @ApiProperty({ description: 'Date of the funding round' })
  date_of_the_funding_round: Date;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Type of funding' })
  type: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Phase of funding' })
  phase: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Canton where funding occurred' })
  canton: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Related company name' })
  company: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Gender of CEO' })
  gender_ceo: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Company code reference' })
  company_code: string;

  @ManyToOne(() => Company, (company) => company.fundingRounds)
  @JoinColumn({ name: 'company_code', referencedColumnName: 'code' })
  companyRelation: Company;
}
