import { PieChart as PieChartIcon } from "lucide-react";
import React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { UserInsight } from "../../utils";
import Card from "../ui/Card";

interface UserInsightsPieProps {
  data: UserInsight[];
}

const UserInsightsPie: React.FC<UserInsightsPieProps> = ({ data }) => {
  const COLORS = ["var(--color-primary-500)", "var(--color-secondary-500)"];

  // Calculate total users
  const totalUsers = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card
      title="User Insights"
      icon={PieChartIcon}
      footer={
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)" }}
          >
            Total Users
          </div>
          <div style={{ fontWeight: "600" }}>{totalUsers}</div>
        </div>
      }
    >
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default UserInsightsPie;
