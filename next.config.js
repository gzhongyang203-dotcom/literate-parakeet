/** @type {import('next').NextConfig} */
const nextConfig = {
  // 安全：隐藏 X-Powered-By 头
  poweredByHeader: false,

  // 开发体验：React 严格模式
  reactStrictMode: true,

  // 性能：开启 Brotli + Gzip 压缩
  compress: true,

  // 图片优化：允许 Supabase Storage 作为远程图片来源
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qduisyqrzhhqwwrkzniw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // 静态资源缓存策略
  async headers() {
    return [
      {
        // Next.js 构建产物：永久缓存（文件名含 hash）
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // 项目静态图片：1天缓存 + 7天后台验证
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        // 字体文件：永久缓存
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // 安全响应头：全站应用
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://res.wx.qq.com; style-src 'self' 'unsafe-inline' https://res.wx.qq.com; img-src 'self' data: blob: https://qduisyqrzhhqwwrkzniw.supabase.co https://res.wx.qq.com; font-src 'self' data: https://res.wx.qq.com; connect-src 'self' https://qduisyqrzhhqwwrkzniw.supabase.co https://api.deepseek.com; frame-src 'self' https://support.weixin.qq.com; object-src 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ];
  },

  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
