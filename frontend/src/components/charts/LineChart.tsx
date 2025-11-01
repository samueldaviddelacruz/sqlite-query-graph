import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartData } from "../../types/chart";
import { getChartColor } from "../../utils/chartHelpers";

interface LineChartProps {
  data: ChartData[];
  xAxisKey: string;
  yAxisKeys: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export default function LineChart({
  data,
  xAxisKey,
  yAxisKeys,
  showLegend = true,
  showGrid = true,
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="has-text-centered" style={{ padding: "3rem" }}>
        <p className="has-text-grey">No data to display</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #dbdbdb",
            borderRadius: "4px",
          }}
        />
        {showLegend && yAxisKeys.length > 1 && (
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
        )}
        {yAxisKeys.map((yKey, index) => (
          <Line
            key={yKey}
            type="monotone"
            dataKey={yKey}
            stroke={getChartColor(index)}
            strokeWidth={2}
            name={yKey}
            dot={{ fill: getChartColor(index), r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
