'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DataPoint {
  nombre: string;
  titulo: string;
  inscritos: number;
  disponibles: number;
}

interface Props {
  data: DataPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as DataPoint;
    const total = d.inscritos + d.disponibles;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md text-sm">
        <p className="font-semibold text-gray-900 mb-1">{d.titulo}</p>
        <p className="text-blue-600">Inscritos: {d.inscritos}</p>
        <p className="text-gray-400">Disponibles: {d.disponibles}</p>
        <p className="text-gray-600 text-xs mt-1">Cupo total: {total}</p>
      </div>
    );
  }
  return null;
};

export default function CapacityChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Sin proyectos activos
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="nombre"
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" />
        <Bar dataKey="inscritos" name="Inscritos" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} />
        <Bar dataKey="disponibles" name="Disponibles" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
