export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

export function formatPriceShort(price: number): string {
  if (price >= 10000) {
    return Math.floor(price / 10000) + '만' + (price % 10000 >= 1000 ? Math.floor((price % 10000) / 1000) + '천' : '') + '원';
  }
  return formatPrice(price);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
