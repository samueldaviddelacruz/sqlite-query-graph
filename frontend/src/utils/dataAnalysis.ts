import { GraphableData, ColumnAnalysis, ChartType } from '../types/chart';

/**
 * Analyzes query result data to determine graphability and recommend chart types
 */
export function analyzeQueryData(
  columns: string[],
  data: any[]
): GraphableData {
  if (!data || data.length === 0 || !columns || columns.length === 0) {
    return {
      hasNumericColumns: false,
      numericColumns: [],
      categoricalColumns: [],
      recommendedChartType: 'bar',
      canGraph: false
    };
  }

  const columnAnalyses = columns.map(col => analyzeColumn(data, col));

  const numericColumns = columnAnalyses
    .filter(analysis => analysis.isNumeric)
    .map(analysis => analysis.name);

  const categoricalColumns = columnAnalyses
    .filter(analysis => analysis.isCategorical)
    .map(analysis => analysis.name);

  const hasNumericColumns = numericColumns.length > 0;
  const canGraph = hasNumericColumns && data.length > 0;

  const recommendedChartType = recommendChartType(
    numericColumns.length,
    categoricalColumns.length,
    data.length,
    columnAnalyses
  );

  return {
    hasNumericColumns,
    numericColumns,
    categoricalColumns,
    recommendedChartType,
    canGraph
  };
}

/**
 * Analyzes a single column to determine its type and characteristics
 */
export function analyzeColumn(data: any[], columnName: string): ColumnAnalysis {
  const sample = data.slice(0, Math.min(100, data.length));
  const values = sample.map(row => row[columnName]).filter(val => val !== null && val !== undefined);

  if (values.length === 0) {
    return {
      name: columnName,
      isNumeric: false,
      isCategorical: false,
      isDateTime: false,
      uniqueValueCount: 0,
      sampleValues: []
    };
  }

  // Check for numeric values (including numbers stored as strings)
  const numericCount = values.filter(val => {
    if (typeof val === 'number') return true;
    // Check if string can be parsed as number
    if (typeof val === 'string') {
      const trimmed = val.trim();
      return !isNaN(Number(trimmed)) && trimmed !== '';
    }
    return false;
  }).length;

  // Require at least 80% numeric values, but account for sparse data
  const isNumeric = numericCount / values.length > 0.8 && values.length > 0;

  // Check for boolean values
  const booleanCount = values.filter(val =>
    typeof val === 'boolean' ||
    (typeof val === 'string' && ['true', 'false', 'yes', 'no', '1', '0'].includes(val.toLowerCase()))
  ).length;
  const isBoolean = booleanCount / values.length > 0.8;

  // Check for date/time patterns
  const isDateTime = !isNumeric && !isBoolean && values.some(val =>
    typeof val === 'string' && isDateTimeString(val)
  );

  const uniqueValues = new Set(values);
  const uniqueValueCount = uniqueValues.size;

  // A column is categorical if it's not numeric/boolean/datetime and has:
  // - Relatively few unique values (≤20), OR
  // - Low unique-to-total ratio (<0.5), OR
  // - Is boolean
  const isCategorical = (!isNumeric && !isDateTime) && (
    isBoolean ||
    uniqueValueCount <= 20 ||
    uniqueValueCount / values.length < 0.5
  );

  return {
    name: columnName,
    isNumeric,
    isCategorical,
    isDateTime,
    uniqueValueCount,
    sampleValues: Array.from(uniqueValues).slice(0, 5)
  };
}

/**
 * Checks if a string value appears to be a date/time
 */
