import type { Metadata } from 'next';
import Link from 'next/link';
import { getProductsData } from '@/lib/data';

export const metadata: Metadata = {
  title: '전체 상품 - 스니커즈 시세 목록',
  description: '크림, StockX 스니커즈 전체 상품 시세 목록. 브랜드별, 가격별 필터링.',
};

export const revalidate = 3600;

const BRANDS = ['전체', 'Nike', 'adidas', 'New Balance', 'Jordan', 'ASICS', 'Converse'];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { keyword?: string; brand?: string; page?: string };
}) {
  const keyword = searchParams.keyword || '';
  const brand = searchParams.brand || '전체';
  const page = Number(searchParams.page) || 1;

  const { products, total } = await getProductsData({ keyword, brand, page, limit: 20 });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {keyword ? `"${keyword}" 검색 결과` : '전체 상품'}
        <span className="text-sm text-gray-400 font-normal ml-2">{total}개</span>
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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {products.map((product: any) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[var(--accent)] transition-colors"
          >
            {product.thumbnailUrl ? (
              <div className="aspect-square rounded-lg mb-3 overflow-hidden relative bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.thumbnailUrl} alt={product.modelName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-4xl">
                👟
              </div>
            )}
            <p className="text-xs text-gray-400">{product.brand?.name || product.brand}</p>
            <p className="font-medium truncate">{product.modelName}</p>
            <p className="text-xs text-gray-400">{product.styleCode}</p>
            {product.currentPrice && (
              <p className="font-bold mt-1">{product.currentPrice.toLocaleString()}원</p>
            )}
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-400 py-12">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
