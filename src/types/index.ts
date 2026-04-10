export interface ProductWithBrand {
  id: number;
  brandId: number;
  brand: { name: string; slug: string };
  modelName: string;
  slug: string;
  styleCode: string | null;
  colorway: string | null;
  retailPrice: number | null;
  releaseDate: Date | null;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  category: string;
}

export interface PricePoint {
  date: string;
  kreamPrice: number | null;
  stockxPrice: number | null;
}

export interface SizePrice {
  size: string;
  kreamAsk: number | null;
  stockxAsk: number | null;
  diff: number | null;
  diffPercent: number | null;
}

export interface RankingItem {
  rank: number;
  product: ProductWithBrand;
  currentPrice: number;
  priceChange: number;
  changePercent: number;
}

export interface ReleaseItem {
  id: number;
  product: ProductWithBrand;
  releaseDate: Date;
  retailPrice: number | null;
  releaseType: string | null;
  platform: string | null;
  isConfirmed: boolean;
}
