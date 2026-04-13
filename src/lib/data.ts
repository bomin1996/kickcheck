/**
 * 데이터 레이어: DB 연결이 있으면 DB 사용, 없으면 Mock 데이터 반환
 * Phase 2에서 Supabase 연결 후 DB 쿼리로 전환
 */

import type { PricePoint, SizePrice } from '@/types';

// ============ 공통 타입 ============

export interface RankingItem {
  rank: number;
  product: {
    slug: string;
    modelName: string;
    brand: { name: string; slug?: string };
  };
  currentPrice: number;
  priceChange: number;
  changePercent: number;
}

export interface CalendarDay {
  date: string;
  items: CalendarItem[];
}

export interface CalendarItem {
  slug: string;
  name: string;
  brand: string;
  price: number | null;
  platform: string | null;
  type: string | null;
}

export interface UpcomingItem {
  slug: string;
  name: string;
  brand: string;
  date: string;
  price: number | null;
}

// ============ MOCK 데이터 (DB 미연결 시 사용) ============

const MOCK_PRODUCTS = [
  { id: 1, slug: 'air-jordan-1-retro-high-og-chicago-dz5485-612', modelName: 'Air Jordan 1 Retro High OG "Chicago"', brand: { name: 'Nike', slug: 'nike' }, styleCode: 'DZ5485-612', colorway: 'White/Varsity Red-Black', retailPrice: 209000, releaseDate: new Date('2025-10-18'), thumbnailUrl: null, imageUrl: null, category: 'sneakers', currentPrice: 430000, change: 5.2 },
  { id: 2, slug: 'new-balance-993-grey-mr993gl', modelName: 'New Balance 993 Grey', brand: { name: 'New Balance', slug: 'new-balance' }, styleCode: 'MR993GL', colorway: 'Grey', retailPrice: 259000, releaseDate: null, thumbnailUrl: null, imageUrl: null, category: 'sneakers', currentPrice: 289000, change: -2.1 },
  { id: 3, slug: 'nike-dunk-low-panda-dd1391-100', modelName: 'Nike Dunk Low "Panda"', brand: { name: 'Nike', slug: 'nike' }, styleCode: 'DD1391-100', colorway: 'White/Black', retailPrice: 139000, releaseDate: null, thumbnailUrl: null, imageUrl: null, category: 'sneakers', currentPrice: 156000, change: 1.8 },
  { id: 4, slug: 'adidas-samba-og-white-b75806', modelName: 'adidas Samba OG White', brand: { name: 'adidas', slug: 'adidas' }, styleCode: 'B75806', colorway: 'Cloud White/Core Black', retailPrice: 129000, releaseDate: null, thumbnailUrl: null, imageUrl: null, category: 'sneakers', currentPrice: 135000, change: -0.5 },
  { id: 5, slug: 'nike-air-force-1-low-white-315122-111', modelName: 'Nike Air Force 1 Low White', brand: { name: 'Nike', slug: 'nike' }, styleCode: '315122-111', colorway: 'White/White', retailPrice: 139000, releaseDate: null, thumbnailUrl: null, imageUrl: null, category: 'sneakers', currentPrice: 119000, change: 0.3 },
  { id: 6, slug: 'new-balance-2002r-sea-salt-m2002rhq', modelName: 'New Balance 2002R "Sea Salt"', brand: { name: 'New Balance', slug: 'new-balance' }, styleCode: 'M2002RHQ', colorway: 'Sea Salt', retailPrice: 169000, releaseDate: new Date('2026-04-18'), thumbnailUrl: null, imageUrl: null, category: 'sneakers', currentPrice: 198000, change: 3.1 },
  { id: 7, slug: 'jordan-4-retro-bred-fv5029-006', modelName: 'Jordan 4 Retro "Bred"', brand: { name: 'Jordan', slug: 'jordan' }, styleCode: 'FV5029-006', colorway: 'Black/Fire Red-Cement Grey', retailPrice: 239000, releaseDate: null, thumbnailUrl: null, imageUrl: null, category: 'sneakers', currentPrice: 520000, change: 4.5 },
  { id: 8, slug: 'asics-gel-kayano-14-silver-1201a019-105', modelName: 'ASICS Gel-Kayano 14 "Silver"', brand: { name: 'ASICS', slug: 'asics' }, styleCode: '1201A019-105', colorway: 'White/Pure Silver', retailPrice: 179000, releaseDate: null, thumbnailUrl: null, imageUrl: null, category: 'sneakers', currentPrice: 178000, change: 6.1 },
];

function generateMockPriceHistory(basePrice: number, days: number): PricePoint[] {
  const data: PricePoint[] = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = 1 + (Math.sin(i * 0.3) * 0.05) + (Math.random() - 0.5) * 0.03;
    data.push({
      date: date.toISOString().split('T')[0],
      kreamPrice: Math.round(basePrice * variation),
      stockxPrice: Math.round(basePrice * variation * 0.93),
    });
  }
  return data;
}

