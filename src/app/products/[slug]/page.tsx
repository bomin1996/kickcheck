import type { Metadata } from 'next';
import Link from 'next/link';

// TODO: Phase 2에서 실제 DB 데이터로 교체
const MOCK_PRODUCT = {
  modelName: 'Air Jordan 1 Retro High OG "Chicago"',
  brand: 'Nike',
  styleCode: 'DZ5485-612',
  colorway: 'White/Varsity Red-Black',
  retailPrice: 209000,
  releaseDate: '2025-10-18',
};

const MOCK_SIZES: { size: string; kreamAsk: number | null; stockxAsk: number | null }[] = [
  { size: '250', kreamAsk: 410000, stockxAsk: 395000 },
  { size: '255', kreamAsk: 420000, stockxAsk: 405000 },
  { size: '260', kreamAsk: 430000, stockxAsk: 415000 },
  { size: '265', kreamAsk: 450000, stockxAsk: 430000 },
  { size: '270', kreamAsk: 480000, stockxAsk: 460000 },
  { size: '275', kreamAsk: 510000, stockxAsk: 490000 },
  { size: '280', kreamAsk: 530000, stockxAsk: 510000 },
  { size: '285', kreamAsk: 490000, stockxAsk: 470000 },
  { size: '290', kreamAsk: 460000, stockxAsk: 440000 },
  { size: '300', kreamAsk: 440000, stockxAsk: 420000 },
];

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // TODO: Phase 2에서 params.slug로 DB 조회
  void params;
  const product = MOCK_PRODUCT;
  const price = MOCK_SIZES[2]?.kreamAsk;

  return {
    title: `${product.modelName} 시세 ${price?.toLocaleString()}원 | 크림 StockX 비교`,
    description: `${product.modelName} (${product.styleCode}) 크림/StockX 실시간 시세 비교. 사이즈별 가격, 시세 추이 차트. 현재 크림 ${price?.toLocaleString()}원.`,
  };
}

export default function ProductDetailPage({ params }: Props) {
  void params;
  const product = MOCK_PRODUCT;

  return (
    <div className="space-y-8">
      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-400">
        <Link href="/" className="hover:text-[var(--accent)]">홈</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-[var(--accent)]">전체 상품</Link>
        <span className="mx-2">/</span>
        <span>{product.modelName}</span>
      </nav>

      {/* 상품 정보 */}
      <section className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
            상품 이미지
          </div>
        </div>
        <div className="md:w-1/2 space-y-4">
          <p className="text-sm text-gray-400">{product.brand}</p>
          <h1 className="text-2xl font-bold">{product.modelName}</h1>
          <div className="space-y-1 text-sm text-gray-500">
            <p>스타일 코드: <span className="text-foreground">{product.styleCode}</span></p>
            <p>컬러웨이: <span className="text-foreground">{product.colorway}</span></p>
            <p>출시가: <span className="text-foreground">{product.retailPrice?.toLocaleString()}원</span></p>
            <p>출시일: <span className="text-foreground">{product.releaseDate}</span></p>
          </div>

          {/* 현재 최저가 */}
          <div className="p-4 rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/20">
            <p className="text-sm text-gray-500">크림 최저가</p>
            <p className="text-2xl font-bold text-[var(--accent)]">
              {MOCK_SIZES[0]?.kreamAsk?.toLocaleString()}원~
            </p>
          </div>
        </div>
      </section>

      {/* 시세 차트 영역 (Phase 2에서 Recharts로 교체) */}
      <section>
        <h2 className="text-xl font-bold mb-4">시세 추이</h2>
        <div className="flex gap-2 mb-4">
          {['7일', '30일', '90일', '1년'].map((p) => (
            <button
              key={p}
              className="px-3 py-1 text-sm rounded-full border border-gray-300 dark:border-gray-700 hover:border-[var(--accent)] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
          시세 차트 (Phase 2에서 구현)
        </div>
      </section>

      {/* 사이즈별 가격 */}
      <section>
        <h2 className="text-xl font-bold mb-4">사이즈별 가격</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {MOCK_SIZES.map((s) => {
            const diff = s.kreamAsk && s.stockxAsk ? s.kreamAsk - s.stockxAsk : null;
            const diffPercent = diff && s.stockxAsk ? (diff / s.stockxAsk) * 100 : null;

            return (
              <div key={s.size} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-400">{s.size}</p>
                <p className="font-bold text-sm">{s.kreamAsk?.toLocaleString()}</p>
                {diffPercent !== null && (
                  <p className={`text-xs ${diffPercent > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                    StockX {diffPercent > 0 ? '+' : ''}{diffPercent.toFixed(1)}%
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">* StockX 가격은 환율 적용 기준 (1 USD = 1,350원)</p>
      </section>

      {/* 크림 vs StockX 비교 */}
      <section>
        <h2 className="text-xl font-bold mb-4">크림 vs StockX</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2">사이즈</th>
                <th className="text-right py-3 px-2 text-[var(--accent)]">크림</th>
                <th className="text-right py-3 px-2 text-green-600">StockX</th>
                <th className="text-right py-3 px-2">차이</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SIZES.map((s) => {
                const diff = s.kreamAsk && s.stockxAsk ? s.kreamAsk - s.stockxAsk : null;
                return (
                  <tr key={s.size} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-2 font-medium">{s.size}</td>
                    <td className="py-3 px-2 text-right">{s.kreamAsk?.toLocaleString()}원</td>
                    <td className="py-3 px-2 text-right">{s.stockxAsk?.toLocaleString()}원</td>
                    <td className={`py-3 px-2 text-right ${diff && diff > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                      {diff ? `${diff > 0 ? '+' : ''}${diff.toLocaleString()}원` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
