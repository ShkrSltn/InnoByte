import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/entities/company.entity';
import { FundingRound } from 'src/entities/deals.entity';
import { Repository } from 'typeorm';

interface DealData {
  companyName: string;
  investors: string;
  amount: number;
  phase: string;
  canton: string;
  industry: string;
  date: Date;
}

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(FundingRound)
    private fundingRoundRepository: Repository<FundingRound>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async getUniqueIndustries(): Promise<string[]> {
    const companies = await this.companyRepository
      .createQueryBuilder('company')
      .select('DISTINCT company.industry')
      .where('company.industry IS NOT NULL')
      .andWhere("company.industry != ''")
      .orderBy('company.industry')
      .getRawMany();

    return companies.map((item) => item.industry);
  }

  async getUniqueCantons(): Promise<string[]> {
    const deals = await this.fundingRoundRepository
      .createQueryBuilder('deal')
      .select('DISTINCT deal.canton')
      .where('deal.canton IS NOT NULL')
      .andWhere("deal.canton != ''")
      .orderBy('deal.canton')
      .getRawMany();

    return deals.map((item) => item.canton);
  }

  async getUniquePhases(): Promise<string[]> {
    const deals = await this.fundingRoundRepository
      .createQueryBuilder('deal')
      .select('DISTINCT deal.phase')
      .where('deal.phase IS NOT NULL')
      .andWhere("deal.phase != ''")
      .orderBy('deal.phase')
      .getRawMany();

    return deals.map((item) => item.phase);
  }

  async getUniqueYears(): Promise<number[]> {
    const deals = await this.fundingRoundRepository
      .createQueryBuilder('deal')
      .select('EXTRACT(YEAR FROM deal.date_of_the_funding_round) as year')
      .where('deal.date_of_the_funding_round IS NOT NULL')
      .orderBy('year')
      .distinct(true)
      .getRawMany();

    return deals.map((item) => parseInt(item.year, 10));
  }

  async getAllDealsData(): Promise<DealData[]> {
    const deals = await this.fundingRoundRepository
      .createQueryBuilder('deal')
      .leftJoin('deal.companyRelation', 'company')
      .select([
        'company.title as "companyName"',
        'deal.investors as "investors"',
        'deal.amount as "amount"',
        'deal.phase as "phase"',
        'deal.canton as "canton"',
        'company.industry as "industry"',
        'deal.date_of_the_funding_round as "date"',
      ])
      .getRawMany();

    return deals.map((deal) => ({
      companyName: deal.companyName || '',
      investors: deal.investors || '',
      amount: deal.amount ? parseFloat(deal.amount) : 0,
      phase: deal.phase || '',
      canton: deal.canton || '',
      industry: deal.industry || '',
      date: deal.date,
    }));
  }

  async findDealsByFilters(filters: {
    industries?: string[];
    cantons?: string[];
    phases?: string[];
    yearFrom?: number;
    yearTo?: number;
  }) {
    const queryBuilder = this.fundingRoundRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.companyRelation', 'company');

    if (filters.industries && filters.industries.length > 0) {
      queryBuilder.andWhere('company.industry IN (:...industries)', {
        industries: filters.industries,
      });
    }

    if (filters.cantons && filters.cantons.length > 0) {
      queryBuilder.andWhere('deal.canton IN (:...cantons)', {
        cantons: filters.cantons,
      });
    }

    if (filters.phases && filters.phases.length > 0) {
      queryBuilder.andWhere('deal.phase IN (:...phases)', {
        phases: filters.phases,
      });
    }

    if (filters.yearFrom || filters.yearTo) {
      if (filters.yearFrom && !filters.yearTo) {
        queryBuilder.andWhere(
          'EXTRACT(YEAR FROM deal.date_of_the_funding_round) >= :yearFrom',
          {
            yearFrom: filters.yearFrom,
          },
        );
      } else if (!filters.yearFrom && filters.yearTo) {
        queryBuilder.andWhere(
          'EXTRACT(YEAR FROM deal.date_of_the_funding_round) <= :yearTo',
          {
            yearTo: filters.yearTo,
          },
        );
      } else if (filters.yearFrom && filters.yearTo) {
        queryBuilder.andWhere(
          'EXTRACT(YEAR FROM deal.date_of_the_funding_round) BETWEEN :yearFrom AND :yearTo',
          {
            yearFrom: filters.yearFrom,
            yearTo: filters.yearTo,
          },
        );
      }
    }

    const deals = await queryBuilder.getMany();

    return {
      totalDeals: deals.length,
      deals: deals,
    };
  }
}
