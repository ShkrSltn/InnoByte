import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { LoadingSpinner } from './LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { Box, Button } from '@mui/material';

type Metadata = {
  session_id: number;
  session_datetime: Date;
  role_selected: string;
  industry_selected: string;
  region_selected: string;
  funding_stage_selected: string;
};

type ChartData = {
  name: string;
  Startup: number;
  Investor: number;
};

export default function PreFilterMetadata() {
  const [metadata, setMetadata] = useState<Metadata[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<Metadata[]>(
          'http://localhost:3000/metadata/sessions'
        );
        processChartData(response.data);
        const formatted = response.data.map((row: Metadata, index: number) => ({
          ...row,
          id: index,
          date: new Date(row.session_datetime).toLocaleDateString(),
        }));
        setMetadata(formatted);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const columns = useMemo<MRT_ColumnDef<Metadata>[]>(
    () => [
      { accessorKey: 'role_selected', header: 'Role' },
      { accessorKey: 'industry_selected', header: 'Industry' },
      { accessorKey: 'region_selected', header: 'Canton(s)' },
      { accessorKey: 'funding_stage_selected', header: 'Phase' },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: metadata as Metadata[],
    enableColumnOrdering: true,
    enableColumnFilterModes: true,
    enablePagination: true,
    enableSorting: true,
    enableGlobalFilter: true,
    enableRowSelection: true,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem' }}>
        <Button
          onClick={() => {
            table.getSelectedRowModel().flatRows.length > 0
              ? alert('Exporting selected rows')
              : alert('Exporting all data');
            const csvContent = [
              Object.keys(metadata[0]).join(','),
              ...metadata.map((row) => Object.values(row).join(',')),
            ].join('\n');

            const blob = new Blob([csvContent], {
              type: 'text/csv;charset=utf-8;',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'metadata_export.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          variant="contained"
          sx={{
            backgroundImage: 'linear-gradient(to right, #c62828, #e53935)',
            color: 'white',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              backgroundImage: 'linear-gradient(to right, #b71c1c, #d32f2f)',
            },
          }}
        >
          Export to CSV
        </Button>
      </Box>
    ),
    muiTableHeadCellProps: {
      sx: {
        backgroundImage: 'linear-gradient(to right, #c62828, #e53935)',
        color: '#fff',
        fontWeight: 'bold',
      },
    },
    muiTableBodyCellProps: {
      sx: { fontSize: '14px' },
    },
  });

  const processChartData = (data: Metadata[]) => {
    if (!data || data.length === 0) return;

    let startupCount = 0;
    let investorCount = 0;

    data.forEach((item) => {
      if (item.role_selected === 'startup') {
        startupCount++;
      } else if (item.role_selected === 'investor') {
        investorCount++;
      }
    });

    const formattedData = [
      { name: 'Roles', Startup: startupCount, Investor: investorCount },
    ];

    setChartData(formattedData);
  };

  if (isLoading) return <LoadingSpinner />;
  if (chartData.length === 0) return <div className="p-4 text-red-500">No data available</div>;

  return (
    <div className="p-4 w-full h-full flex-1">
      <div className="mt-8 w-full flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Ratio Startup and Investor</h2>
        <div className="h-80 w-150 border border-gray-200 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Startup" fill="#ea0b34" barSize={120} />
              <Bar dataKey="Investor" fill="#3b82f6" barSize={120} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 w-full flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Table Data</h2>
        <Box sx={{ width: '1000px', margin: '0 auto' }}>
          <MaterialReactTable table={table} />
        </Box>
      </div>
    </div>
  );
}
