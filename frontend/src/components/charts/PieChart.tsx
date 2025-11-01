import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartData } from "../../types/chart";
import { CHART_COLORS } from "../../utils/chartHelpers";

interface PieChartProps {
  data: ChartData[];
  nameKey: string;
  valueKey: string;
  showLegend?: boolean;
}

export default function PieChart({
  data,
  nameKey,
  valueKey,
  showLegend = true,
}: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="has-text-centered" style={{ padding: "3rem" }}>
        <p className="has-text-grey">No data to display</p>
      </div>
    );
  }

  // Transform data to format expected by Recharts Pie
  const pieData = data.map((item) => ({
    name: String(item[nameKey] || 'Unknown'),
    value: Number(item[valueKey]) || 0,
  }));

  // Custom label renderer to show percentages
  const renderLabel = (entry: any) => {
    const total = pieData.reduce((sum, item) => sum + item.value, 0);
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsPieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={renderLabel}
          labelLine={true}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #dbdbdb",
            borderRadius: "4px",
          }}
        />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ paddingTop: "20px" }}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
