'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * 구글 애드센스 광고 배너
 * - 승인 후 data-ad-client를 실제 값으로 교체
 * - 개발 환경에서는 플레이스홀더 표시
 */
export default function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    if (!isProduction) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 광고 로드 실패 무시
    }
  }, [isProduction]);

  if (!isProduction) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 text-xs py-4 ${className}`}>
        AD ({slot})
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID || ''}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
