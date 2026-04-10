import { prisma } from './db';

/**
 * 전체 상품 목록 (검색/필터 지원)
 */
export async function getProducts(params: {
  keyword?: string;
  brand?: string;
  page?: number;
  limit?: number;
}) {
  const { keyword, brand, page = 1, limit = 20 } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true };

  if (keyword) {
    where.OR = [
      { modelName: { contains: keyword, mode: 'insensitive' } },
      { styleCode: { contains: keyword, mode: 'insensitive' } },
    ];
  }
  if (brand && brand !== '전체') {
    where.brand = { name: brand };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // 각 상품의 최신 가격 가져오기
  const productsWithPrice = await Promise.all(
    products.map(async (product) => {
      const latestPrice = await prisma.priceSnapshot.findFirst({
        where: { productId: product.id, source: 'kream' },
        orderBy: { fetchedAt: 'desc' },
      });
      return { ...product, currentPrice: latestPrice?.askPrice || null };
    })
  );

  return { products: productsWithPrice, total };
}

/**
 * 상품 상세 (slug 기준)
 */
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { brand: true },
  });
}

/**
 * 상품의 최신 사이즈별 가격 (크림 + StockX)
 */
export async function getLatestSizePrices(productId: number) {
  // 크림 최신 가격 (사이즈별)
  const kreamPrices = await prisma.$queryRaw<Array<{
    size: string;
    askPrice: number | null;
    bidPrice: number | null;
  }>>`
    SELECT DISTINCT ON (size) size, "askPrice", "bidPrice"
    FROM "PriceSnapshot"
    WHERE "productId" = ${productId} AND source = 'kream'
    ORDER BY size, "fetchedAt" DESC
  `;

  // StockX 최신 가격 (사이즈별)
  const stockxPrices = await prisma.$queryRaw<Array<{
    size: string;
    askPrice: number | null;
  }>>`
    SELECT DISTINCT ON ("sizeKr") "sizeKr" as size, "askPrice"
    FROM "PriceSnapshot"
    WHERE "productId" = ${productId} AND source = 'stockx'
    ORDER BY "sizeKr", "fetchedAt" DESC
  `;

  const stockxMap = new Map(stockxPrices.map((p) => [p.size, p.askPrice]));

  return kreamPrices.map((kp) => {
    const stockxAsk = stockxMap.get(kp.size) || null;
    const diff = kp.askPrice && stockxAsk ? kp.askPrice - stockxAsk : null;
    const diffPercent = diff && stockxAsk ? (diff / stockxAsk) * 100 : null;

    return {
      size: kp.size,
      kreamAsk: kp.askPrice,
      kreamBid: kp.bidPrice,
      stockxAsk,
      diff,
      diffPercent,
    };
  }).sort((a, b) => Number(a.size) - Number(b.size));
}

/**
 * 시세 추이 데이터 (차트용)
 */
export async function getPriceHistory(productId: number, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const snapshots = await prisma.priceSnapshot.findMany({
    where: {
      productId,
      fetchedAt: { gte: since },
      size: '270', // 기본 사이즈 기준
    },
    orderBy: { fetchedAt: 'asc' },
    select: {
      source: true,
      askPrice: true,
      fetchedAt: true,
    },
  });

  // 날짜별로 그룹핑
  const dateMap = new Map<string, { kreamPrice: number | null; stockxPrice: number | null }>();

  for (const snap of snapshots) {
    const dateStr = snap.fetchedAt.toISOString().split('T')[0];
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, { kreamPrice: null, stockxPrice: null });
    }
    const entry = dateMap.get(dateStr)!;
    if (snap.source === 'kream') entry.kreamPrice = snap.askPrice;
    if (snap.source === 'stockx') entry.stockxPrice = snap.askPrice;
  }

  return Array.from(dateMap.entries()).map(([date, prices]) => ({
    date,
    ...prices,
  }));
}

/**
 * 인기 랭킹 (최신 가격 기준 상위 N개)
 */
export async function getRanking(limit: number = 20) {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { brand: true },
    take: limit * 2, // 가격 없는 상품 대비
  });

  const ranked = await Promise.all(
    products.map(async (product) => {
      const latest = await prisma.priceSnapshot.findFirst({
        where: { productId: product.id, source: 'kream', size: '270' },
        orderBy: { fetchedAt: 'desc' },
      });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoPrice = await prisma.priceSnapshot.findFirst({
        where: {
          productId: product.id,
          source: 'kream',
          size: '270',
          fetchedAt: { lte: weekAgo },
        },
        orderBy: { fetchedAt: 'desc' },
      });

      const currentPrice = latest?.askPrice || 0;
      const prevPrice = weekAgoPrice?.askPrice || currentPrice;
      const priceChange = currentPrice - prevPrice;
      const changePercent = prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0;

      return { product, currentPrice, priceChange, changePercent };
    })
  );

  return ranked
    .filter((r) => r.currentPrice > 0)
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, limit)
    .map((r, i) => ({ rank: i + 1, ...r }));
}

/**
 * 브랜드 목록
 */
export async function getBrands() {
  return prisma.brand.findMany({
    orderBy: { name: 'asc' },
  });
}
