import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // TODO: Phase 2에서 DB에서 상품 slug 목록을 가져와 동적 생성
  const staticPages = [
    { url: 'https://kickcheck.kr', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: 'https://kickcheck.kr/products', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: 'https://kickcheck.kr/ranking', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: 'https://kickcheck.kr/calendar', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
  ];

  return staticPages;
}
