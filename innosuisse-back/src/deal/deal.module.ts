import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealService } from './deal.service';
import { DealController } from './deal.controller';
import { FundingRound } from 'src/entities/deals.entity';
import { Company } from 'src/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FundingRound, Company])],
  controllers: [DealController],
  providers: [DealService],
})
export class DealModule {}
