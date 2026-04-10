import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'KickCheck - 스니커즈 리셀 시세 비교 | 크림 StockX 가격',
    template: '%s | KickCheck',
  },
  description: '크림, StockX 스니커즈 리셀 시세를 한눈에 비교. 실시간 가격 추이, 사이즈별 시세, 발매 캘린더, 인기 랭킹.',
  keywords: ['스니커즈 시세', '크림 시세', '리셀가', 'StockX', '스니커즈 가격 비교', '한정판'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'KickCheck',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
