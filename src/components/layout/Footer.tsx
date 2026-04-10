import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <span className="text-lg font-bold text-[var(--accent)]">KickCheck</span>
            <p className="text-sm text-gray-500 mt-1">
              스니커즈 리셀 시세 비교 플랫폼
            </p>
          </div>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/products" className="hover:text-[var(--accent)]">전체 상품</Link>
            <Link href="/ranking" className="hover:text-[var(--accent)]">랭킹</Link>
            <Link href="/calendar" className="hover:text-[var(--accent)]">발매 캘린더</Link>
          </nav>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          KickCheck은 가격 정보를 제공하며, 직접 거래를 중개하지 않습니다.
          표시된 가격은 실제 거래가와 다를 수 있습니다.
        </p>
      </div>
    </footer>
  );
}
