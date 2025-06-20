import ReactECharts from 'echarts-for-react';

interface PhaseDistributionChartProps {
  names: string[];
  values: number[];
}

export function PhaseDistributionChart({ names, values }: PhaseDistributionChartProps) {
  const options = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        name: 'Phase Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: true,
        },
        data: names.map((name, index) => ({
          value: values[index],
          name: name,
          itemStyle: {
            color: [
              '#1e3a8a',
              '#ea0b34',
              '#facc15',
              '#4fd1c5',
              '#c026d3',
              '#f97316',
              '#3b82f6',
            ][index % 7],
          },          
        })),        
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <ReactECharts
        option={options}
        className="w-full"
      />
    </div>
  );
}