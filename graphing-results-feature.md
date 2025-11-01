# Feature Plan: Graph Query Results

## Overview

Add charting/graphing capabilities to SQLite Query Graph to visualize query results. Users will be able to toggle between table view and various chart types (bar, line, pie, area, scatter) to better understand their data patterns.

## Goals

1. Enable visual representation of query results alongside tabular data
2. Auto-detect numeric columns suitable for graphing
3. Provide intuitive chart configuration UI
4. Support multiple chart types for different data patterns
5. Maintain current table view functionality

## Technical Approach

### Charting Library Selection

**Recommended: Recharts**
- Pros: React-native, TypeScript support, responsive, good documentation
- Cons: Larger bundle size
- Installation: `npm install recharts`

**Alternative: Chart.js with react-chartjs-2**
- Pros: Mature, extensive chart types, smaller bundle
- Cons: Less React-friendly API

### Data Detection Logic

Implement smart detection for graphable data:

```typescript
interface GraphableData {
  hasNumericColumns: boolean;
  numericColumns: string[];
  categoricalColumns: string[];
  recommendedChartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  canGraph: boolean;
}
```

Detection rules:
- **Bar Chart**: 1+ categorical column, 1+ numeric column
- **Line Chart**: Time/sequence column + numeric columns
- **Pie Chart**: 1 categorical column, 1 numeric column, <20 rows
- **Scatter Plot**: 2+ numeric columns
- **Area Chart**: Time/sequence column + numeric column

### Architecture Changes

#### Component Structure

```
App.tsx
└── QueryResults.tsx (new component)
    ├── ResultsToolbar.tsx (new - view toggle, chart config)
    ├── TableView.tsx (extract existing DataSheetGrid)
    └── ChartView.tsx (new)
        ├── BarChart.tsx
        ├── LineChart.tsx
        ├── PieChart.tsx
        ├── AreaChart.tsx
        └── ScatterChart.tsx
```

#### State Management

Add to `App.tsx`:
```typescript
const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
const [chartConfig, setChartConfig] = useState<ChartConfig>({
  type: 'bar',
  xAxis: '',
  yAxis: [],
  groupBy: null
});
```

## UI/UX Design

### Results View Toolbar

Located above query results, contains:

1. **View Toggle**
   - Table icon button (current view)
   - Chart icon button (new view)
   - Active state styling

2. **Chart Configuration Panel** (visible only in chart mode)
   - Chart Type selector (dropdown with icons)
   - X-Axis column selector
   - Y-Axis column selector(s) - multi-select for multiple series
   - Group By selector (optional, for stacked charts)
   - Color scheme selector (optional)

3. **Export Button** (future enhancement)
   - Export chart as PNG/SVG
   - Export data as CSV

### Layout

```
┌─────────────────────────────────────────────────┐
│  Query Results (150 rows)        [Table] [Chart]│
├─────────────────────────────────────────────────┤
│  Chart Config: [Bar ▼] X: name  Y: value        │
├─────────────────────────────────────────────────┤
│                                                  │
│              [Chart Display Area]                │
│                                                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Implementation Steps

### Phase 1: Foundation (Core Infrastructure)

1. **Install dependencies**
   ```bash
   cd frontend
   npm install recharts
   npm install --save-dev @types/recharts
   ```

2. **Create utility functions**
   - `utils/dataAnalysis.ts` - Detect column types and graphability
   - `utils/chartHelpers.ts` - Transform query data for charts
   - Add type definitions for chart configurations

3. **Extract TableView component**
   - Move DataSheetGrid logic from `App.tsx` to `components/TableView.tsx`
   - Accept `data` and `columns` as props
   - Maintain all existing functionality

### Phase 2: Chart Infrastructure

4. **Create ChartView component**
   - `components/ChartView.tsx` - Container for all chart types
   - Props: `data`, `columns`, `config`
   - Implement responsive sizing
   - Add loading states

5. **Implement individual chart components**
   - `components/charts/BarChart.tsx`
   - `components/charts/LineChart.tsx`
   - `components/charts/PieChart.tsx`
   - Start with bar and line, add others incrementally

6. **Data transformation layer**
   - Convert `QueryResult` format to Recharts data format
   - Handle null/undefined values
   - Aggregate data if needed (e.g., for pie charts)

### Phase 3: UI Controls

7. **Create ResultsToolbar component**
   - View mode toggle (table/chart)
   - Chart type selector
   - Axis configuration dropdowns
   - Use Bulma form components for consistency

8. **Create QueryResults component**
   - Wrapper component that orchestrates toolbar and views
   - Manages view mode state
   - Manages chart configuration state
   - Passes data to appropriate view

9. **Integrate into App.tsx**
   - Replace current results display with `QueryResults` component
   - Pass query results data through
   - Maintain existing error/loading states

### Phase 4: Smart Defaults

10. **Implement auto-configuration**
    - Detect column types when query executes
    - Auto-select sensible defaults for axes
    - Suggest optimal chart type
    - Pre-populate configuration panel

11. **Add validation**
    - Validate chart config before rendering
    - Show helpful error messages for invalid configs
    - Disable chart view if data is not graphable

### Phase 5: Polish

12. **Enhance chart appearance**
    - Add tooltips showing precise values
    - Implement zoom/pan for large datasets
    - Add legends for multiple series
    - Customize colors to match app theme

13. **Add persistence**
    - Remember last used view mode (localStorage)
    - Save chart configuration per query (optional)

14. **Performance optimization**
    - Limit chart rendering for very large datasets (>1000 rows)
    - Add warning/sampling for large datasets
    - Virtualize chart rendering if needed

## Data Flow

```
ExecuteQuery(sql)
    ↓