// ============ 내보내기 함수 ============

let dbAvailable: boolean | null = null;

async function checkDb(): Promise<boolean> {
  if (dbAvailable !== null) return dbAvailable;
  try {
    const { prisma } = await import('./db');
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }
  return dbAvailable;
}

export async function getProductsData(params: { keyword?: string; brand?: string; page?: number; limit?: number }) {
  if (await checkDb()) {
    const { getProducts } = await import('./queries');
    return getProducts(params);
  }

  let filtered = [...MOCK_PRODUCTS];
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(p => p.modelName.toLowerCase().includes(kw) || p.styleCode?.toLowerCase().includes(kw));
  }
  if (params.brand && params.brand !== '전체') {
    filtered = filtered.filter(p => p.brand.name === params.brand);
  }
  return { products: filtered, total: filtered.length };
}

export async function getProductBySlugData(slug: string) {
  if (await checkDb()) {
    const { getProductBySlug } = await import('./queries');
    return getProductBySlug(slug);
  }
  return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
}

export async function getSizePricesData(productId: number): Promise<SizePrice[]> {
  if (await checkDb()) {
    const { getLatestSizePrices } = await import('./queries');
    return getLatestSizePrices(productId);
  }

  const sizes = ['250', '255', '260', '265', '270', '275', '280', '285', '290', '300'];
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  const base = product?.currentPrice || 300000;

  return sizes.map(size => {
    const kreamAsk = Math.round(base * (0.9 + Math.random() * 0.2));
    const stockxAsk = Math.round(kreamAsk * 0.93);
    return {
      size,
      kreamAsk,
      stockxAsk,
      diff: kreamAsk - stockxAsk,
      diffPercent: ((kreamAsk - stockxAsk) / stockxAsk) * 100,
    };
  });
}

export async function getPriceHistoryData(productId: number, days: number = 30): Promise<PricePoint[]> {
  if (await checkDb()) {
    const { getPriceHistory } = await import('./queries');
    return getPriceHistory(productId, days);
  }

  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  return generateMockPriceHistory(product?.currentPrice || 300000, days);
}

export async function getRankingData(limit: number = 20): Promise<RankingItem[]> {
  if (await checkDb()) {
    const { getRanking } = await import('./queries');
    return getRanking(limit);
  }

  return MOCK_PRODUCTS
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, limit)
    .map((p, i) => ({
      rank: i + 1,
      product: p,
      currentPrice: p.currentPrice,
      priceChange: Math.round(p.currentPrice * p.change / 100),
      changePercent: p.change,
    }));
}

const MOCK_RELEASES = [
  { date: '2026-04-15', items: [
    { slug: 'travis-scott-jordan-1-low-og', name: 'Travis Scott x Air Jordan 1 Low OG', brand: 'Jordan', price: 179000, platform: 'SNKRS 래플', type: 'raffle' },
    { slug: 'new-balance-990v6-grey', name: 'New Balance 990v6 Grey', brand: 'New Balance', price: 259000, platform: 'New Balance 공홈', type: 'general' },
  ]},
  { date: '2026-04-18', items: [
    { slug: 'new-balance-2002r-sea-salt-m2002rhq', name: 'New Balance 2002R "Sea Salt"', brand: 'New Balance', price: 169000, platform: '크림 드로우', type: 'raffle' },
  ]},
  { date: '2026-04-20', items: [
    { slug: 'nike-air-max-1-86-og', name: 'Nike Air Max 1 \'86 OG', brand: 'Nike', price: 189000, platform: 'Nike SNKRS', type: 'fcfs' },
  ]},
  { date: '2026-04-25', items: [
    { slug: 'adidas-yeezy-350-v2-bone', name: 'adidas Yeezy Boost 350 V2 "Bone"', brand: 'adidas', price: 299000, platform: 'adidas Confirmed', type: 'raffle' },
  ]},
];

export async function getCalendarData(year: number, month: number): Promise<CalendarDay[]> {
  if (await checkDb()) {
    const { getReleaseCalendar } = await import('./queries');
    return getReleaseCalendar(year, month);
  }
  return MOCK_RELEASES.filter(r => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

export async function getUpcomingReleasesData(limit: number = 5): Promise<UpcomingItem[]> {
  if (await checkDb()) {
    const { getUpcomingReleases } = await import('./queries');
    const releases = await getUpcomingReleases(limit);
    return releases.map(r => ({
      slug: r.product.slug,
      name: r.product.modelName,
      brand: r.product.brand.name,
      date: r.releaseDate.toISOString().split('T')[0],
      price: r.retailPrice || r.product.retailPrice,
    }));
  }
  // Mock: 다가오는 발매 flatten
  return MOCK_RELEASES.flatMap(r => r.items.map(item => ({
    ...item,
    date: r.date,
  }))).slice(0, limit);
}
