interface ProductJsonLdProps {
  name: string;
  brand: string;
  image?: string | null;
  sku?: string | null;
  lowPrice?: number;
  highPrice?: number;
  url: string;
}

export function ProductJsonLd({ name, brand, image, sku, lowPrice, highPrice, url }: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    ...(image && { image }),
    ...(sku && { sku }),
    brand: { '@type': 'Brand', name: brand },
    ...(lowPrice && {
      offers: {
        '@type': 'AggregateOffer',
        lowPrice,
        ...(highPrice && { highPrice }),
        priceCurrency: 'KRW',
        availability: 'https://schema.org/InStock',
      },
    }),
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KickCheck',
    url: 'https://kickcheck.kr',
    description: '스니커즈 리셀 시세 비교 플랫폼 - 크림/StockX 가격 비교',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://kickcheck.kr/products?keyword={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
