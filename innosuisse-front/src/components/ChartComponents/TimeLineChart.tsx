import ReactECharts from 'echarts-for-react';

interface TimelineChartProps {
  years: string[];
  values: number[];
}

export function TimelineChart({ years, values }: TimelineChartProps) {
  const options = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} deals',
    },
    xAxis: {
      type: 'category',
      data: years,
      name: 'Year',
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: values,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(58, 77, 233, 0.8)',
              },
              {
                offset: 1,
                color: 'rgba(58, 77, 233, 0.1)',
              },
            ],
          },
        },
        lineStyle: {
          width: 3,
          color: '#3a4de9',
        },
        symbolSize: 8,
        itemStyle: {
          color: '#3a4de9',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  };

  return (
    <div className="bg-white p-4">
      <ReactECharts
        option={options}
        className="w-full"
      />
    </div>
  );
}