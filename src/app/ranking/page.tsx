import type { Metadata } from 'next';
import Link from 'next/link';
import { getRankingData } from '@/lib/data';

export const metadata: Metadata = {
  title: '스니커즈 인기 순위 TOP 100 | 리셀 시세 랭킹',
  description: '실시간 스니커즈 인기 순위. 거래량, 가격 등락률 기준 랭킹. 크림/StockX 시세 비교.',
};

export const revalidate = 3600;

export default async function RankingPage() {
  const ranking = await getRankingData(20);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">인기 랭킹</h1>
      <p className="text-gray-500 text-sm mb-6">최근 7일 기준 등락률 순위</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 w-12">#</th>
              <th className="text-left py-3 px-2">상품명</th>
              <th className="text-right py-3 px-2">크림 시세</th>
              <th className="text-right py-3 px-2">7일 등락</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((item) => {
              const brandName = typeof item.product.brand === 'string' ? item.product.brand : item.product.brand?.name || '';
              return (
                <tr key={item.rank} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="py-4 px-2">
                    <span className={`font-bold ${item.rank <= 3 ? 'text-[var(--accent)]' : 'text-gray-400'}`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <Link href={`/products/${item.product.slug}`} className="hover:text-[var(--accent)]">
                      <p className="font-medium">{item.product.modelName}</p>
                      <p className="text-xs text-gray-400">{brandName}</p>
                    </Link>
                  </td>
                  <td className="py-4 px-2 text-right font-bold">
                    {item.currentPrice.toLocaleString()}원
                  </td>
                  <td className={`py-4 px-2 text-right font-bold ${item.changePercent > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                    {item.changePercent > 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
