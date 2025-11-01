// Chart configuration types

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';

export interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis: string[]; // Support multiple Y axes
  groupBy?: string;
  colorScheme?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export interface ChartData {
  name: string | number;
  [key: string]: any;
}

export interface GraphableData {
  hasNumericColumns: boolean;
  numericColumns: string[];
  categoricalColumns: string[];
  recommendedChartType: ChartType;
  canGraph: boolean;
}

export interface ColumnAnalysis {
  name: string;
  isNumeric: boolean;
  isCategorical: boolean;
  isDateTime: boolean;
  uniqueValueCount: number;
  sampleValues: any[];
}
