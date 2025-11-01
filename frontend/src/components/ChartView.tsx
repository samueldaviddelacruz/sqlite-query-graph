import { ChartConfig, ChartData } from "../types/chart";
import { transformToChartData, aggregateForPieChart, limitDataPoints } from "../utils/chartHelpers";
import BarChart from "./charts/BarChart";
import LineChart from "./charts/LineChart";
import PieChart from "./charts/PieChart";
import AreaChart from "./charts/AreaChart";
import ScatterChart from "./charts/ScatterChart";

interface ChartViewProps {
  data: any[];
  columns: string[];
  config: ChartConfig;
}

export default function ChartView({ data, columns, config }: ChartViewProps) {
  // Validate data
  if (!data || data.length === 0 || !columns || columns.length === 0) {
    return (
      <div className="box mt-4 has-text-centered" style={{ padding: "3rem" }}>
        <div className="mb-4">
          <i className="fas fa-chart-bar fa-3x has-text-grey-light"></i>
        </div>
        <p className="title is-5 has-text-grey-light">No Data to Chart</p>
        <p className="subtitle is-6 has-text-grey">
          Execute a query with numeric data to visualize results
        </p>
      </div>
    );
  }

  // Validate configuration
  if (!config.xAxis || !config.yAxis || config.yAxis.length === 0) {
    return (
      <div className="box mt-4 has-text-centered" style={{ padding: "3rem" }}>
        <div className="mb-4">
          <i className="fas fa-exclamation-triangle fa-3x has-text-warning"></i>
        </div>
        <p className="title is-5">Chart Configuration Required</p>
        <p className="subtitle is-6 has-text-grey">
          Please select columns for X and Y axes
        </p>
      </div>
    );
  }

  // Transform data based on chart type
  let chartData: ChartData[];

  if (config.type === 'pie') {
    // Pie chart needs aggregated data
    chartData = aggregateForPieChart(data, config.xAxis, config.yAxis[0]);
  } else {
    chartData = transformToChartData(data, config);
  }

  // Limit data points for performance
  const limitedData = limitDataPoints(chartData, 1000);

  // Show warning if data was limited
  const dataWasLimited = chartData.length > limitedData.length;

  // Render the appropriate chart based on type
  const renderChart = () => {
    const commonProps = {
      data: limitedData,
      xAxisKey: config.type === 'pie' ? 'name' : 'name',
      yAxisKeys: config.type === 'pie' ? ['value'] : config.yAxis,
      showLegend: config.showLegend !== false,
      showGrid: config.showGrid !== false,
    };

    switch (config.type) {
      case 'bar':
        return <BarChart {...commonProps} />;
      case 'line':
        return <LineChart {...commonProps} />;
      case 'pie':
        return <PieChart nameKey="name" valueKey="value" data={limitedData} showLegend={commonProps.showLegend} />;
      case 'area':
        return <AreaChart {...commonProps} />;
      case 'scatter':
        return <ScatterChart {...commonProps} />;
      default:
        return (
          <div className="has-text-centered" style={{ padding: "3rem" }}>
            <p className="has-text-grey">Unsupported chart type: {config.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="box mt-4">
      <div className="level mb-3">
        <div className="level-left">
          <div className="level-item">
            <h3 className="title is-5">
              {config.type.charAt(0).toUpperCase() + config.type.slice(1)} Chart
            </h3>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <span className="tag is-light">
              {limitedData.length} {limitedData.length === 1 ? 'point' : 'points'}
            </span>
          </div>
        </div>
      </div>

      {dataWasLimited && (
        <div className="notification is-warning is-light mb-4">
          <button className="delete"></button>
          <strong>Performance Notice:</strong> Showing {limitedData.length} of {chartData.length} data points.
          Large datasets are sampled for better performance.
        </div>
      )}

      <div className="chart-container">
        {renderChart()}
      </div>
    </div>
  );
}
