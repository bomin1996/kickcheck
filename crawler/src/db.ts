import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

/**
 * 브랜드 upsert (없으면 생성, 있으면 반환)
 */
export async function upsertBrand(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return prisma.brand.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
}

/**
 * 상품 upsert (kreamId 기준)
 */
export async function upsertProduct(data: {
  brandId: number;
  modelName: string;
  slug: string;
  styleCode?: string;
  colorway?: string;
  retailPrice?: number;
  releaseDate?: Date;
  thumbnailUrl?: string;
  imageUrl?: string;
  kreamId: string;
}) {
  return prisma.product.upsert({
    where: { kreamId: data.kreamId },
    update: {
      thumbnailUrl: data.thumbnailUrl,
      imageUrl: data.imageUrl,
      retailPrice: data.retailPrice,
    },
    create: {
      brandId: data.brandId,
      modelName: data.modelName,
      slug: data.slug,
      styleCode: data.styleCode || null,
      colorway: data.colorway || null,
      retailPrice: data.retailPrice || null,
      releaseDate: data.releaseDate || null,
      thumbnailUrl: data.thumbnailUrl || null,
      imageUrl: data.imageUrl || null,
      kreamId: data.kreamId,
    },
  });
}

/**
 * 가격 스냅샷 저장
 */
export async function savePriceSnapshot(data: {
  productId: number;
  source: string;
  size: string;
  sizeKr?: string;
  askPrice?: number;
  bidPrice?: number;
  lastSalePrice?: number;
  currency?: string;
}) {
  return prisma.priceSnapshot.create({
    data: {
      productId: data.productId,
      source: data.source,
      size: data.size,
      sizeKr: data.sizeKr || data.size,
      askPrice: data.askPrice || null,
      bidPrice: data.bidPrice || null,
      lastSalePrice: data.lastSalePrice || null,
      currency: data.currency || 'KRW',
    },
  });
}

/**
 * 환율 저장
 */
export async function saveExchangeRate(rate: number, fromCur: string = 'USD', toCur: string = 'KRW') {
  return prisma.exchangeRate.create({
    data: { rate, fromCur, toCur },
  });
}
