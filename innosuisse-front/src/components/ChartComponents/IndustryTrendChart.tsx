import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  year: number;
  value: number;
}

interface IndustryTrend {
  name: string;
  data: DataPoint[];
}

interface IndustryTrendChartProps {
  data: IndustryTrend[];
  selectedIndustries?: string[];
}

const COLOR_PALETTE = [
  '#1e3a8a',
  '#b91c1c',
  '#0ea5e9',
  '#f43f5e',
  '#9333ea',
  '#16a34a',
  '#eab308',
  '#ea580c',
  '#3b0764',
  '#991b1b',
  '#0284c7',
  '#dc2626',
  '#7c3aed',
  '#059669',
  '#be185d',
  '#d97706',
  '#14b8a6',
  '#0f172a',
  '#9d174d',
  '#4f46e5',
];

const CHART_MARGIN = { top: 20, right: 30, left: 20, bottom: 60 };

export function IndustryTrendChart({ 
  data, 
  selectedIndustries = [] 
}: IndustryTrendChartProps) {
  const filteredData = selectedIndustries.length > 0
    ? data.filter(industry => selectedIndustries.includes(industry.name))
    : data;

  const chartData: Record<number, Record<string, number>> = {};
  
  filteredData.forEach(industry => {
    industry.data.forEach(({ year, value }) => {
      if (!chartData[year]) chartData[year] = { year };
      chartData[year][industry.name] = value;
    });
  });

  const chartDataArray = Object.values(chartData).sort((a, b) => a.year - b.year);
  const MAX_VISIBLE_INDUSTRIES = 20;
  const industriesToShow = filteredData.slice(0, MAX_VISIBLE_INDUSTRIES);

  return (
    <div className="h-[470px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartDataArray} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="year" 
            tick={{ fill: '#555' }}
            label={{
              value: 'Year',
              position: 'insideBottomRight',
              offset: -10,
              fill: '#555'
            }}
          />
          <YAxis 
            tick={{ fill: '#555' }}
            label={{
              value: 'Number of Deals',
              angle: -90,
              position: 'insideLeft',
              fill: '#555'
            }}
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.96)',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              padding: '10px'
            }}
          />
          <Legend 
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              paddingBottom: '20px'
            }}
          />
          {industriesToShow.map((industry, index) => (
            <Line
              key={industry.name}
              type="monotone"
              dataKey={industry.name}
              stroke={COLOR_PALETTE[index % COLOR_PALETTE.length]}
              strokeWidth={2}
              activeDot={{ r: 4 }}
              dot={{ r: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {filteredData.length > MAX_VISIBLE_INDUSTRIES && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Showing {MAX_VISIBLE_INDUSTRIES} of {filteredData.length} industries. 
          Use filters to focus on specific industries.
        </p>
      )}
    </div>
  );
}
