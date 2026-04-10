import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '전체 상품 - 스니커즈 시세 목록',
  description: '크림, StockX 스니커즈 전체 상품 시세 목록. 브랜드별, 가격별 필터링.',
};

// TODO: Phase 2에서 실제 데이터로 교체
const MOCK_PRODUCTS = [
  { slug: 'air-jordan-1-retro-high-og-chicago', name: 'Air Jordan 1 Retro High OG "Chicago"', brand: 'Nike', price: 430000, styleCode: 'DZ5485-612' },
  { slug: 'new-balance-993-grey', name: 'New Balance 993 Grey', brand: 'New Balance', price: 289000, styleCode: 'MR993GL' },
  { slug: 'nike-dunk-low-panda', name: 'Nike Dunk Low "Panda"', brand: 'Nike', price: 156000, styleCode: 'DD1391-100' },
  { slug: 'adidas-samba-og-white', name: 'adidas Samba OG White', brand: 'adidas', price: 135000, styleCode: 'B75806' },
  { slug: 'nike-air-force-1-low-white', name: 'Nike Air Force 1 Low White', brand: 'Nike', price: 119000, styleCode: '315122-111' },
  { slug: 'new-balance-2002r-sea-salt', name: 'New Balance 2002R "Sea Salt"', brand: 'New Balance', price: 198000, styleCode: 'M2002RHQ' },
];

const BRANDS = ['전체', 'Nike', 'adidas', 'New Balance', 'Jordan', 'Converse'];

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { keyword?: string; brand?: string };
}) {
  const keyword = searchParams.keyword || '';
  const brand = searchParams.brand || '전체';

  const filtered = MOCK_PRODUCTS.filter((p) => {
    if (keyword && !p.name.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (brand !== '전체' && p.brand !== brand) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {keyword ? `"${keyword}" 검색 결과` : '전체 상품'}
      </h1>

      {/* 브랜드 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {BRANDS.map((b) => (
          <Link
            key={b}
            href={`/products?brand=${b === '전체' ? '' : b}${keyword ? `&keyword=${keyword}` : ''}`}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
              (b === '전체' && !searchParams.brand) || b === brand
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'border-gray-300 dark:border-gray-700 hover:border-[var(--accent)]'
            }`}
          >
            {b}
          </Link>
        ))}
      </div>

      {/* 상품 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[var(--accent)] transition-colors"
          >
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-sm">
              이미지
            </div>
            <p className="text-xs text-gray-400">{product.brand}</p>
            <p className="font-medium truncate">{product.name}</p>
            <p className="text-xs text-gray-400">{product.styleCode}</p>
            <p className="font-bold mt-1">{product.price.toLocaleString()}원</p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
