import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { FundingRound } from '../entities/deals.entity';
import { Company } from '../entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, FundingRound])],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