QueryResult {columns, data}
    ↓
analyzeData() → GraphableData
    ↓
[User selects chart view]
    ↓
autoConfigureChart() → ChartConfig
    ↓
transformDataForChart() → ChartData
    ↓
Recharts Component → Rendered Chart
```

## Code Examples

### Data Analysis Utility

```typescript
// utils/dataAnalysis.ts
export function analyzeQueryData(
  columns: string[],
  data: any[]
): GraphableData {
  const numericColumns = columns.filter(col =>
    isNumericColumn(data, col)
  );

  const categoricalColumns = columns.filter(col =>
    !numericColumns.includes(col)
  );

  const hasNumericColumns = numericColumns.length > 0;
  const hasCategoricalColumns = categoricalColumns.length > 0;

  return {
    hasNumericColumns,
    numericColumns,
    categoricalColumns,
    recommendedChartType: recommendChartType(
      numericColumns.length,
      categoricalColumns.length,
      data.length
    ),
    canGraph: hasNumericColumns && data.length > 0
  };
}

function isNumericColumn(data: any[], columnName: string): boolean {
  const sample = data.slice(0, 100);
  const numericCount = sample.filter(row =>
    typeof row[columnName] === 'number'
  ).length;
  return numericCount / sample.length > 0.8; // 80% numeric
}
```

### Chart Configuration

```typescript
// types/chart.ts
export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
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
```

### Data Transformation

```typescript
// utils/chartHelpers.ts
export function transformToChartData(
  data: any[],
  config: ChartConfig
): ChartData[] {
  return data.map(row => ({
    name: row[config.xAxis],
    ...config.yAxis.reduce((acc, yCol) => ({
      ...acc,
      [yCol]: row[yCol]
    }), {})
  }));
}
```

### BarChart Component Example

```typescript
// components/charts/BarChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartViewProps {
  data: ChartData[];
  config: ChartConfig;
}

export default function BarChartView({ data, config }: BarChartViewProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {config.yAxis.map((yKey, index) => (
          <Bar
            key={yKey}
            dataKey={yKey}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## Testing Considerations

### Test Queries

Create sample queries for testing different chart types:

```sql
-- Bar Chart: Category vs Count
SELECT category, COUNT(*) as count
FROM products
GROUP BY category;

-- Line Chart: Time Series
SELECT date, sales
FROM daily_sales
ORDER BY date;

-- Pie Chart: Distribution
SELECT status, COUNT(*) as count
FROM orders
GROUP BY status;

-- Multi-Series Line: Comparison
SELECT month, revenue, expenses
FROM monthly_data
ORDER BY month;

-- Scatter Plot: Correlation
SELECT age, income
FROM customers;
```

### Edge Cases

- Empty result sets
- Single row/column
- Very large datasets (>1000 rows)
- Null values in numeric columns
- Mixed data types in same column
- Non-numeric data in suggested numeric columns
- Very long categorical values (truncation)
- Date/time columns (special handling)

## Future Enhancements

1. **Advanced Chart Types**
   - Heatmaps for correlation analysis
   - Candlestick charts for time series
   - Treemaps for hierarchical data

2. **Interactivity**
   - Click chart elements to filter table
   - Brush/zoom for time series
   - Drill-down capabilities

3. **Customization**
   - Custom color schemes
   - Chart annotations
   - Axis formatting options (currency, percentage)

4. **Export Features**
   - Export charts as images
   - Copy chart to clipboard
   - Share chart configuration

5. **Multiple Charts**
   - Display multiple charts for same dataset
   - Dashboard view with multiple visualizations
   - Compare different groupings side-by-side

## Success Metrics

- Users can visualize query results with <3 clicks
- Auto-configuration selects correct chart type >80% of time
- Chart rendering completes in <500ms for typical datasets
- No performance degradation for table view
- Chart view works for >90% of numeric queries

## Dependencies

```json
{
  "recharts": "^2.5.0"
}
```

## Timeline Estimate

- Phase 1 (Foundation): 2-4 hours
- Phase 2 (Charts): 4-6 hours
- Phase 3 (UI Controls): 3-4 hours
- Phase 4 (Smart Defaults): 2-3 hours
- Phase 5 (Polish): 3-4 hours

**Total: 14-21 hours** for full implementation with all chart types
