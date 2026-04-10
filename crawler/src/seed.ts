/**
 * 시드 데이터: 개발/테스트용 초기 데이터
 * 실제 크림 크롤링이 연결되기 전까지 사용
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import prisma, { upsertBrand } from './db';

const SEED_PRODUCTS = [
  { brand: 'Nike', name: 'Air Jordan 1 Retro High OG "Chicago"', styleCode: 'DZ5485-612', colorway: 'White/Varsity Red-Black', retailPrice: 209000, sizes: { '250': 410000, '255': 420000, '260': 430000, '265': 450000, '270': 480000, '275': 510000, '280': 530000, '285': 490000, '290': 460000, '300': 440000 } },
  { brand: 'New Balance', name: 'New Balance 993 Grey', styleCode: 'MR993GL', colorway: 'Grey', retailPrice: 259000, sizes: { '250': 275000, '260': 289000, '270': 299000, '280': 285000, '290': 270000 } },
  { brand: 'Nike', name: 'Nike Dunk Low "Panda"', styleCode: 'DD1391-100', colorway: 'White/Black', retailPrice: 139000, sizes: { '250': 145000, '255': 150000, '260': 156000, '265': 162000, '270': 168000, '275': 158000, '280': 152000 } },
  { brand: 'adidas', name: 'adidas Samba OG White', styleCode: 'B75806', colorway: 'Cloud White/Core Black', retailPrice: 129000, sizes: { '250': 128000, '260': 135000, '270': 140000, '280': 132000 } },
  { brand: 'Nike', name: 'Nike Air Force 1 Low White', styleCode: '315122-111', colorway: 'White/White', retailPrice: 139000, sizes: { '250': 115000, '260': 119000, '270': 125000, '280': 120000, '290': 118000 } },
  { brand: 'New Balance', name: 'New Balance 2002R "Sea Salt"', styleCode: 'M2002RHQ', colorway: 'Sea Salt', retailPrice: 169000, sizes: { '250': 185000, '260': 198000, '270': 210000, '280': 195000 } },
  { brand: 'Nike', name: 'Nike Air Max 90', styleCode: 'CN8490-100', colorway: 'White/White', retailPrice: 159000, sizes: { '260': 159000, '270': 165000, '280': 155000 } },
  { brand: 'Jordan', name: 'Jordan 4 Retro "Bred"', styleCode: 'FV5029-006', colorway: 'Black/Fire Red-Cement Grey', retailPrice: 239000, sizes: { '260': 520000, '270': 550000, '280': 530000, '290': 510000 } },
  { brand: 'ASICS', name: 'ASICS Gel-Kayano 14 "Silver"', styleCode: '1201A019-105', colorway: 'White/Pure Silver', retailPrice: 179000, sizes: { '260': 178000, '270': 185000, '280': 175000 } },
  { brand: 'Converse', name: 'Converse Chuck 70 Black', styleCode: '162058C', colorway: 'Black/Egret', retailPrice: 95000, sizes: { '250': 85000, '260': 89000, '270': 92000, '280': 88000 } },
  { brand: 'Nike', name: 'Travis Scott x Air Jordan 1 Low OG "Olive"', styleCode: 'DZ4137-106', colorway: 'Sail/Medium Olive', retailPrice: 179000, sizes: { '260': 680000, '270': 720000, '280': 690000 } },
  { brand: 'Nike', name: 'Nike Dunk Low "Cacao Wow"', styleCode: 'DD1503-124', colorway: 'Sail/Cacao Wow', retailPrice: 139000, sizes: { '250': 135000, '260': 142000, '270': 148000 } },
];

async function seed() {
  console.log('=== 시드 데이터 생성 시작 ===');

  for (const item of SEED_PRODUCTS) {
    const brand = await upsertBrand(item.brand);

    const slug = `${item.name.toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}-${item.styleCode.toLowerCase()}`;

    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        brandId: brand.id,
        modelName: item.name,
        slug,
        styleCode: item.styleCode,
        colorway: item.colorway,
        retailPrice: item.retailPrice,
        kreamId: `seed-${item.styleCode}`,
        category: 'sneakers',
      },
    });

    // 가격 데이터 생성 (최근 30일치 시뮬레이션)
    for (let day = 30; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      for (const [size, basePrice] of Object.entries(item.sizes)) {
        // 일별 가격 변동 시뮬레이션 (±5%)
        const variation = 1 + (Math.random() - 0.5) * 0.1;
        const price = Math.round(basePrice * variation);

        await prisma.priceSnapshot.create({
          data: {
            productId: product.id,
            source: 'kream',
            size,
            sizeKr: size,
            askPrice: price,
            bidPrice: Math.round(price * 0.92),
            lastSalePrice: Math.round(price * 0.96),
            currency: 'KRW',
            fetchedAt: date,
          },
        });
      }
    }

    // StockX 가격도 생성 (크림보다 약간 낮게)
    for (const [size, basePrice] of Object.entries(item.sizes)) {
      const stockxPrice = Math.round(basePrice * 0.93);
      await prisma.priceSnapshot.create({
        data: {
          productId: product.id,
          source: 'stockx',
          size,
          sizeKr: size,
          askPrice: stockxPrice,
          bidPrice: Math.round(stockxPrice * 0.9),
          lastSalePrice: Math.round(stockxPrice * 0.95),
          currency: 'KRW',
          fetchedAt: new Date(),
        },
      });
    }

    console.log(`  [OK] ${item.name} (${Object.keys(item.sizes).length}개 사이즈 x 31일)`);
  }

  // 환율 데이터
  await prisma.exchangeRate.create({
    data: { rate: 1350.5, fromCur: 'USD', toCur: 'KRW' },
  });

  console.log('\n=== 시드 데이터 생성 완료 ===');
  await prisma.$disconnect();
}

seed().catch(console.error);
