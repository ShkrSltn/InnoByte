import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PhaseDistributionChart } from './PhaseDistributionChart';
import { CantonMapChart } from './CantonMapChart';
import { UserTypeFilter } from '../FilterComponents/UserTypeFilter';
import { MultiSelectDropdown } from '../FilterComponents/MultiselectDropDown';
import { YearRangeFilter } from '../FilterComponents/YearRangeFilter';
import { TimelineChart } from './TimeLineChart';
import { IndustryTrendChart } from './IndustryTrendChart';
import { InvestedCapitalChart } from './InvestedCapitalChart';

const BASE_URL = 'http://localhost:3000/deal';
const CHART_HEIGHT = '500px';

interface Deal {
  id: string;
  investors: string | null;
  amount: number | null;
  valuation: number | null;
  date_of_the_funding_round: string | null;
  company: string | null;
  type: string | null;
  phase: string | null;
  canton: string | null;
  company_code: string | null;
  companyRelation?: {
    code: string;
    title: string;
    industry: string | null;
  };
}

interface FilterResponse {
  totalDeals: number;
  deals: Deal[];
}

export default function DealsDashboard() {
  const [choosenUserType, setChosenUserType] = useState<string | null>(
    'startup'
  );
  const [hasTriedApply, setHasTriedApply] = useState(false);

  const [industries, setIndustries] = useState<string[] | null>(null);
  const [cantons, setCantons] = useState<string[] | null>(null);
  const [phases, setPhases] = useState<string[] | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([
    2000,
    new Date().getFullYear(),
  ]);

  const [choosenIndustries, setChosenIndustries] = useState<string[]>([]);
  const [choosenCantons, setChosenCantons] = useState<string[]>([]);
  const [choosenPhases, setChosenPhases] = useState<string[]>([]);

  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [totalDeals, setTotalDeals] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [industriesRes, cantonsRes, phasesRes, yearsRes] =
          await Promise.all([
            fetch(`${BASE_URL}/industries`),
            fetch(`${BASE_URL}/cantons`),
            fetch(`${BASE_URL}/phases`),
            fetch(`${BASE_URL}/years`),
          ]);

        const [industriesData, cantonsData, phasesData, yearsData] =
          await Promise.all([
            industriesRes.json(),
            cantonsRes.json(),
            phasesRes.json(),
            yearsRes.json(),
          ]);

        setIndustries(['All', ...industriesData]);
        setCantons(['All', ...cantonsData]);
        setPhases(['All', ...phasesData]);
        setAvailableYears(yearsData);

        if (yearsData.length > 0) {
          setYearRange([Math.min(...yearsData), Math.max(...yearsData)]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load filter options');
      }
    };

    fetchData();
  }, []);

  const handleIndustryChange = (selected: string[]) => {
    if (selected.includes('All')) {
      if (industries) {
        setChosenIndustries(industries);
      }
    } else {
      setChosenIndustries(selected);
    }
  };

  const handleCantonChange = (selected: string[]) => {
    if (selected.includes('All')) {
      if (cantons) {
        setChosenCantons(cantons);
      }
    } else {
      setChosenCantons(selected);
    }
  };

  const handlePhaseChange = (selected: string[]) => {
    if (selected.includes('All')) {
      if (phases) {
        setChosenPhases(phases);
      }
    } else {
      setChosenPhases(selected);
    }
  };

  const hasAtLeastOneFilter = () => {
    return (
      choosenIndustries.length > 0 ||
      choosenCantons.length > 0 ||
      choosenPhases.length > 0
    );
  };

  const applyFilter = async () => {
    if (!hasAtLeastOneFilter()) {
      setHasTriedApply(true);
      setError('Please select at least one filter option');
      return;
    }

    setLoading(true);
    setHasTriedApply(false);
    setError(null);
    saveMetadata();

    try {
      const params = new URLSearchParams();

      if (!choosenIndustries.includes('All')) {
        choosenIndustries.forEach((industry) =>
          params.append('industries', industry)
        );
      }

      if (!choosenCantons.includes('All')) {
        choosenCantons.forEach((canton) => params.append('cantons', canton));
      }

      if (!choosenPhases.includes('All')) {
        choosenPhases.forEach((phase) =>
          params.append('phases', encodeURIComponent(phase))
        );
      }

      params.append('yearFrom', yearRange[0].toString());
      params.append('yearTo', yearRange[1].toString());

      const response = await fetch(`${BASE_URL}/filter?${params.toString()}`);

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data: FilterResponse = await response.json();
      setDeals(data.deals);
      setTotalDeals(data.totalDeals);
    } catch (error) {
      console.error('Error applying filter:', error);
      setError('Failed to apply filter. Please try again.');
      setDeals(null);
      setTotalDeals(0);
    } finally {
      setLoading(false);
    }
  };

  const saveMetadata = async () => {
    const formattedIndustries = Array.isArray(choosenIndustries)
      ? choosenIndustries.join('/')
      : choosenIndustries;

    const formattedCantons = Array.isArray(choosenCantons)
      ? choosenCantons.join('/')
      : choosenCantons;

    const formattedPhases = Array.isArray(choosenPhases)
      ? choosenPhases.join('/')
      : choosenPhases;

    const metadata = {
      role_selected: choosenUserType,
      industry_selected: formattedIndustries,
      region_selected: formattedCantons,
      funding_stage_selected: formattedPhases,
    };

    try {
      const response = await fetch(`http://localhost:3000/metadata/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  };

  const resetFilters = () => {
    setHasTriedApply(false);
    setChosenUserType('startup');
    setChosenIndustries([]);
    setChosenCantons([]);
    setChosenPhases([]);
    if (availableYears.length > 0) {
      setYearRange([Math.min(...availableYears), Math.max(...availableYears)]);
    }
    setDeals(null);
    setTotalDeals(0);
    setError(null);
  };

  const prepareChartData = () => {
    if (!deals) return null;

    const timelineData: Record<string, number> = {};
    const capitalByYear: Record<string, number> = {};
    const phaseData: Record<string, number> = {};
    const cantonData: Record<string, number> = {};
    const industryData: Record<string, Record<number, number>> = {};

    deals.forEach((deal) => {
      if (deal.date_of_the_funding_round) {
        const year = new Date(deal.date_of_the_funding_round).getFullYear();
        timelineData[year] = (timelineData[year] || 0) + 1;

        let amount = 0;
        if (deal.amount !== null) {
          if (typeof deal.amount === 'string') {
            amount = parseFloat(deal.amount) * 1000000;
          }
          else {
            amount = deal.amount;
          }
        }

        capitalByYear[year] = (capitalByYear[year] || 0) + amount;

        if (deal.companyRelation?.industry) {
          const industry = deal.companyRelation.industry;
          if (!industryData[industry]) industryData[industry] = {};
          industryData[industry][year] =
            (industryData[industry][year] || 0) + 1;
        }
      }
      if (deal.phase) phaseData[deal.phase] = (phaseData[deal.phase] || 0) + 1;
      if (deal.canton)
        cantonData[deal.canton] = (cantonData[deal.canton] || 0) + 1;
    });

    const industryTrends = Object.entries(industryData).map(
      ([industry, years]) => {
        const sortedYears = Object.keys(years).sort().map(Number);
        return {
          name: industry,
          data: sortedYears.map((year) => ({
            year,
            value: years[year],
          })),
        };
      }
    );

    return {
      timeline: {
        years: Object.keys(timelineData).sort(),
        values: Object.keys(timelineData).map((year) => timelineData[year]),
      },
      capital: {
        years: Object.keys(capitalByYear).sort(),
        values: Object.keys(capitalByYear)
          .sort()
          .map((year) => capitalByYear[year]),
      },
      phases: {
        names: Object.keys(phaseData),
        values: Object.keys(phaseData).map((phase) => phaseData[phase]),
      },
      cantons: {
        names: Object.keys(cantonData),
        values: Object.keys(cantonData).map((canton) => cantonData[canton]),
        maxDeals: Math.max(...Object.values(cantonData)),
      },
      industries: industryTrends,
    };
  };

  useEffect(() => {
    console.log('Deals:', deals);
  }, [deals]);

  const chartData = prepareChartData();

  return (
    <div className="relative min-h-screen flex-1 bg-white px-25">
      <div className="relative z-10 px-6 pt-6 md:px-12 md:pt-12">
        <h1 className="font-semibold text-4xl text-gray-800">
          Financing Information for Startups
        </h1>
  
        <hr className="my-4 border-t-2 border-red-200 w-full max-w-[600px]" />
  
        <h2 className="font-medium text-xl text-red-600">
          Key Highlights at a glance
        </h2>
  
        <div className="mt-6 space-y-4">
          <UserTypeFilter
            chosenUserType={choosenUserType}
            setChosenUserType={setChosenUserType}
          />
  
          <div className="flex flex-wrap items-center gap-3 text-lg">
            <span>looking for</span>
            <MultiSelectDropdown
              options={industries || []}
              selectedValues={
                choosenIndustries.length === industries?.length
                  ? ['All']
                  : choosenIndustries
              }
              onValueChange={setChosenIndustries}
              placeholder="industry"
              className="min-w-[220px] flex-1"
              contentClassName="bg-white dark:bg-gray-800"
            />
            <span>highlights in</span>
            <MultiSelectDropdown
              options={cantons || []}
              selectedValues={
                choosenCantons.length === cantons?.length
                  ? ['All']
                  : choosenCantons
              }
              onValueChange={setChosenCantons}
              placeholder="canton"
              className="min-w-[220px] flex-1"
              contentClassName="bg-white dark:bg-gray-800"
            />
            <span>during</span>
            <YearRangeFilter
              yearRange={yearRange}
              setYearRange={setYearRange}
              availableYears={availableYears}
              className="min-w-[200px]"
            />
          </div>
  
          <div className="flex flex-wrap items-center gap-3 text-lg">
            <span>I am particularly interested in</span>
            <MultiSelectDropdown
              options={phases || []}
              selectedValues={
                choosenPhases.length === phases?.length
                  ? ['All']
                  : choosenPhases
              }
              onValueChange={setChosenPhases}
              placeholder="phase"
              className="min-w-[220px] flex-1"
              contentClassName="bg-white dark:bg-gray-800"
            />
          </div>
        </div>
  
        <div className="mt-6 flex flex-wrap gap-4">
          <Button
            onClick={applyFilter}
            disabled={loading}
            className="bg-red-600 hover:bg-red-800 text-white h-12 px-6 rounded-lg text-base font-semibold"
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            className="border border-gray-300 hover:border-gray-500 h-12 px-6 rounded-lg text-base"
          >
            Reset Filters
          </Button>
        </div>
  
        {hasTriedApply && !hasAtLeastOneFilter() && (
          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-md">
            <p className="font-medium">
              Please select at least one specific filter to continue
            </p>
          </div>
        )}
  
        {error && !hasTriedApply && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {deals && (
          <div className="mt-6 space-y-8">
            <h3 className="font-medium text-lg mb-6">
              Results: {totalDeals} deals found
            </h3>

            {chartData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6">
                <div className="flex flex-col space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex-1 flex flex-col" style={{ height: CHART_HEIGHT }}>
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">
                      Deals Timeline
                    </h4>
                    <div className="flex-1" style={{ height: CHART_HEIGHT, maxHeight: CHART_HEIGHT }}>
                      <TimelineChart
                        years={chartData.timeline.years}
                        values={chartData.timeline.values}
                      />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex-1 flex flex-col">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800">
                      Invested Capital by Years
                    </h4>
                    <div
                      className="flex-1 w-full"
                      style={{
                        height: '400px',
                        maxHeight: '400px',
                        minHeight: '300px',
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      <InvestedCapitalChart
                        years={chartData.capital.years}
                        capitalValues={chartData.capital.values}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex-1 flex flex-col" style={{ height: CHART_HEIGHT }}>
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">
                      Funding Phase Distribution
                    </h4>
                    <div className="flex-1" style={{ height: CHART_HEIGHT, maxHeight: CHART_HEIGHT }}>
                      <PhaseDistributionChart
                        names={chartData.phases.names}
                        values={chartData.phases.values}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex-1 flex flex-col">
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">
                      Deals by Canton
                    </h4>
                    <div className="flex-1" style={{ height: CHART_HEIGHT, maxHeight: CHART_HEIGHT }}>
                      <CantonMapChart
                        names={chartData.cantons.names}
                        values={chartData.cantons.values}
                        maxDeals={chartData.cantons.maxDeals}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex-1 flex flex-col" style={{ height: CHART_HEIGHT }}>
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">
                      Industry Trends
                    </h4>
                    <div className="flex-1" style={{ height: CHART_HEIGHT, maxHeight: CHART_HEIGHT }}>
                      <IndustryTrendChart
                        data={chartData.industries}
                        selectedIndustries={choosenIndustries}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
