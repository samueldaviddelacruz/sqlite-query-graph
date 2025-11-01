import {
  AreaChart as RechartsAreaChart,
  Area,
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

interface AreaChartProps {
  data: ChartData[];
  xAxisKey: string;
  yAxisKeys: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export default function AreaChart({
  data,
  xAxisKey,
  yAxisKeys,
  showLegend = true,
  showGrid = true,
}: AreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="has-text-centered" style={{ padding: "3rem" }}>
        <p className="has-text-grey">No data to display</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsAreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
        <XAxis
          dataKey={xAxisKey}
          stroke="#4a5568"
          tick={{ fill: "#4a5568" }}
          angle={data.length > 15 ? -45 : 0}
          textAnchor={data.length > 15 ? "end" : "middle"}
          height={data.length > 15 ? 100 : 60}
        />
        <YAxis stroke="#4a5568" tick={{ fill: "#4a5568" }} />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && yAxisKeys.length > 1 && (
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
        )}
        {yAxisKeys.map((yKey, index) => (
          <Area
            key={yKey}
            type="monotone"
            dataKey={yKey}
            stroke={getChartColor(index)}
            fill={getChartColor(index)}
            fillOpacity={0.6}
            strokeWidth={2}
            name={yKey}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
