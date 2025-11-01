import { ChartConfig, ChartType, GraphableData } from "../types/chart";

type ViewMode = 'table' | 'chart';

interface ResultsToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  chartConfig: ChartConfig;
  onChartConfigChange: (config: ChartConfig) => void;
  graphableData: GraphableData;
  columns: string[];
}

export default function ResultsToolbar({
  viewMode,
  onViewModeChange,
  chartConfig,
  onChartConfigChange,
  graphableData,
  columns,
}: ResultsToolbarProps) {
  const handleChartTypeChange = (type: ChartType) => {
    onChartConfigChange({ ...chartConfig, type });
  };

  const handleXAxisChange = (xAxis: string) => {
    onChartConfigChange({ ...chartConfig, xAxis });
  };

  const handleYAxisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    onChartConfigChange({ ...chartConfig, yAxis: selectedOptions });
  };

  const toggleLegend = () => {
    onChartConfigChange({ ...chartConfig, showLegend: !chartConfig.showLegend });
  };

  const toggleGrid = () => {
    onChartConfigChange({ ...chartConfig, showGrid: !chartConfig.showGrid });
  };

  return (
    <div className="box mb-0" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      {/* View Mode Toggle */}
      <div className="level mb-3">
        <div className="level-left">
          <div className="level-item">
            <div className="buttons has-addons">
              <button
                className={`button ${viewMode === 'table' ? 'is-primary' : ''}`}
                onClick={() => onViewModeChange('table')}
              >
                <span className="icon">
                  <i className="fas fa-table"></i>
                </span>
                <span>Table</span>
              </button>
              <button
                className={`button ${viewMode === 'chart' ? 'is-primary' : ''}`}
                onClick={() => onViewModeChange('chart')}
                disabled={!graphableData.canGraph}
                title={
                  !graphableData.canGraph
                    ? 'No numeric data available for charting'
                    : 'Switch to chart view'
                }
              >
                <span className="icon">
                  <i className="fas fa-chart-bar"></i>
                </span>
                <span>Chart</span>
              </button>
            </div>
          </div>
          {!graphableData.canGraph && (
            <div className="level-item">
              <span className="tag is-warning is-light">
                <span className="icon">
                  <i className="fas fa-info-circle"></i>
                </span>
                <span>Query must return numeric data for charting</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Configuration Panel - Only visible in chart mode */}
      {viewMode === 'chart' && graphableData.canGraph && (
        <div className="box is-light">
          <div className="columns">
            {/* Chart Type Selector */}
            <div className="column is-3">
              <div className="field">
                <label className="label is-small">Chart Type</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={chartConfig.type}
                      onChange={(e) => handleChartTypeChange(e.target.value as ChartType)}
                    >
                      <option value="bar">
                        📊 Bar Chart
                      </option>
                      <option value="line">
                        📈 Line Chart
                      </option>
                      <option value="pie">
                        🥧 Pie Chart
                      </option>
                      <option value="area">
                        📉 Area Chart
                      </option>
                      <option value="scatter">
                        🔵 Scatter Plot
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* X-Axis Selector */}
            <div className="column is-3">
              <div className="field">
                <label className="label is-small">
                  X-Axis
                  {chartConfig.type === 'scatter' && (
                    <span className="tag is-info is-light ml-2" style={{ fontSize: '0.65rem' }}>
                      Numeric
                    </span>
                  )}
                </label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={chartConfig.xAxis}
                      onChange={(e) => handleXAxisChange(e.target.value)}
                    >
                      <option value="">-- Select Column --</option>
                      {chartConfig.type === 'scatter'
                        ? graphableData.numericColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))
                        : columns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Y-Axis Selector */}
            <div className="column is-4">
              <div className="field">
                <label className="label is-small">
                  Y-Axis
                  <span className="tag is-info is-light ml-2" style={{ fontSize: '0.65rem' }}>
                    Numeric
                  </span>
                  {chartConfig.type !== 'pie' && (
                    <span className="has-text-grey-light ml-2" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                      (Hold Ctrl/Cmd for multiple)
                    </span>
                  )}
                </label>
                <div className="control">
                  <div className="select is-fullwidth" style={{ height: 'auto' }}>
                    <select
                      multiple={chartConfig.type !== 'pie'}
                      size={chartConfig.type === 'pie' ? 1 : 3}
                      value={chartConfig.yAxis}
                      onChange={handleYAxisChange}
                      style={{ height: chartConfig.type === 'pie' ? 'auto' : '70px' }}
                    >
                      {graphableData.numericColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Options */}
            <div className="column is-2">
              <div className="field">
                <label className="label is-small">Options</label>
                <div className="control">
                  <label className="checkbox is-block mb-2">
                    <input
                      type="checkbox"
                      checked={chartConfig.showLegend !== false}
                      onChange={toggleLegend}
                      className="mr-2"
                    />
                    <span style={{ fontSize: '0.875rem' }}>Legend</span>
                  </label>
                  <label className="checkbox is-block">
                    <input
                      type="checkbox"
                      checked={chartConfig.showGrid !== false}
                      onChange={toggleGrid}
                      className="mr-2"
                    />
                    <span style={{ fontSize: '0.875rem' }}>Grid</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Helpful hints based on chart type */}
          {chartConfig.type === 'pie' && (
            <div className="notification is-info is-light mt-2" style={{ padding: '0.75rem' }}>
              <p className="is-size-7">
                <strong>💡 Tip:</strong> Pie charts work best with categorical X-axis and a single numeric Y-axis value.
              </p>
            </div>
          )}
          {chartConfig.type === 'scatter' && (
            <div className="notification is-info is-light mt-2" style={{ padding: '0.75rem' }}>
              <p className="is-size-7">
                <strong>💡 Tip:</strong> Scatter plots require numeric values for both X and Y axes to show correlations.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
