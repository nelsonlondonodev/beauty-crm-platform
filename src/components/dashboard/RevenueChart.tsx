import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Ene', ingresos: 4000 },
  { name: 'Feb', ingresos: 3000 },
  { name: 'Mar', ingresos: 2000 },
  { name: 'Abr', ingresos: 2780 },
  { name: 'May', ingresos: 1890 },
  { name: 'Jun', ingresos: 2390 },
  { name: 'Jul', ingresos: 3490 },
];

const RevenueChart: React.FC = () => {
  return (
    <div className="col-span-full lg:col-span-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm min-w-0 min-h-0">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Resumen de Ingresos</h2>
          <p className="text-sm text-gray-500">Ingresos mensuales de los últimos 7 meses</p>
        </div>
      </div>
      <div className="mt-4 w-full">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => [`$${value}`, 'Ingresos']}
            />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorIngresos)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
