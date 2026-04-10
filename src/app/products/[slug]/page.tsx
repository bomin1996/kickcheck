import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getProductBySlugData, getSizePricesData, getPriceHistoryData } from '@/lib/data';
import { notFound } from 'next/navigation';

const PriceChart = dynamic(() => import('@/components/product/PriceChart'), { ssr: false });

export const revalidate = 1800; // 30분

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlugData(params.slug);
  if (!product) return { title: '상품을 찾을 수 없습니다' };

  const sizes = await getSizePricesData(product.id);
  const minPrice = sizes.length > 0 ? Math.min(...sizes.map(s => s.kreamAsk || Infinity)) : null;

  return {
    title: `${product.modelName} 시세 ${minPrice ? minPrice.toLocaleString() + '원~' : ''} | 크림 StockX 비교`,
    description: `${product.modelName} (${product.styleCode}) 크림/StockX 실시간 시세 비교. 사이즈별 가격, 시세 추이 차트.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlugData(params.slug);
  if (!product) notFound();

  const [sizes, priceHistory] = await Promise.all([
    getSizePricesData(product.id),
    getPriceHistoryData(product.id, 30),
  ]);

  const minPrice = sizes.length > 0 ? Math.min(...sizes.filter(s => s.kreamAsk).map(s => s.kreamAsk!)) : null;
  const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name || '';

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
          {product.imageUrl ? (
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.imageUrl} alt={product.modelName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 text-6xl">
              👟
            </div>
          )}
        </div>
        <div className="md:w-1/2 space-y-4">
          <p className="text-sm text-gray-400">{brandName}</p>
          <h1 className="text-2xl font-bold">{product.modelName}</h1>
          <div className="space-y-1 text-sm text-gray-500">
            {product.styleCode && <p>스타일 코드: <span className="text-foreground font-medium">{product.styleCode}</span></p>}
            {product.colorway && <p>컬러웨이: <span className="text-foreground">{product.colorway}</span></p>}
            {product.retailPrice && <p>출시가: <span className="text-foreground">{product.retailPrice.toLocaleString()}원</span></p>}
          </div>

          {minPrice && (
            <div className="p-4 rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/20">
              <p className="text-sm text-gray-500">크림 최저가</p>
              <p className="text-2xl font-bold text-[var(--accent)]">
                {minPrice.toLocaleString()}원~
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 시세 차트 */}
      <section>
        <h2 className="text-xl font-bold mb-4">시세 추이</h2>
        <PriceChart productId={product.id} initialData={priceHistory} />
      </section>

      {/* 사이즈별 가격 */}
      {sizes.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">사이즈별 가격</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {sizes.map((s) => (
              <div key={s.size} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-400">{s.size}</p>
                <p className="font-bold text-sm">{s.kreamAsk?.toLocaleString()}</p>
                {s.diffPercent !== null && (
                  <p className={`text-xs ${s.diffPercent > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                    StockX {s.diffPercent > 0 ? '+' : ''}{s.diffPercent.toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">* StockX 가격은 환율 적용 기준</p>
        </section>
      )}

      {/* 크림 vs StockX 비교 테이블 */}
      {sizes.length > 0 && (
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
                {sizes.map((s) => (
                  <tr key={s.size} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-2 font-medium">{s.size}</td>
                    <td className="py-3 px-2 text-right">{s.kreamAsk?.toLocaleString()}원</td>
                    <td className="py-3 px-2 text-right">{s.stockxAsk?.toLocaleString()}원</td>
                    <td className={`py-3 px-2 text-right ${s.diff && s.diff > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                      {s.diff ? `${s.diff > 0 ? '+' : ''}${s.diff.toLocaleString()}원` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <Link
              href={`/compare/${product.slug}`}
              className="inline-block px-5 py-2 text-sm border border-[var(--accent)] text-[var(--accent)] rounded-full hover:bg-[var(--accent)] hover:text-white transition-colors"
            >
              상세 비교 보기 &rarr;
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
