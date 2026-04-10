import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { WebsiteJsonLd } from '@/components/seo/JsonLd';
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
  metadataBase: new URL('https://kickcheck.kr'),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="ko">
      <head>
        <WebsiteJsonLd />
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
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
