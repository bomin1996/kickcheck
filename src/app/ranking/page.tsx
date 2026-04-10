import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '스니커즈 인기 순위 TOP 100 | 리셀 시세 랭킹',
  description: '실시간 스니커즈 인기 순위. 거래량, 가격 등락률 기준 랭킹. 크림/StockX 시세 비교.',
};

// TODO: Phase 4에서 실제 데이터로 교체
const MOCK_RANKING = [
  { rank: 1, slug: 'air-jordan-1-retro-high-og-chicago', name: 'Air Jordan 1 Retro High OG "Chicago"', brand: 'Nike', price: 430000, change: 5.2 },
  { rank: 2, slug: 'new-balance-993-grey', name: 'New Balance 993 Grey', brand: 'New Balance', price: 289000, change: 3.8 },
  { rank: 3, slug: 'nike-dunk-low-panda', name: 'Nike Dunk Low "Panda"', brand: 'Nike', price: 156000, change: 1.8 },
  { rank: 4, slug: 'adidas-samba-og-white', name: 'adidas Samba OG White', brand: 'adidas', price: 135000, change: -0.5 },
  { rank: 5, slug: 'nike-air-force-1-low-white', name: 'Nike Air Force 1 Low White', brand: 'Nike', price: 119000, change: 0.3 },
  { rank: 6, slug: 'new-balance-2002r-sea-salt', name: 'New Balance 2002R "Sea Salt"', brand: 'New Balance', price: 198000, change: -2.1 },
  { rank: 7, slug: 'nike-air-max-90', name: 'Nike Air Max 90', brand: 'Nike', price: 159000, change: 1.2 },
  { rank: 8, slug: 'jordan-4-retro-bred', name: 'Jordan 4 Retro "Bred"', brand: 'Jordan', price: 520000, change: 4.5 },
  { rank: 9, slug: 'asics-gel-kayano-14', name: 'ASICS Gel-Kayano 14', brand: 'ASICS', price: 178000, change: 6.1 },
  { rank: 10, slug: 'converse-chuck-70-black', name: 'Converse Chuck 70 Black', brand: 'Converse', price: 89000, change: -1.3 },
];

export default function RankingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">인기 랭킹</h1>
      <p className="text-gray-500 text-sm mb-6">최근 7일 기준 거래량 · 등락률 순위</p>

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
            {MOCK_RANKING.map((item) => (
              <tr key={item.rank} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="py-4 px-2">
                  <span className={`font-bold ${item.rank <= 3 ? 'text-[var(--accent)]' : 'text-gray-400'}`}>
                    {item.rank}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <Link href={`/products/${item.slug}`} className="hover:text-[var(--accent)]">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.brand}</p>
                  </Link>
                </td>
                <td className="py-4 px-2 text-right font-bold">
                  {item.price.toLocaleString()}원
                </td>
                <td className={`py-4 px-2 text-right font-bold ${item.change > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                  {item.change > 0 ? '▲' : '▼'} {Math.abs(item.change)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
