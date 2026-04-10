/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'kream-phinf.pstatic.net' },
      { protocol: 'https', hostname: '*.kream.co.kr' },
      { protocol: 'https', hostname: 'images.stockx.com' },
    ],
  },
};

export default nextConfig;
