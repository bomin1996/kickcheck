import Link from 'next/link';
import { getRankingData, getUpcomingReleasesData } from '@/lib/data';

export const revalidate = 3600; // 1시간

export default async function HomePage() {
  const [ranking, upcoming] = await Promise.all([
    getRankingData(6),
    getUpcomingReleasesData(4),
  ]);

  return (
    <div className="space-y-12">
      {/* 히어로 */}
      <section className="text-center py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          스니커즈 시세, <span className="text-[var(--accent)]">한눈에 비교</span>
        </h1>
        <p className="text-gray-500 text-lg">
          크림 · StockX 가격을 비교하고, 최적의 타이밍에 구매하세요
        </p>
      </section>

      {/* 인기 상품 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">실시간 인기 상품</h2>
          <Link href="/ranking" className="text-sm text-[var(--accent)] hover:underline">
            전체 보기 &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranking.map((item) => (
            <Link
              key={item.product.slug}
              href={`/products/${item.product.slug}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[var(--accent)] transition-colors"
            >
              <span className="text-2xl font-bold text-gray-300 w-8">{item.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">{item.product.brand.name}</p>
                <p className="font-medium truncate">{item.product.modelName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold">{item.currentPrice.toLocaleString()}원</span>
                  <span className={`text-xs ${item.changePercent > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                    {item.changePercent > 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 다가오는 발매 */}
      {upcoming.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">다가오는 발매</h2>
            <Link href="/calendar" className="text-sm text-[var(--accent)] hover:underline">
              캘린더 보기 &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((item) => (
              <Link
                key={item.slug}
                href={`/products/${item.slug}`}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[var(--accent)] transition-colors"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">출시가 {item.price?.toLocaleString()}원</p>
                </div>
                <p className="text-sm font-bold text-[var(--accent)] shrink-0 ml-4">{item.date}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="text-center py-8">
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          전체 상품 시세 보기
        </Link>
      </section>

      {/* SEO 텍스트 */}
      <section className="text-center py-8 text-sm text-gray-400 space-y-2">
        <p>KickCheck은 크림(KREAM)과 StockX의 스니커즈 리셀 시세를 실시간으로 비교하는 플랫폼입니다.</p>
        <p>나이키, 아디다스, 뉴발란스 등 인기 브랜드의 한정판 가격 추이를 확인하세요.</p>
      </section>
    </div>
  );
}
