import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { LoadingSpinner } from './LoadingSpinner';

type DatatoDownload = {
  companyName: string;
  investors: string;
  amount: number;
  phase: string;
  canton: string;
  industry: string;
  date: string;
};

export default function DownloadTable() {
  const [data, setData] = useState<DatatoDownload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      fetch('http://localhost:3000/deal/all-data')
        .then((res) => res.json())
        .then((json) => {
          const formatted = json.map((row: DatatoDownload, index: number) => ({
            ...row,
            id: index,
            date: new Date(row.date).toLocaleDateString(),
          }));
          setData(formatted);
          setIsLoading(false);
        });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const columns = useMemo<MRT_ColumnDef<DatatoDownload>[]>(
    () => [
      { accessorKey: 'companyName', header: 'Company' },
      { accessorKey: 'investors', header: 'Investors' },
      {
        accessorKey: 'amount',
        header: 'Amount (CHF)',
        enableColumnFilter: false,
      },
      { accessorKey: 'phase', header: 'Phase' },
      { accessorKey: 'canton', header: 'Canton' },
      { accessorKey: 'industry', header: 'Industry' },
      { accessorKey: 'date', header: 'Date', enableColumnFilter: false },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
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
              Object.keys(data[0]).join(','),
              ...data.map((row) => Object.values(row).join(',')),
            ].join('\n');

            const blob = new Blob([csvContent], {
              type: 'text/csv;charset=utf-8;',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'deals_export.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          variant="contained"
          sx={{
            backgroundImage: 'linear-gradient(to right, #d32f2f, #f44336)',
            color: 'white',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              backgroundImage: 'linear-gradient(to right, #b71c1c, #e53935)',
            },
          }}
        >
          Export to CSV
        </Button>
      </Box>
    ),
    muiTableHeadCellProps: {
      sx: {
        backgroundImage: 'linear-gradient(to right, #d32f2f, #f44336)',
        color: '#fff',
        fontWeight: 'bold',
      },
    },
    muiTableBodyCellProps: {
      sx: { fontSize: '14px' },
    },
  });

  return (
    <>
      {isLoading && <LoadingSpinner />}
      {!isLoading && (
        <Box sx={{ margin: '0 auto' }}>
          <MaterialReactTable table={table} />
        </Box>
      )}
    </>
  );
}
