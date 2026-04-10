'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface PricePoint {
  date: string;
  kreamPrice: number | null;
  stockxPrice: number | null;
}

interface PriceChartProps {
  productId: number;
  initialData: PricePoint[];
}

const PERIODS = [
  { key: '7', label: '7일' },
  { key: '30', label: '30일' },
  { key: '90', label: '90일' },
  { key: '365', label: '1년' },
] as const;

export default function PriceChart({ productId, initialData }: PriceChartProps) {
  const [period, setPeriod] = useState('30');
  const [data, setData] = useState<PricePoint[]>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (period === '30') {
      setData(initialData);
      return;
    }

    setLoading(true);
    fetch(`/api/prices/${productId}?days=${period}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period, productId, initialData]);

  const formatYAxis = (value: number) => {
    if (value >= 10000) return `${Math.floor(value / 10000)}만`;
    return `${value}`;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltip = (value: any) => `${Number(value).toLocaleString()}원`;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              period === p.key
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'border-gray-300 dark:border-gray-700 hover:border-[var(--accent)]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          로딩 중...
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          가격 데이터가 없습니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(d) => {
                const date = new Date(d);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxis}
              domain={['dataMin - 10000', 'dataMax + 10000']}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={(d) => new Date(d).toLocaleDateString('ko-KR')}
            />
            <Line
              type="monotone"
              dataKey="kreamPrice"
              stroke="#FF6B35"
              strokeWidth={2}
              name="크림"
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="stockxPrice"
              stroke="#16A34A"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="StockX"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="flex gap-4 justify-center mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-[#FF6B35] inline-block" /> 크림
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-[#16A34A] inline-block border-dashed" style={{ borderTop: '2px dashed #16A34A', height: 0 }} /> StockX
        </span>
      </div>
    </div>
  );
}
