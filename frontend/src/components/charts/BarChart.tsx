import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartData } from "../../types/chart";
import { getChartColor } from "../../utils/chartHelpers";
import CustomTooltip from "./CustomTooltip";

interface BarChartProps {
  data: ChartData[];
  xAxisKey: string;
  yAxisKeys: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export default function BarChart({
  data,
  xAxisKey,
  yAxisKeys,
  showLegend = true,
  showGrid = true,
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="has-text-centered" style={{ padding: "3rem" }}>
        <p className="has-text-grey">No data to display</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
        <XAxis
          dataKey={xAxisKey}
          stroke="#4a5568"
          tick={{ fill: "#4a5568" }}
          angle={data.length > 10 ? -45 : 0}
          textAnchor={data.length > 10 ? "end" : "middle"}
          height={data.length > 10 ? 100 : 60}
        />
        <YAxis stroke="#4a5568" tick={{ fill: "#4a5568" }} />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(50, 115, 220, 0.1)" }}
        />
        {showLegend && yAxisKeys.length > 1 && (
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
        )}
        {yAxisKeys.map((yKey, index) => (
          <Bar
            key={yKey}
            dataKey={yKey}
            fill={getChartColor(index)}
            name={yKey}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
