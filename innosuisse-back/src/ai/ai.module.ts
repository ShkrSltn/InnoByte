import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';
import { FundingRound } from '../entities/deals.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, FundingRound])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
