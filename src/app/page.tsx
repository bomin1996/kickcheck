import Link from 'next/link';

// TODO: Phase 2에서 실제 데이터로 교체
const MOCK_TRENDING = [
  { slug: 'air-jordan-1-retro-high-og-chicago', name: 'Air Jordan 1 Retro High OG "Chicago"', brand: 'Nike', price: 430000, change: 5.2 },
  { slug: 'new-balance-993-grey', name: 'New Balance 993 Grey', brand: 'New Balance', price: 289000, change: -2.1 },
  { slug: 'nike-dunk-low-panda', name: 'Nike Dunk Low "Panda"', brand: 'Nike', price: 156000, change: 1.8 },
  { slug: 'adidas-samba-og-white', name: 'adidas Samba OG White', brand: 'adidas', price: 135000, change: -0.5 },
  { slug: 'nike-air-force-1-low-white', name: 'Nike Air Force 1 Low White', brand: 'Nike', price: 119000, change: 0.3 },
];

const MOCK_RELEASES = [
  { slug: 'travis-scott-jordan-1-low-og', name: 'Travis Scott x Air Jordan 1 Low OG', date: '2026-04-15', price: 179000 },
  { slug: 'new-balance-2002r-sea-salt', name: 'New Balance 2002R "Sea Salt"', date: '2026-04-18', price: 169000 },
  { slug: 'nike-air-max-1-86-og', name: 'Nike Air Max 1 \'86 OG', date: '2026-04-20', price: 189000 },
];

export default function HomePage() {
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
          {MOCK_TRENDING.map((item, i) => (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[var(--accent)] transition-colors"
            >
              <span className="text-2xl font-bold text-gray-300 w-8">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">{item.brand}</p>
                <p className="font-medium truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold">{item.price.toLocaleString()}원</span>
                  <span className={`text-xs ${item.change > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                    {item.change > 0 ? '▲' : '▼'} {Math.abs(item.change)}%
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 다가오는 발매 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">다가오는 발매</h2>
          <Link href="/calendar" className="text-sm text-[var(--accent)] hover:underline">
            캘린더 보기 &rarr;
          </Link>
        </div>
        <div className="space-y-3">
          {MOCK_RELEASES.map((item) => (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[var(--accent)] transition-colors"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">출시가 {item.price.toLocaleString()}원</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-[var(--accent)]">{item.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO 텍스트 */}
      <section className="text-center py-8 text-sm text-gray-400 space-y-2">
        <p>KickCheck은 크림(KREAM)과 StockX의 스니커즈 리셀 시세를 실시간으로 비교하는 플랫폼입니다.</p>
        <p>나이키, 아디다스, 뉴발란스 등 인기 브랜드의 한정판 가격 추이를 확인하세요.</p>
      </section>
    </div>
  );
}
