import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getProductBySlugData, getSizePricesData, getPriceHistoryData } from '@/lib/data';
import { notFound } from 'next/navigation';

const PriceChart = dynamic(() => import('@/components/product/PriceChart'), { ssr: false });

export const revalidate = 1800;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlugData(params.slug);
  if (!product) return { title: '상품을 찾을 수 없습니다' };

  return {
    title: `${product.modelName} 크림 vs StockX 가격 비교`,
    description: `${product.modelName} 크림과 StockX 사이즈별 가격 비교. 어디서 사는 게 더 저렴할까? 환율 적용 실시간 비교.`,
  };
}

export default async function ComparePage({ params }: Props) {
  const product = await getProductBySlugData(params.slug);
  if (!product) notFound();

  const [sizes, priceHistory] = await Promise.all([
    getSizePricesData(product.id),
    getPriceHistoryData(product.id, 30),
  ]);

  // 크림이 더 싼 사이즈 개수
  const kreamCheaper = sizes.filter(s => s.diff !== null && s.diff < 0).length;
  const stockxCheaper = sizes.filter(s => s.diff !== null && s.diff > 0).length;
  const avgDiff = sizes.length > 0
    ? sizes.reduce((sum, s) => sum + (s.diffPercent || 0), 0) / sizes.length
    : 0;

  return (
    <div className="space-y-8">
      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-400">
        <Link href="/" className="hover:text-[var(--accent)]">홈</Link>
        <span className="mx-2">/</span>
        <Link href={`/products/${product.slug}`} className="hover:text-[var(--accent)]">{product.modelName}</Link>
        <span className="mx-2">/</span>
        <span>크림 vs StockX 비교</span>
      </nav>

      <h1 className="text-2xl font-bold">
        {product.modelName}
        <span className="block text-lg text-gray-500 font-normal mt-1">크림 vs StockX 가격 비교</span>
      </h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 mb-1">크림이 더 싼 사이즈</p>
          <p className="text-2xl font-bold text-[var(--accent)]">{kreamCheaper}개</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 mb-1">StockX가 더 싼 사이즈</p>
          <p className="text-2xl font-bold text-green-600">{stockxCheaper}개</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 mb-1">평균 가격 차이</p>
          <p className={`text-2xl font-bold ${avgDiff > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
            {avgDiff > 0 ? '크림 +' : 'StockX +'}{Math.abs(avgDiff).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* 결론 박스 */}
      <div className={`p-4 rounded-xl border-2 ${avgDiff > 0 ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-[var(--accent)] bg-[var(--accent-light)]'}`}>
        <p className="font-bold text-lg">
          {avgDiff > 0
            ? `💡 이 상품은 StockX에서 평균 ${Math.abs(avgDiff).toFixed(1)}% 더 저렴합니다`
            : `💡 이 상품은 크림에서 평균 ${Math.abs(avgDiff).toFixed(1)}% 더 저렴합니다`
          }
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          * StockX 가격은 환율 및 관세/배송비 제외 기준. 실제 해외직구 시 추가 비용이 발생할 수 있습니다.
        </p>
      </div>

      {/* 시세 추이 비교 차트 */}
      <section>
        <h2 className="text-xl font-bold mb-4">시세 추이 비교</h2>
        <PriceChart productId={product.id} initialData={priceHistory} />
      </section>

      {/* 사이즈별 상세 비교 */}
      <section>
        <h2 className="text-xl font-bold mb-4">사이즈별 상세 비교</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-3">사이즈</th>
                <th className="text-right py-3 px-3">
                  <span className="text-[var(--accent)]">크림</span>
                </th>
                <th className="text-right py-3 px-3">
                  <span className="text-green-600">StockX</span>
                </th>
                <th className="text-right py-3 px-3">차이</th>
                <th className="text-center py-3 px-3">추천</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((s) => {
                const winner = s.diff === null ? null : s.diff > 0 ? 'stockx' : s.diff < 0 ? 'kream' : null;
                return (
                  <tr key={s.size} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-3 font-medium">{s.size}</td>
                    <td className={`py-3 px-3 text-right ${winner === 'kream' ? 'font-bold text-[var(--accent)]' : ''}`}>
                      {s.kreamAsk?.toLocaleString()}원
                    </td>
                    <td className={`py-3 px-3 text-right ${winner === 'stockx' ? 'font-bold text-green-600' : ''}`}>
                      {s.stockxAsk?.toLocaleString()}원
                    </td>
                    <td className={`py-3 px-3 text-right ${s.diff && s.diff > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                      {s.diff ? `${s.diff > 0 ? '+' : ''}${s.diff.toLocaleString()}원` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {winner === 'kream' && <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">크림</span>}
                      {winner === 'stockx' && <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">StockX</span>}
                      {winner === null && <span className="text-xs text-gray-400">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 상품 상세로 이동 */}
      <div className="text-center">
        <Link
          href={`/products/${product.slug}`}
          className="inline-block px-6 py-3 border border-[var(--accent)] text-[var(--accent)] rounded-full font-medium hover:bg-[var(--accent)] hover:text-white transition-colors"
        >
          상품 상세 정보 보기
        </Link>
      </div>
    </div>
  );
}
