import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import {
  Loader2,
  Info,
  Database,
  SearchIcon,
  Brain,
  BookOpen,
  ArrowUpDown,
  LightbulbIcon,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
} from '@tanstack/react-table';

interface AnalysisResult {
  query: string;
  result: Record<string, any>[];
  attempts: number;
  explanation: string;
  specificAnswer: string;
}

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function AIAnalyze() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<AnalysisResult>(
        'http://localhost:3000/ai/analyze-and-explain',
        {
          query: query.trim(),
        }
      );
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(
        'An error occurred while analyzing data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const columnHelper = createColumnHelper<any>();

  const columns = useMemo(() => {
    if (!result?.result || !result.result.length) return [];

    return Object.keys(result.result[0]).map((key) =>
      columnHelper.accessor(key, {
        header: ({ column }) => (
          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
            <span>{key}</span>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground/70" />
          </div>
        ),
        cell: (info) => {
          const [isExpanded, setIsExpanded] = useState(false);
          let value = info.getValue();

          if (key.includes('date') && typeof value === 'string') {
            value = formatDate(value);
          }
          else if (key === 'amount' && value) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              value = new Intl.NumberFormat('en-CH', {
                style: 'currency',
                currency: 'CHF',
                maximumFractionDigits: 0,
              }).format(numValue);
            }
          }

          const displayValue = formatCellValue(value);

          return (
            <div
              className={`${isExpanded ? '' : 'max-w-[200px] truncate'
                } cursor-pointer`}
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? '' : displayValue}
            >
              <span
                className={`${isExpanded ? 'whitespace-pre-wrap' : ''
                  } font-medium`}
              >
                {displayValue}
              </span>
            </div>
          );
        },
      })
    );
  }, [result]);

  const table = useReactTable({
    data: result?.result || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const exampleQueries = [
    'Show me startups in biotech that got funding after 2020',
    'What are the 5 biggest investments in Swiss startups?',
    'Find companies with female leaders that received investments',
    'Which regions in Switzerland have the most successful startups?',
  ];

  const exportToCsv = () => {
    if (!result?.result || !result.result.length) return;

    const headers = Object.keys(result.result[0]);

    let csvContent = headers.join(',') + '\n';

    result.result.forEach(item => {
      const row = headers.map(header => {
        let cell = item[header] === null || item[header] === undefined ? '' : item[header];

        if (typeof cell === 'string') {
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            cell = `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        } else if (typeof cell === 'object') {
          return `"${JSON.stringify(cell).replace(/"/g, '""')}"`;
        }
        return String(cell);
      }).join(',');

      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `startup-data-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 mb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Startup Explorer</h1>
        <p className="text-muted-foreground">
          Ask simple questions about Swiss startups and get instant answers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3 border border-gray-300/80 rounded-lg overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary/80" />
              Ask
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="query">Your question</Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-5 h-6 w-6 text-muted-foreground/60" />
                    <Input
                      id="query"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., 'Which startups got over 1 million in 2022?'"
                      className="pl-12 h-16 text-lg border-0 bg-gray-50 shadow-inner rounded-xl focus:ring-2 focus:ring-purple-100 focus:shadow-md focus:bg-white transition-all duration-300"
                      disabled={loading}
                    />
                    <div className="absolute right-3 top-3 bg-gradient-to-r from-[#ea0b34]/20 to-[#c40b2c]/20 px-2 py-1 rounded-md text-xs font-semibold text-red-700">
                      AI
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-1 mb-2 py-2 px-3 text-xs bg-gray-50 border border-gray-200/60 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-400 flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <p className="text-gray-600">
                    AI-generated responses may not always be accurate. Results are generated based on available data and should be verified.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full transition-all duration-300 h-12 text-lg cursor-pointer bg-gradient-to-r from-[#ea0b34] to-[#ff5e5b] hover:from-[#d5092f] hover:to-[#ff3b3a] shadow-sm hover:shadow text-white rounded-xl border-0"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Finding answers
                    </>
                  ) : (
                    <>Get answers</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-start pt-0">
            <Label className="text-sm text-muted-foreground mb-2">
              Try asking:
            </Label>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(example)}
                  className="text-xs border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2 bg-muted/10 border border-gray-300/80 rounded-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500/80" />
              Tips for better results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <ul className="mt-1 space-y-1 list-disc pl-5">
                  <li>
                    Mention timeframes (e.g., "after 2020", "between 2018-2022")
                  </li>
                  <li>Include business sectors if you're looking for something specific</li>
                  <li>Mention investment amounts when needed</li>
                  <li>
                    Ask for specific numbers (e.g., "top 10", "all startups")
                  </li>
                </ul>
              </div>

              <div className="mt-4 border-t border-gray-200/60 pt-3">
                <h3 className="font-medium text-gray-800 mb-2">
                  Example questions:
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2 items-start">
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium mt-0.5 w-14 text-center">
                      Good
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">How did biotech startup industry develop over the last 5 years?</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <div className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-medium mt-0.5 w-14 text-center">
                      Bad
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">How biotech industry was developing over the last 5 years?</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-800">
                  You can discover:
                </h3>
                <ul className="mt-1 space-y-1 list-disc pl-5">
                  <li>Investment trends and funding information</li>
                  <li>Industry comparisons and market insights</li>
                  <li>Regional startup success stories</li>
                  <li>Team and leadership insights</li>
                  <li>Growth and success patterns over time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50/20 rounded-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700/90">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-8">
          <Card className="border border-gray-300/80 border-l-[3px] border-l-[#1e3a8a] rounded-lg overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <LightbulbIcon className="h-5 w-5 text-purple-500/80" />
                Answer
              </CardTitle>
              <CardDescription>Here's what we found</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed font-medium">
                {result.specificAnswer}
              </p>
            </CardContent>
          </Card>

          {result.result.length > 0 && (
            <Card className="border border-gray-300/80 border-l-[3px] border-l-[#b91c1c] rounded-lg overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-green-500/80" />
                      Details
                    </CardTitle>
                    <span className="ml-3 text-sm text-muted-foreground">
                      {result.result.length} startups found
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="overflow-auto rounded-md border border-gray-300/80 max-h-[600px]">
                  <table className="w-full table-auto">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr
                          key={headerGroup.id}
                          className="bg-gray-50/70 border-b border-gray-300/70"
                        >
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-4 py-3 text-left text-sm font-medium text-gray-500 border-b border-gray-300/70"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row, i) => (
                          <tr
                            key={row.id}
                            className={`border-b border-gray-300/50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                              } hover:bg-blue-50/20 transition-colors duration-150`}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-4 py-3 text-sm text-gray-600"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="h-24 text-center text-gray-500"
                          >
                            No results found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="sr-only">Go to previous page</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {table.getState().pagination.pageIndex + 1} of{' '}
                      {table.getPageCount()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="sr-only">Go to next page</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCsv}
                      className="text-xs h-8 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Export as CSV
                    </Button>
                    <span className="text-sm text-gray-500">
                      Showing{' '}
                      {table.getState().pagination.pageIndex *
                        table.getState().pagination.pageSize +
                        1}{' '}
                      to{' '}
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                        table.getRowCount()
                      )}{' '}
                      of {table.getRowCount()} startups
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border border-gray-300/80 border-l-[3px] border-l-[#1e3a8a] rounded-lg overflow-hidden">
            <CardHeader
              className="pb-2 cursor-pointer hover:bg-gray-50/50 transition-colors"
              onClick={() => setShowInsights(!showInsights)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500/80" />
                    Insights
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100/60 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 transition-transform duration-200 ${showInsights ? 'rotate-180' : ''
                      }`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${showInsights ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <CardContent className="py-4">
                <p className="text-gray-700 leading-relaxed">
                  {result.explanation}
                </p>
              </CardContent>
            </div>
          </Card>
        </div>
      )}

      <div className="h-12"></div>
    </div>
  );
}
