'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  hora: string;
  nuevos: number;
}

interface Props {
  data: DataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-purple-600">Inscripciones: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function HourlyChart({ data }: Props) {
  const hasData = data.some((d) => d.nuevos > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Sin inscripciones hoy
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="hora" tick={{ fontSize: 11 }} interval={2} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="nuevos" name="Inscripciones" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
