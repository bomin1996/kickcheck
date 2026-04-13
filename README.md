# KickCheck

스니커즈 리셀 시세 비교 플랫폼 - 크림/StockX 가격 비교, 발매 캘린더, 인기 랭킹

## 기술 스택

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Database**: PostgreSQL (Supabase), Prisma ORM
- **Crawler**: Puppeteer, ts-node
- **차트**: Recharts
- **배포**: Vercel

## 주요 기능

- 크림/StockX 시세 비교
- 사이즈별 가격 조회
- 가격 변동 차트
- 발매 캘린더
- 인기 상품 랭킹

## 프로젝트 구조

```
kickcheck/
├── src/                  # Next.js 앱
│   ├── app/              # 페이지 (App Router)
│   ├── lib/              # 데이터 레이어, DB 쿼리
│   └── types/            # TypeScript 타입
├── crawler/              # 가격 크롤러 (별도 프로젝트)
│   └── src/
│       ├── sources/      # 크림, StockX, 환율 소스
│       └── index.ts      # 크롤러 엔트리
├── prisma/               # Prisma 스키마, 마이그레이션
└── .github/workflows/    # GitHub Actions (크롤러)
```

## 로컬 개발

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env

# Prisma 클라이언트 생성
npx prisma generate

# 개발 서버
npm run dev
```

## 크롤러 실행

```bash
cd crawler
npm install

# 크림 크롤링
npm run crawl:kream

# 환율 업데이트
npm run crawl:exchange
```
