import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { ChartData } from "../../types/chart";
import { getChartColor } from "../../utils/chartHelpers";

interface ScatterChartProps {
  data: ChartData[];
  xAxisKey: string;
  yAxisKeys: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export default function ScatterChart({
  data,
  xAxisKey,
  yAxisKeys,
  showLegend = true,
  showGrid = true,
}: ScatterChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="has-text-centered" style={{ padding: "3rem" }}>
        <p className="has-text-grey">No data to display</p>
      </div>
    );
  }

  // Transform data for scatter chart - each Y axis becomes a separate series
  const scatterData = yAxisKeys.map((yKey) => ({
    name: yKey,
    data: data.map((item) => ({
      x: Number(item[xAxisKey]) || 0,
      y: Number(item[yKey]) || 0,
    })),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
        <XAxis
          type="number"
          dataKey="x"
          name={xAxisKey}
          stroke="#4a5568"
          tick={{ fill: "#4a5568" }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yAxisKeys[0]}
          stroke="#4a5568"
          tick={{ fill: "#4a5568" }}
        />
        <ZAxis range={[60, 60]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #dbdbdb",
            borderRadius: "4px",
          }}
        />
        {showLegend && yAxisKeys.length > 1 && (
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
        )}
        {scatterData.map((series, index) => (
          <Scatter
            key={series.name}
            name={series.name}
            data={series.data}
            fill={getChartColor(index)}
          />
        ))}
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
}
