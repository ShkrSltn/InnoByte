import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './pages/Layout/Layout';
import './App.css';
import DealsDashboard from './components/ChartComponents/DealsDashboard';
import DownloadTable from './components/data-download.tsx';
import PreFilterMetadata from './components/PreFilterMetadata';
import AIAnalyze from './components/AIAnalyze.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DealsDashboard />} />
          <Route path="download" element={<DownloadTable />} />
          <Route
            path="metadata-statistics"
            element={<PreFilterMetadata />}
          />
          <Route
            path="ai-analyzer"
            element={<AIAnalyze />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
