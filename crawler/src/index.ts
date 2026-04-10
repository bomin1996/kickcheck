import dotenv from 'dotenv';
import path from 'path';

// 루트의 .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import prisma, { upsertBrand, upsertProduct, savePriceSnapshot, saveExchangeRate } from './db';
import { fetchKreamProducts, fetchKreamPrices, delay } from './sources/kream';
import { fetchStockXPrices, searchStockX } from './sources/stockx';
import { fetchUsdToKrw } from './sources/exchange-rate';

function generateSlug(brandName: string, modelName: string, styleCode?: string): string {
  const base = `${modelName}`
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  const suffix = styleCode ? `-${styleCode.toLowerCase()}` : '';
  return `${base}${suffix}`.slice(0, 200);
}

async function crawlKream() {
  console.log('=== 크림 크롤링 시작 ===');
  const startTime = Date.now();
  let totalProducts = 0;
  let totalPrices = 0;

  // 인기 상품 상위 페이지 수집
  for (let page = 1; page <= 5; page++) {
    console.log(`\n--- 페이지 ${page} 크롤링 ---`);
    const products = await fetchKreamProducts(page, 40);

    if (products.length === 0) {
      console.log('더 이상 상품이 없습니다.');
      break;
    }

    for (const kreamProduct of products) {
      try {
        // 브랜드 upsert
        const brand = await upsertBrand(kreamProduct.brand_name || 'Unknown');

        // 상품 upsert
        const slug = generateSlug(brand.name, kreamProduct.name, kreamProduct.style_code);
        const product = await upsertProduct({
          brandId: brand.id,
          modelName: kreamProduct.name,
          slug,
          styleCode: kreamProduct.style_code || undefined,
          colorway: kreamProduct.colorway || undefined,
          retailPrice: kreamProduct.retail_price || undefined,
          releaseDate: kreamProduct.release_date ? new Date(kreamProduct.release_date) : undefined,
          thumbnailUrl: kreamProduct.thumbnail_url || undefined,
          imageUrl: kreamProduct.image_url || undefined,
          kreamId: String(kreamProduct.id),
        });

        totalProducts++;

        // 사이즈별 가격 수집
        await delay(1000 + Math.random() * 2000); // 1~3초 랜덤 딜레이
        const prices = await fetchKreamPrices(kreamProduct.id);

        for (const price of prices) {
          if (price.buy_price || price.sell_price || price.last_sale_price) {
            await savePriceSnapshot({
              productId: product.id,
              source: 'kream',
              size: price.size,
              sizeKr: price.size,
              askPrice: price.buy_price || undefined,
              bidPrice: price.sell_price || undefined,
              lastSalePrice: price.last_sale_price || undefined,
              currency: 'KRW',
            });
            totalPrices++;
          }
        }

        console.log(`  [${totalProducts}] ${kreamProduct.name} - ${prices.length}개 사이즈`);
      } catch (error: any) {
        console.error(`  에러: ${kreamProduct.name} - ${error.message}`);
      }
    }

    await delay(3000); // 페이지 간 3초 대기
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== 크림 크롤링 완료: ${totalProducts}개 상품, ${totalPrices}개 가격 (${elapsed}초) ===`);
}

async function crawlStockX() {
  console.log('\n=== StockX 크롤링 시작 ===');
  const startTime = Date.now();
  let totalPrices = 0;

  // DB에 있는 상품 중 stockxId가 있는 것들의 StockX 가격 수집
  const products = await prisma.product.findMany({
    where: { isActive: true, stockxId: { not: null } },
    select: { id: true, modelName: true, stockxId: true, styleCode: true },
  });

  // stockxId가 없는 상품은 스타일코드로 검색하여 매칭 시도
  const unmatchedProducts = await prisma.product.findMany({
    where: { isActive: true, stockxId: null, styleCode: { not: null } },
    select: { id: true, modelName: true, styleCode: true },
    take: 50,
  });

  for (const product of unmatchedProducts) {
    if (!product.styleCode) continue;
    await delay(2000);

    const results = await searchStockX(product.styleCode);
    if (results.length > 0) {
      const match = results[0];
      await prisma.product.update({
        where: { id: product.id },
        data: { stockxId: match.id },
      });
      products.push({ ...product, stockxId: match.id });
      console.log(`  [매칭] ${product.modelName} → ${match.id}`);
    }
  }

  // 환율 조회
  const latestRate = await prisma.exchangeRate.findFirst({
    orderBy: { fetchedAt: 'desc' },
  });
  const usdToKrw = latestRate?.rate || 1350;

  for (const product of products) {
    if (!product.stockxId) continue;

    await delay(2000 + Math.random() * 3000);
    const prices = await fetchStockXPrices(product.stockxId);

    for (const price of prices) {
      if (price.askPrice || price.lastSale) {
        await savePriceSnapshot({
          productId: product.id,
          source: 'stockx',
          size: price.size,
          sizeKr: price.sizeKr,
          askPrice: price.askPrice ? Math.round(price.askPrice * usdToKrw) : undefined,
          bidPrice: price.bidPrice ? Math.round(price.bidPrice * usdToKrw) : undefined,
          lastSalePrice: price.lastSale ? Math.round(price.lastSale * usdToKrw) : undefined,
          currency: 'KRW',
        });
        totalPrices++;
      }
    }

    console.log(`  ${product.modelName} - ${prices.length}개 사이즈`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== StockX 크롤링 완료: ${products.length}개 상품, ${totalPrices}개 가격 (${elapsed}초) ===`);
}

async function crawlExchangeRate() {
  console.log('=== 환율 조회 ===');
  const result = await fetchUsdToKrw();
  await saveExchangeRate(result.rate, result.fromCur, result.toCur);
  console.log(`환율 저장 완료: 1 USD = ${result.rate} KRW`);
}

async function main() {
  const source = process.argv.find(arg => arg.startsWith('--source='))?.split('=')[1]
    || process.argv[process.argv.indexOf('--source') + 1]
    || 'all';

  try {
    if (source === 'exchange' || source === 'all') {
      await crawlExchangeRate();
    }
    if (source === 'kream' || source === 'all') {
      await crawlKream();
    }
    if (source === 'stockx' || source === 'all') {
      await crawlStockX();
    }
  } catch (error: any) {
    console.error('크롤링 실패:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
