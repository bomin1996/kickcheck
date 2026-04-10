import axios from 'axios';

const STOCKX_API = 'https://stockx.com/api';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://stockx.com/',
  'x-requested-with': 'XMLHttpRequest',
};

interface StockXProduct {
  id: string;
  name: string;
  brand: string;
  styleId: string;
  colorway: string;
  retailPrice: number;
  releaseDate: string;
  thumbnailUrl: string;
}

interface StockXPrice {
  size: string;     // "US 9", "US 10"
  sizeKr: string;   // 한국 사이즈 변환값
  askPrice: number | null;
  bidPrice: number | null;
  lastSale: number | null;
}

// US → KR(mm) 사이즈 매핑 테이블
const US_TO_KR: Record<string, string> = {
  '4': '225', '4.5': '230', '5': '230', '5.5': '235',
  '6': '240', '6.5': '245', '7': '250', '7.5': '255',
  '8': '260', '8.5': '265', '9': '270', '9.5': '275',
  '10': '280', '10.5': '285', '11': '290', '11.5': '295',
  '12': '300', '12.5': '305', '13': '310', '14': '320',
};

export function convertUsToKr(usSize: string): string {
  const num = usSize.replace(/^US\s*/i, '').trim();
  return US_TO_KR[num] || num;
}

/**
 * StockX 상품 검색
 */
export async function searchStockX(query: string): Promise<StockXProduct[]> {
  try {
    const response = await axios.get(`${STOCKX_API}/browse`, {
      headers,
      params: {
        _search: query,
        dataType: 'product',
        page: 1,
        resultsPerPage: 20,
      },
      timeout: 15000,
    });

    const products = response.data?.Products || [];
    return products.map((p: Record<string, unknown>) => ({
      id: p.urlKey || p.objectID || '',
      name: p.title || p.shoe || '',
      brand: p.brand || '',
      styleId: p.styleId || '',
      colorway: p.colorway || '',
      retailPrice: Number(p.retailPrice) || 0,
      releaseDate: (p.releaseDate as string) || '',
      thumbnailUrl: (p.media as Record<string, string>)?.thumbUrl || (p.thumbnail_url as string) || '',
    }));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`StockX 검색 실패 (${query}):`, msg);
    return [];
  }
}

/**
 * StockX 상품 사이즈별 가격 조회
 */
export async function fetchStockXPrices(urlKey: string): Promise<StockXPrice[]> {
  try {
    const response = await axios.get(`${STOCKX_API}/products/${urlKey}`, {
      headers,
      params: { includes: 'market' },
      timeout: 15000,
    });

    const product = response.data?.Product || response.data;
    const children = product?.children || {};

    return Object.values(children).map((variant: unknown) => {
      const v = variant as Record<string, unknown>;
      const market = v.market as Record<string, unknown> || {};
      const shoeSize = String(v.shoeSize || '');

      return {
        size: `US ${shoeSize}`,
        sizeKr: convertUsToKr(shoeSize),
        askPrice: Number(market.lowestAsk) || null,
        bidPrice: Number(market.highestBid) || null,
        lastSale: Number(market.lastSale) || null,
      };
    }).filter(p => p.size !== 'US ');
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`StockX 가격 조회 실패 (${urlKey}):`, msg);
    return [];
  }
}

/**
 * StockX 인기 상품 목록
 */
export async function fetchStockXTrending(): Promise<StockXProduct[]> {
  try {
    const response = await axios.get(`${STOCKX_API}/browse`, {
      headers,
      params: {
        page: 1,
        resultsPerPage: 40,
        sort: 'most-active',
        productCategory: 'sneakers',
      },
      timeout: 15000,
    });

    const products = response.data?.Products || [];
    return products.map((p: Record<string, unknown>) => ({
      id: p.urlKey || '',
      name: p.title || '',
      brand: p.brand || '',
      styleId: p.styleId || '',
      colorway: p.colorway || '',
      retailPrice: Number(p.retailPrice) || 0,
      releaseDate: (p.releaseDate as string) || '',
      thumbnailUrl: (p.media as Record<string, string>)?.thumbUrl || '',
    }));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('StockX 트렌딩 조회 실패:', msg);
    return [];
  }
}