function isDateTimeString(value: string): boolean {
  if (!value || typeof value !== 'string') return false;

  // Common date/time patterns
  const datePatterns = [
    /^\d{4}[-/]\d{2}[-/]\d{2}/, // YYYY-MM-DD or YYYY/MM/DD
    /^\d{2}[-/]\d{2}[-/]\d{4}/, // DD-MM-YYYY or MM-DD-YYYY
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
    /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/, // SQL datetime
  ];

  const matchesPattern = datePatterns.some(pattern => pattern.test(value));
  if (!matchesPattern) return false;

  // Verify it can be parsed as a valid date
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Recommends the best chart type based on data characteristics
 */
export function recommendChartType(
  numericCount: number,
  categoricalCount: number,
  rowCount: number,
  columnAnalyses: ColumnAnalysis[]
): ChartType {
  // No numeric columns - can't graph
  if (numericCount === 0) {
    return 'bar';
  }

  // Check for time series data
  const hasDateTime = columnAnalyses.some(col => col.isDateTime);
  if (hasDateTime && numericCount >= 1) {
    return 'line';
  }

  // Pie chart: good for showing parts of a whole
  // Requirements: 1 categorical, 1 numeric, not too many categories
  if (categoricalCount >= 1 && numericCount >= 1 && rowCount <= 15) {
    const categoricalCol = columnAnalyses.find(col => col.isCategorical);
    if (categoricalCol && categoricalCol.uniqueValueCount <= 10) {
      return 'pie';
    }
  }

  // Scatter plot: good for showing correlation between two numeric values
  if (numericCount >= 2 && categoricalCount === 0) {
    return 'scatter';
  }

  // Line chart: good for trends, especially with sequential/ordered data
  if (categoricalCount >= 1 && numericCount >= 1 && rowCount >= 5) {
    // Check if first column looks sequential
    const firstCategorical = columnAnalyses.find(col => col.isCategorical);
    if (firstCategorical && isSequentialData(firstCategorical.sampleValues)) {
      return 'line';
    }
  }

  // Default to bar chart - versatile and easy to understand
  return 'bar';
}

/**
 * Checks if values appear to be sequential (e.g., months, years, incremental numbers)
 */
function isSequentialData(values: any[]): boolean {
  if (values.length < 2) return false;

  // Check if values are numeric and sequential
  const numericValues = values.filter(v => typeof v === 'number');
  if (numericValues.length === values.length) {
    const sorted = [...numericValues].sort((a, b) => a - b);
    const differences = sorted.slice(1).map((val, i) => val - sorted[i]);
    const avgDiff = differences.reduce((sum, d) => sum + d, 0) / differences.length;
    const isUniform = differences.every(d => Math.abs(d - avgDiff) / avgDiff < 0.5);
    return isUniform;
  }

  // Check for common sequential patterns in strings
  const stringValues = values.filter(v => typeof v === 'string').map(v => v.toLowerCase());
  const monthPattern = /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/;
  const yearPattern = /^\d{4}$/;
  const hasMonths = stringValues.some(v => monthPattern.test(v));
  const hasYears = stringValues.some(v => yearPattern.test(v));

  return hasMonths || hasYears;
}

/**
 * Validates if the data can be graphed with the given configuration
 */
export function canGraphWithConfig(
  data: any[],
  columns: string[],
  xAxis: string,
  yAxis: string[]
): { valid: boolean; error?: string } {
  if (!data || data.length === 0) {
    return { valid: false, error: 'No data to graph' };
  }

  if (!xAxis) {
    return { valid: false, error: 'X-axis column not selected' };
  }

  if (!yAxis || yAxis.length === 0) {
    return { valid: false, error: 'Y-axis column(s) not selected' };
  }

  if (!columns.includes(xAxis)) {
    return { valid: false, error: `X-axis column "${xAxis}" not found in results` };
  }

  const missingYAxis = yAxis.find(col => !columns.includes(col));
  if (missingYAxis) {
    return { valid: false, error: `Y-axis column "${missingYAxis}" not found in results` };
  }

  // Check that Y-axis columns contain numeric data
  const firstRow = data[0];
  const nonNumericYAxis = yAxis.find(col => {
    const value = firstRow[col];
    return value !== null && value !== undefined && typeof value !== 'number';
  });

  if (nonNumericYAxis) {
    return { valid: false, error: `Y-axis column "${nonNumericYAxis}" does not contain numeric data` };
  }

  return { valid: true };
}
