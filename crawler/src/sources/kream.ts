import puppeteer from 'puppeteer';

interface KreamProduct {
  id: number;
  name: string;
  brand_name: string;
  style_code: string;
  colorway: string;
  retail_price: number;
  release_date: string;
  thumbnail_url: string;
  image_url: string;
}

interface KreamPrice {
  size: string;
  buy_price: number | null;
  sell_price: number | null;
  last_sale_price: number | null;
}

let browser: any = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browser;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * 크림 상품 목록 크롤링 (Puppeteer)
 * /search 페이지에서 상품 카드 DOM을 파싱
 */
export async function fetchKreamProducts(page: number = 1, limit: number = 40): Promise<KreamProduct[]> {
  const b = await getBrowser();
  const p = await b.newPage();

  try {
    await p.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await p.goto(`https://kream.co.kr/search?sort=popular&category_id=34&page=${page}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // DOM에서 상품 정보 추출
    const products = await p.evaluate(() => {
      const items: any[] = [];
      const links = document.querySelectorAll('a[href*="/products/"]');

      links.forEach((a: any) => {
        const href = a.getAttribute('href') || '';
        const idMatch = href.match(/\/products\/(\d+)/);
        if (!idMatch) return;

        const text = a.textContent || '';
        const imgEl = a.querySelector('img');

        // 텍스트 패턴: "브랜드이름가격원관심..."
        // 브랜드는 첫 번째 단어들, 그 뒤가 상품명, 숫자+원이 가격
        const priceMatch = text.match(/(\d{1,3}(?:,\d{3})+)원/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;

        // 브랜드와 이름 분리 (product_card 내부 구조 활용)
        const brandEl = a.querySelector('[class*="brand"], .brand_name');
        const nameEl = a.querySelector('[class*="product_name"], [class*="name"]');

        let brandName = brandEl?.textContent?.trim() || '';
        let productName = nameEl?.textContent?.trim() || '';

        // 셀렉터로 못 찾으면 텍스트에서 추출
        if (!brandName && text) {
          // 알려진 브랜드로 시작하는지 체크
          const brands = ['Nike', 'Jordan', 'adidas', 'Adidas', 'New Balance', 'Converse', 'ASICS', 'Vans', 'Puma', 'Reebok', 'Salomon', 'On'];
          for (const b of brands) {
            if (text.startsWith(b)) {
              brandName = b;
              // 브랜드 뒤의 텍스트에서 가격 전까지가 상품명
              const afterBrand = text.slice(b.length);
              const nameEnd = afterBrand.search(/\d{2,3}%|\d{1,3}(,\d{3})+원|관심/);
              productName = nameEnd > 0 ? afterBrand.slice(0, nameEnd).trim() : afterBrand.slice(0, 50).trim();
              break;
            }
          }
        }

        if (!productName && text) {
          productName = text.slice(0, 60).trim();
        }

        items.push({
          id: parseInt(idMatch[1]),
          name: productName,
          brand_name: brandName,
          price,
          thumbnail_url: imgEl?.src || '',
        });
      });

      return items;
    });

    // 중복 제거 (같은 ID)
    const unique = new Map();
    for (const p of products) {
      if (p.id && !unique.has(p.id)) unique.set(p.id, p);
    }

    const result: KreamProduct[] = Array.from(unique.values()).map(p => ({
      id: p.id,
      name: p.name,
      brand_name: p.brand_name,
      style_code: '',
      colorway: '',
      retail_price: p.price,
      release_date: '',
      thumbnail_url: p.thumbnail_url,
      image_url: p.thumbnail_url,
    }));

    console.log(`  크림 상품 ${result.length}개 수집 (page ${page})`);
    return result.slice(0, limit);
  } catch (error: any) {
    console.error(`크림 상품 크롤링 실패 (page ${page}):`, error.message);
    return [];
  } finally {
    await p.close();
  }
}

/**
 * 크림 상품 상세에서 사이즈별 가격 + 모델번호 수집
 * 페이지 body 텍스트에서 거래 데이터를 파싱
 */
export async function fetchKreamPrices(kreamProductId: number): Promise<{ prices: KreamPrice[]; styleCode: string }> {
  const b = await getBrowser();
  const p = await b.newPage();

  try {
    await p.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await p.goto(`https://kream.co.kr/products/${kreamProductId}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const bodyText = await p.evaluate(() => document.body.textContent || '');

    // 모델번호 추출
    const modelMatch = bodyText.match(/모델번호\s*([A-Z0-9\-\/]+)/);
    const styleCode = modelMatch?.[1]?.split('/')[0] || '';

    // 거래 데이터에서 사이즈별 가격 추출
    // 패턴: 사이즈(3자리) + 가격(콤마 포함) + 원
    const tradePattern = /(\d{3})([\d,]+)원/g;
    const sizeMap = new Map<string, number>();
    let match;

    while ((match = tradePattern.exec(bodyText)) !== null) {
      const size = match[1];
      const price = parseInt(match[2].replace(/,/g, ''));
      const sizeNum = parseInt(size);

      // 유효한 신발 사이즈 범위 (220~320) + 합리적인 가격 (1만원~1000만원)
      if (sizeNum >= 220 && sizeNum <= 320 && sizeNum % 5 === 0 && price >= 10000 && price <= 10000000) {
        if (!sizeMap.has(size)) {
          sizeMap.set(size, price);
        }
      }
    }

    const prices: KreamPrice[] = Array.from(sizeMap.entries()).map(([size, price]) => ({
      size,
      buy_price: price,
      sell_price: null,
      last_sale_price: price,
    }));

    return { prices, styleCode };
  } catch (error: any) {
    console.error(`크림 가격 크롤링 실패 (product ${kreamProductId}):`, error.message);
    return { prices: [], styleCode: '' };
  } finally {
    await p.close();
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
