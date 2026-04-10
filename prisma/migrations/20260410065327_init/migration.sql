-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "modelName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "styleCode" TEXT,
    "colorway" TEXT,
    "retailPrice" INTEGER,
    "releaseDate" TIMESTAMP(3),
    "thumbnailUrl" TEXT,
    "imageUrl" TEXT,
    "kreamId" TEXT,
    "stockxId" TEXT,
    "category" TEXT NOT NULL DEFAULT 'sneakers',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "sizeKr" TEXT,
    "askPrice" INTEGER,
    "bidPrice" INTEGER,
    "lastSalePrice" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" SERIAL NOT NULL,
    "fromCur" TEXT NOT NULL DEFAULT 'USD',
    "toCur" TEXT NOT NULL DEFAULT 'KRW',
    "rate" DOUBLE PRECISION NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseCalendar" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "retailPrice" INTEGER,
    "releaseType" TEXT,
    "platform" TEXT,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReleaseCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_styleCode_key" ON "Product"("styleCode");

-- CreateIndex
CREATE UNIQUE INDEX "Product_kreamId_key" ON "Product"("kreamId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_stockxId_key" ON "Product"("stockxId");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_releaseDate_idx" ON "Product"("releaseDate");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_isActive_category_idx" ON "Product"("isActive", "category");

-- CreateIndex
CREATE INDEX "PriceSnapshot_productId_source_fetchedAt_idx" ON "PriceSnapshot"("productId", "source", "fetchedAt");

-- CreateIndex
CREATE INDEX "PriceSnapshot_productId_source_size_idx" ON "PriceSnapshot"("productId", "source", "size");

-- CreateIndex
CREATE INDEX "ExchangeRate_fetchedAt_idx" ON "ExchangeRate"("fetchedAt");

-- CreateIndex
CREATE INDEX "ReleaseCalendar_releaseDate_idx" ON "ReleaseCalendar"("releaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseCalendar_productId_platform_key" ON "ReleaseCalendar"("productId", "platform");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseCalendar" ADD CONSTRAINT "ReleaseCalendar_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
