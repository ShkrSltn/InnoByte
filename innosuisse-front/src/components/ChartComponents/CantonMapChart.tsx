import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useEffect, useState, useRef, useMemo } from 'react';

interface CantonMapChartProps {
  names: string[];
  values: number[];
  maxDeals: number;
}

const DEFAULT_COLORS = ['#ffe6e9', '#ffccd2', '#ff99aa', '#ff667f', '#ea0b34'];

export function CantonMapChart({ names, values, maxDeals }: CantonMapChartProps) {
  const [mapRegistered, setMapRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ReactECharts>(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.getEchartsInstance().dispose();
        } catch (e) {
          console.warn('Error disposing chart:', e);
        }
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchGeoJson = async () => {
      try {
        const res = await fetch('/maps/swiss-map.json');
        if (!res.ok) throw new Error('Failed to fetch map data');
        
        const json = await res.json();
        if (!json.features) throw new Error('Invalid GeoJSON format');
        
        echarts.registerMap('switzerland', json);
        if (mounted) setMapRegistered(true);
      } catch (error) {
        console.error('Failed to load Switzerland map:', error);
        if (mounted) setError(error instanceof Error ? error.message : 'Failed to load map data');
      }
    };

    if (!mapRegistered && !error) {
      fetchGeoJson();
    }

    return () => {
      mounted = false;
    };
  }, [mapRegistered, error]);

  const chartData = useMemo(() => {
    if (!names || !values || names.length !== values.length) return [];
    
    return names
      .map((name, index) => ({
        name: getCantonFullName(name),
        value: values[index] || 0
      }))
      .filter(item => item.value > 0);
  }, [names, values]);

  const options = useMemo(() => {
    if (!mapRegistered || !chartData.length) return null;

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}<br/>Deals: ${params.value || 0}`;
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(maxDeals, 1),
        text: ['High', 'Low'],
        realtime: false,
        calculable: true,
        inRange: {
          color: DEFAULT_COLORS
        },
        textStyle: {
          color: '#333'
        }
      },
      series: [{
        name: 'Deals',
        type: 'map',
        map: 'switzerland',
        roam: true,
        emphasis: {
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#ADD8E6'
          }
        },
        data: chartData,
        nameMap: getCantonNameMap()
      }]
      
    };
  }, [mapRegistered, chartData, maxDeals]);

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-center h-[350px]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!mapRegistered) {
    return (
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-center h-[350px]">
        <p>Loading map data...</p>
      </div>
    );
  }

  if (!options || !chartData.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-center h-[350px]">
        <p>No valid data to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg h-[350px]">
      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ height: '100%' }}
        className="w-full"
        notMerge={true}
        lazyUpdate={true}
        onEvents={{
          error: (err) => {
            console.error('Chart error:', err);
            setError('Chart rendering failed');
          }
        }}
      />
    </div>
  );
}

function getCantonFullName(code: string): string {
  return getCantonNameMap()[code] || code;
}

function getCantonNameMap(): Record<string, string> {
  return {
    'AG': 'Aargau',
    'AR': 'Appenzell Ausserrhoden',
    'AI': 'Appenzell Innerrhoden',
    'BL': 'Basel-Landschaft',
    'BS': 'Basel-Stadt',
    'BE': 'Bern',
    'FR': 'Fribourg',
    'GE': 'Geneva',
    'GL': 'Glarus',
    'GR': 'Graubünden',
    'JU': 'Jura',
    'LU': 'Lucerne',
    'NE': 'Neuchâtel',
    'NW': 'Nidwalden',
    'OW': 'Obwalden',
    'SH': 'Schaffhausen',
    'SZ': 'Schwyz',
    'SO': 'Solothurn',
    'SG': 'St. Gallen',
    'TG': 'Thurgau',
    'TI': 'Ticino',
    'UR': 'Uri',
    'VS': 'Valais',
    'VD': 'Vaud',
    'ZG': 'Zug',
    'ZH': 'Zürich'
  };
}