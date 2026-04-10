/**
 * 사이즈 변환 유틸리티
 * US, EU, UK → KR(mm) 변환
 */

const US_MENS_TO_KR: Record<string, string> = {
  '4': '225', '4.5': '230', '5': '230', '5.5': '235',
  '6': '240', '6.5': '245', '7': '250', '7.5': '255',
  '8': '260', '8.5': '265', '9': '270', '9.5': '275',
  '10': '280', '10.5': '285', '11': '290', '11.5': '295',
  '12': '300', '12.5': '305', '13': '310', '14': '320',
};

const EU_TO_KR: Record<string, string> = {
  '36': '225', '36.5': '230', '37.5': '235', '38': '240',
  '38.5': '240', '39': '245', '40': '250', '40.5': '255',
  '41': '260', '42': '265', '42.5': '270', '43': '275',
  '44': '280', '44.5': '285', '45': '290', '45.5': '295',
  '46': '300', '47': '305', '47.5': '310', '48.5': '320',
};

export function usToKr(usSize: string): string {
  const num = usSize.replace(/^US\s*/i, '').replace(/^M\s*/i, '').trim();
  return US_MENS_TO_KR[num] || num;
}

export function euToKr(euSize: string): string {
  const num = euSize.replace(/^EU\s*/i, '').trim();
  return EU_TO_KR[num] || num;
}

export function normalizeSize(size: string): string {
  if (/^US/i.test(size)) return usToKr(size);
  if (/^EU/i.test(size)) return euToKr(size);
  // 이미 mm 단위면 그대로
  if (/^\d{3}$/.test(size.trim())) return size.trim();
  return size;
}

/**
 * KR(mm) 사이즈 목록 (일반적인 남성 스니커즈)
 */
export const KR_SIZES = [
  '225', '230', '235', '240', '245', '250', '255',
  '260', '265', '270', '275', '280', '285', '290',
  '295', '300', '305', '310', '320',
];
