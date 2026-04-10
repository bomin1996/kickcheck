import Link from 'next/link';
import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-[var(--accent)] shrink-0">
          KickCheck
        </Link>

        <SearchBar />

        <nav className="hidden md:flex items-center gap-6 text-sm shrink-0">
          <Link href="/ranking" className="hover:text-[var(--accent)] transition-colors">
            랭킹
          </Link>
          <Link href="/calendar" className="hover:text-[var(--accent)] transition-colors">
            발매 캘린더
          </Link>
          <Link href="/products" className="hover:text-[var(--accent)] transition-colors">
            전체 상품
          </Link>
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <MobileMenuButton />
      </div>
    </header>
  );
}

function MobileMenuButton() {
  return (
    <details className="md:hidden relative">
      <summary className="list-none cursor-pointer p-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </summary>
      <nav className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
        <Link href="/ranking" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          랭킹
        </Link>
        <Link href="/calendar" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          발매 캘린더
        </Link>
        <Link href="/products" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          전체 상품
        </Link>
      </nav>
    </details>
  );
}
