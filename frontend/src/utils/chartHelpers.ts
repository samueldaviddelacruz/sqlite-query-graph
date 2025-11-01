import { ChartConfig, ChartData } from '../types/chart';

/**
 * Transforms query result data into format suitable for Recharts
 */
export function transformToChartData(
  data: any[],
  config: ChartConfig
): ChartData[] {
  if (!data || data.length === 0) {
    return [];
  }

  return data.map(row => {
    const chartRow: ChartData = {
      name: formatAxisValue(row[config.xAxis])
    };

    // Add Y-axis values
    config.yAxis.forEach(yCol => {
      chartRow[yCol] = row[yCol];
    });

    // Add group-by value if present
    if (config.groupBy && row[config.groupBy]) {
      chartRow.group = row[config.groupBy];
    }

    return chartRow;
  });
}

/**
 * Formats axis values for display
 */
export function formatAxisValue(value: any): string | number {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    // Truncate very long strings
    return value.length > 50 ? value.substring(0, 47) + '...' : value;
  }

  return String(value);
}

/**
 * Generates a default color palette for charts
 */
export const CHART_COLORS = [
  '#3273dc', // Bulma primary blue
  '#48c774', // Bulma success green
  '#ffdd57', // Bulma warning yellow
  '#f14668', // Bulma danger red
  '#00d1b2', // Bulma info cyan
  '#b86bff', // Purple
  '#ff6b9d', // Pink
  '#4ecdc4', // Teal
  '#ff8c42', // Orange
  '#95e1d3', // Mint
];

/**
 * Gets a color from the palette by index
 */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Aggregates data for pie charts (sums values by category)
 */
export function aggregateForPieChart(
  data: any[],
  categoryColumn: string,
  valueColumn: string
): ChartData[] {
  const aggregated = new Map<string, number>();

  data.forEach(row => {
    const category = formatAxisValue(row[categoryColumn]);
    const value = Number(row[valueColumn]) || 0;

    if (aggregated.has(String(category))) {
      aggregated.set(String(category), aggregated.get(String(category))! + value);
    } else {
      aggregated.set(String(category), value);
    }
  });

  return Array.from(aggregated.entries()).map(([name, value]) => ({
    name,
    value
  }));
}

/**
 * Limits the number of data points for performance
 */
export function limitDataPoints(data: ChartData[], maxPoints: number = 1000): ChartData[] {
  if (data.length <= maxPoints) {
    return data;
  }

  // Sample data evenly
  const step = Math.floor(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0).slice(0, maxPoints);
}

/**
 * Formats large numbers for display on axes
 */
export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toFixed(2);
}

/**
 * Generates a chart configuration from analyzed data
 */
export function autoGenerateChartConfig(
  columns: string[],
  data: any[],
  numericColumns: string[],
  categoricalColumns: string[],
  recommendedType: ChartConfig['type']
): ChartConfig {
  // Default configuration
  const config: ChartConfig = {
    type: recommendedType,
    xAxis: '',
    yAxis: [],
    showLegend: true,
    showGrid: true
  };

  // Select X-axis: prefer categorical or first column
  if (categoricalColumns.length > 0) {
    config.xAxis = categoricalColumns[0];
  } else if (columns.length > 0) {
    config.xAxis = columns[0];
  }

  // Select Y-axis: use numeric columns
  if (numericColumns.length > 0) {
    // For most charts, use the first numeric column
    // For scatter plots, use two numeric columns
    if (recommendedType === 'scatter' && numericColumns.length >= 2) {
      config.xAxis = numericColumns[0];
      config.yAxis = [numericColumns[1]];
    } else if (recommendedType === 'pie') {
      // For pie charts, just use the first numeric column
      config.yAxis = [numericColumns[0]];
    } else {
      // For other charts (bar, line, area), can support multiple Y-axis series
      config.yAxis = [numericColumns[0]];

      // Optionally add more series if there are multiple numeric columns
      if (numericColumns.length > 1) {
        config.yAxis.push(...numericColumns.slice(1, 3)); // Max 3 series by default
      }
    }
  }

  return config;
}
