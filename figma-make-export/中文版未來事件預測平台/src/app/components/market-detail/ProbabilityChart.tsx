import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ProbabilityChartProps {
  marketId: string;
  type: 'yes_no' | 'single_choice' | 'multiple_choice';
}

export function ProbabilityChart({ marketId, type }: ProbabilityChartProps) {
  // Mock data
  const data = [
    { time: '01/05 10:00', probability: 50 },
    { time: '01/05 14:00', probability: 52 },
    { time: '01/06 09:00', probability: 55 },
    { time: '01/06 16:00', probability: 58 },
    { time: '01/07 11:00', probability: 62 },
    { time: '01/07 18:00', probability: 60 },
    { time: '01/08 10:00', probability: 63 },
    { time: '01/09 14:00', probability: 65 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">機率變化</h2>
        </div>
        <p className="text-3xl font-bold text-green-600">65%</p>
      </div>

      <ResponsiveContainer width="100%" aspect={16/9}>
        <LineChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            orientation="right"
            tickFormatter={(value) => `${value}%`}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Line
            type="monotone"
            dataKey="probability"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#6366f1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}