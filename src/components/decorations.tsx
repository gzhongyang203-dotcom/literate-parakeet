export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* 装饰圆 - 左上 */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br from-purple-100/40 to-transparent blur-2xl" />

      {/* 装饰圆 - 右上 */}
      <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-gradient-to-bl from-pink-100/30 to-transparent blur-2xl" />

      {/* 装饰圆 - 中下 */}
      <div className="absolute bottom-0 left-1/3 w-96 h-40 rounded-full bg-gradient-to-r from-purple-50/20 via-transparent to-pink-50/20 blur-xl" />

      {/* 几何装饰：右上角菱形 */}
      <svg
        className="absolute top-12 right-16 w-20 h-20 text-purple-200/30 animate-float"
        viewBox="0 0 80 80"
        fill="currentColor"
      >
        <rect x="30" y="10" width="20" height="60" rx="10" transform="rotate(45 40 40)" />
      </svg>

      {/* 几何装饰：左侧小圆点阵 */}
      <svg
        className="absolute left-8 top-1/3 w-16 h-32 text-purple-200/25"
        viewBox="0 0 64 128"
        fill="currentColor"
      >
        <circle cx="8" cy="8" r="2" />
        <circle cx="8" cy="28" r="2" />
        <circle cx="8" cy="48" r="2" />
        <circle cx="8" cy="68" r="2" />
        <circle cx="8" cy="88" r="2" />
        <circle cx="8" cy="108" r="2" />
        <circle cx="32" cy="18" r="2" />
        <circle cx="32" cy="38" r="2" />
        <circle cx="32" cy="58" r="2" />
        <circle cx="32" cy="78" r="2" />
        <circle cx="32" cy="98" r="1.5" />
        <circle cx="56" cy="8" r="1.5" />
        <circle cx="56" cy="28" r="2" />
        <circle cx="56" cy="48" r="1.5" />
        <circle cx="56" cy="68" r="2" />
      </svg>

      {/* 几何装饰：右下小三角 */}
      <svg
        className="absolute bottom-20 right-12 w-12 h-12 text-pink-200/25 animate-float"
        style={{ animationDelay: "2s" }}
        viewBox="0 0 48 48"
        fill="currentColor"
      >
        <polygon points="24,4 44,44 4,44" />
      </svg>

      {/* 底部光晕 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    </div>
  )
}

export function SectionBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-50/40 to-transparent blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-pink-50/30 to-transparent blur-3xl" />
    </div>
  )
}
