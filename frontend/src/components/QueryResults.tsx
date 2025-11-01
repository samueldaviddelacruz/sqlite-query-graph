import { useState, useEffect } from "react";
import { ChartConfig } from "../types/chart";
import { analyzeQueryData } from "../utils/dataAnalysis";
import { autoGenerateChartConfig } from "../utils/chartHelpers";
import ResultsToolbar from "./ResultsToolbar";
import TableView from "./TableView";
import ChartView from "./ChartView";

type ViewMode = 'table' | 'chart';

interface QueryResultsProps {
  data: any[];
  columns: string[];
  onDataChange?: (data: any[]) => void;
}

export default function QueryResults({ data, columns, onDataChange }: QueryResultsProps) {
  // Load view mode from localStorage or default to 'table'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const savedMode = localStorage.getItem('queryResultsViewMode');
      return (savedMode === 'chart' || savedMode === 'table') ? savedMode : 'table';
    } catch {
      return 'table';
    }
  });

  const [chartConfig, setChartConfig] = useState<ChartConfig>(() => {
    // Load chart preferences from localStorage (type, legend, grid only)
    try {
      const savedPrefs = localStorage.getItem('chartPreferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        return {
          type: prefs.type || 'bar',
          xAxis: '',
          yAxis: [],
          showLegend: prefs.showLegend !== undefined ? prefs.showLegend : true,
          showGrid: prefs.showGrid !== undefined ? prefs.showGrid : true,
        };
      }
    } catch {
      // Fall through to default
    }
    return {
      type: 'bar',
      xAxis: '',
      yAxis: [],
      showLegend: true,
      showGrid: true,
    };
  });
  const [showAutoConfigNotification, setShowAutoConfigNotification] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Analyze data whenever it changes
  const graphableData = analyzeQueryData(columns, data);

  // Auto-configure chart when data changes or when switching to chart view
  useEffect(() => {
    if (graphableData.canGraph && data.length > 0 && columns.length > 0) {
      const autoConfig = autoGenerateChartConfig(
        columns,
        data,
        graphableData.numericColumns,
        graphableData.categoricalColumns,
        graphableData.recommendedChartType
      );
      setChartConfig(autoConfig);

      // Show notification that chart was auto-configured
      if (viewMode === 'chart') {
        setShowAutoConfigNotification(true);
        setTimeout(() => setShowAutoConfigNotification(false), 5000);
      }
    }
  }, [data, columns, graphableData.canGraph]);

  // If data becomes non-graphable, switch back to table view
  useEffect(() => {
    if (!graphableData.canGraph && viewMode === 'chart') {
      setViewMode('table');
    }
  }, [graphableData.canGraph, viewMode]);

  const handleViewModeChange = (mode: ViewMode) => {
    // Show brief loading state when switching to chart
    if (mode === 'chart' && viewMode === 'table' && data.length > 100) {
      setIsChartLoading(true);
      setTimeout(() => setIsChartLoading(false), 300);
    }

    setViewMode(mode);
    // Persist view mode preference
    try {
      localStorage.setItem('queryResultsViewMode', mode);
    } catch (error) {
      console.warn('Failed to save view mode preference:', error);
    }
  };

  const handleChartConfigChange = (config: ChartConfig) => {
    setChartConfig(config);

    // Save chart preferences to localStorage (type, legend, grid only)
    try {
      const prefs = {
        type: config.type,
        showLegend: config.showLegend,
        showGrid: config.showGrid,
      };
      localStorage.setItem('chartPreferences', JSON.stringify(prefs));
    } catch (error) {
      console.warn('Failed to save chart preferences:', error);
    }
  };

  // Don't render anything if there's no data
  if (!data || data.length === 0 || !columns || columns.length === 0) {
    return (
      <div className="box mt-4 has-text-centered" style={{ padding: "3rem" }}>
        <div className="mb-4">
          <i className="fas fa-table fa-3x has-text-grey-light"></i>
        </div>
        <p className="title is-5 has-text-grey-light">No Results Yet</p>
        <p className="subtitle is-6 has-text-grey">
          Write a SQL query and click <strong>Run Query</strong> to see results
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Toolbar with view toggle and chart config */}
      <ResultsToolbar
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        chartConfig={chartConfig}
        onChartConfigChange={handleChartConfigChange}
        graphableData={graphableData}
        columns={columns}
      />

      {/* Auto-configuration notification */}
      {showAutoConfigNotification && viewMode === 'chart' && (
        <div className="notification is-success is-light" style={{ marginBottom: 0, borderRadius: 0 }}>
          <button className="delete" onClick={() => setShowAutoConfigNotification(false)}></button>
          <strong>✨ Chart Auto-Configured!</strong> We've selected a {chartConfig.type} chart with {chartConfig.xAxis} on X-axis
          and {chartConfig.yAxis.join(', ')} on Y-axis. Adjust the settings above if needed.
        </div>
      )}

      {/* Results Display - Table or Chart */}
      <div
        className="box"
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          marginTop: 0,
          paddingTop: '1.5rem',
        }}
      >
        {viewMode === 'table' ? (
          <>
            <h3 className="title is-5 mb-3">
              Query Results ({data.length} rows)
            </h3>
            <div className="data-grid-container">
              <TableView data={data} columns={columns} onDataChange={onDataChange} />
            </div>
          </>
        ) : isChartLoading ? (
          <div className="has-text-centered" style={{ padding: "3rem" }}>
            <div className="mb-4">
              <i className="fas fa-spinner fa-spin fa-3x has-text-primary"></i>
            </div>
            <p className="has-text-grey">Preparing chart...</p>
          </div>
        ) : (
          <ChartView data={data} columns={columns} config={chartConfig} />
        )}
      </div>

      {/* Empty results message */}
      {data.length === 0 && columns.length > 0 && (
        <div
          className="box mt-4 has-text-centered"
          style={{ padding: "3rem" }}
        >
          <div className="mb-4">
            <i className="fas fa-info-circle fa-3x has-text-info"></i>
          </div>
          <p className="title is-5">Query returned 0 rows</p>
          <p className="subtitle is-6 has-text-grey">
            Your query executed successfully but returned no results
          </p>
        </div>
      )}
    </div>
  );
}
