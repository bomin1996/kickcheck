import axios from 'axios';

const KREAM_API = 'https://kream.co.kr/api';

const headers = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Accept': 'application/json',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'Referer': 'https://kream.co.kr/',
};

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
  buy_price: number | null;   // 즉시구매가
  sell_price: number | null;  // 즉시판매가
  last_sale_price: number | null;
}

/**
 * 크림 인기 상품 목록 조회
 * 크림 웹사이트의 내부 API를 호출하여 상품 목록을 가져옴
 */
export async function fetchKreamProducts(page: number = 1, limit: number = 40): Promise<KreamProduct[]> {
  try {
    const response = await axios.get(`${KREAM_API}/p/products`, {
      headers,
      params: {
        page,
        per_page: limit,
        sort: 'popular',
        category: 'sneakers',
      },
      timeout: 10000,
    });

    const items = response.data?.items || response.data?.products || [];
    return items.map((item: any) => ({
      id: item.id,
      name: item.name || item.released_name || '',
      brand_name: item.brand_name || item.brand?.name || '',
      style_code: item.style_code || item.model_number || '',
      colorway: item.colorway || '',
      retail_price: item.retail_price || 0,
      release_date: item.release_date || '',
      thumbnail_url: item.thumbnail_url || item.image_url || '',
      image_url: item.image_url || item.thumbnail_url || '',
    }));
  } catch (error: any) {
    console.error(`크림 상품 목록 조회 실패 (page ${page}):`, error.message);
    return [];
  }
}

/**
 * 크림 상품 사이즈별 가격 조회
 */
export async function fetchKreamPrices(kreamProductId: number): Promise<KreamPrice[]> {
  try {
    const response = await axios.get(`${KREAM_API}/p/products/${kreamProductId}/prices`, {
      headers,
      timeout: 10000,
    });

    const sizes = response.data?.sizes || response.data || [];
    return sizes.map((s: any) => ({
      size: s.size || s.name || '',
      buy_price: s.buy_price || s.lowest_ask || null,
      sell_price: s.sell_price || s.highest_bid || null,
      last_sale_price: s.last_sale_price || s.last_sale || null,
    }));
  } catch (error: any) {
    console.error(`크림 가격 조회 실패 (product ${kreamProductId}):`, error.message);
    return [];
  }
}

/**
 * 크림 상품 검색
 */
export async function searchKream(query: string): Promise<KreamProduct[]> {
  try {
    const response = await axios.get(`${KREAM_API}/p/products`, {
      headers,
      params: {
        keyword: query,
        per_page: 20,
      },
      timeout: 10000,
    });

    const items = response.data?.items || response.data?.products || [];
    return items.map((item: any) => ({
      id: item.id,
      name: item.name || '',
      brand_name: item.brand_name || '',
      style_code: item.style_code || '',
      colorway: item.colorway || '',
      retail_price: item.retail_price || 0,
      release_date: item.release_date || '',
      thumbnail_url: item.thumbnail_url || '',
      image_url: item.image_url || '',
    }));
  } catch (error: any) {
    console.error(`크림 검색 실패 (${query}):`, error.message);
    return [];
  }
}

/**
 * 요청 간 딜레이 (크림 서버 부하 방지)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
