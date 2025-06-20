import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async getCompaniesByCantonAndYearRange(
    canton: string,
    startYear: number,
    endYear: number,
  ) {
    const companies = await this.companyRepository.find({
      where: {
        canton,
        year: Between(startYear, endYear),
      },
    });

    return companies;
  }

  async getCompaniesCountByYear(
    canton: string,
    startYear: number,
    endYear: number,
  ) {
    const companies = await this.getCompaniesByCantonAndYearRange(
      canton,
      startYear,
      endYear,
    );

    const companiesByYear = {};

    for (let year = startYear; year <= endYear; year++) {
      companiesByYear[year] = 0;
    }

    companies.forEach((company) => {
      if (
        company.year &&
        company.year >= startYear &&
        company.year <= endYear
      ) {
        companiesByYear[company.year]++;
      }
    });

    const result = Object.entries(companiesByYear).map(([year, count]) => ({
      year: parseInt(year),
      count,
    }));

    return {
      totalCompanies: companies.length,
      companiesByYear: result,
    };
  }
}
