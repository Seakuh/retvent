import React from 'react';
import { BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import { TicketSale } from '../../types';

interface TicketSalesBarChartProps {
  data: TicketSale[];
}

const TicketSalesBarChart: React.FC<TicketSalesBarChartProps> = ({ data }) => {
  // Format dates to be more readable
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Calculate total sales
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  
  // Calculate average daily sales
  const avgDailySales = Math.round(totalSales / data.length);

  return (
    <Card 
      title="Ticket Sales" 
      icon={BarChartIcon}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Total Sales</div>
            <div style={{ fontWeight: '600' }}>{totalSales} tickets</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Daily Average</div>
            <div style={{ fontWeight: '600' }}>{avgDailySales} tickets</div>
          </div>
        </div>
      }
    >
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TicketSalesBarChart;