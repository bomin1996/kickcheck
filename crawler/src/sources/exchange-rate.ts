import axios from 'axios';

interface ExchangeRateResult {
  rate: number;
  fromCur: string;
  toCur: string;
}

/**
 * USD → KRW 환율 조회
 * 무료 API 사용 (하루 1회 갱신)
 */
export async function fetchUsdToKrw(): Promise<ExchangeRateResult> {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 10000,
    });

    const rate = response.data.rates.KRW;
    console.log(`환율 조회 성공: 1 USD = ${rate} KRW`);

    return {
      rate,
      fromCur: 'USD',
      toCur: 'KRW',
    };
  } catch (error: any) {
    console.error('환율 조회 실패:', error.message);
    // 실패 시 기본값
    return { rate: 1350, fromCur: 'USD', toCur: 'KRW' };
  }
}
