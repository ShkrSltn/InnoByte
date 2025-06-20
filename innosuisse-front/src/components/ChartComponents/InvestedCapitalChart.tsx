import { Bar } from 'recharts';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface InvestedCapitalChartProps {
  years: string[];
  capitalValues: number[];
}

export const InvestedCapitalChart = ({
  years,
  capitalValues,
}: InvestedCapitalChartProps) => {
  const data = years.map((year, index) => ({
    year,
    capital: capitalValues[index] || 0,
  }));

  console.log('Chart data:', data);

  const formatCapital = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
      >
        <defs>
          <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ea0b34" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#ea0b34" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          angle={-45}
          textAnchor="end"
          height={70}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickFormatter={formatCapital}
          tick={{ fontSize: 12 }}
          width={60}
          domain={[0, 'auto']}
        />
        <Tooltip
          formatter={(value: number) => [
            `CHF ${formatCapital(value)}`,
            'Invested Capital',
          ]}
          labelFormatter={(label) => `Year: ${label}`}
        />
        <Bar
          dataKey="capital"
          fill="url(#capitalGradient)"
          name="Invested Capital"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>

    </ResponsiveContainer>
  );
};
