export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* 装饰圆 - 左上 */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-violet-200/50 via-purple-100/30 to-transparent blur-3xl" />

      {/* 装饰圆 - 右上 */}
      <div className="absolute -top-16 -right-16 w-[28rem] h-[28rem] rounded-full bg-gradient-to-bl from-fuchsia-100/40 via-pink-50/20 to-transparent blur-3xl" />

      {/* 装饰圆 - 中下 */}
      <div className="absolute bottom-0 left-1/3 w-[120%] h-48 rounded-full bg-gradient-to-r from-purple-100/20 via-transparent to-pink-100/20 blur-2xl" />

      {/* 装饰圆 - 右下 */}
      <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-gradient-to-t from-indigo-100/30 to-transparent blur-2xl" />

      {/* 几何装饰：右上角菱形 */}
      <svg
        className="absolute top-16 right-20 w-24 h-24 text-violet-200/40 animate-float"
        viewBox="0 0 80 80"
        fill="currentColor"
      >
        <rect x="30" y="10" width="20" height="60" rx="10" transform="rotate(45 40 40)" />
      </svg>

      {/* 几何装饰：左侧小圆点阵 */}
      <svg
        className="absolute left-10 top-1/3 w-20 h-36 text-purple-200/35"
        viewBox="0 0 64 128"
        fill="currentColor"
      >
        <circle cx="8" cy="8" r="2.5" />
        <circle cx="8" cy="28" r="2.5" />
        <circle cx="8" cy="48" r="2.5" />
        <circle cx="8" cy="68" r="2.5" />
        <circle cx="8" cy="88" r="2.5" />
        <circle cx="8" cy="108" r="2.5" />
        <circle cx="32" cy="18" r="2.5" />
        <circle cx="32" cy="38" r="2.5" />
        <circle cx="32" cy="58" r="2.5" />
        <circle cx="32" cy="78" r="2.5" />
        <circle cx="32" cy="98" r="2" />
        <circle cx="56" cy="8" r="2" />
        <circle cx="56" cy="28" r="2.5" />
        <circle cx="56" cy="48" r="2" />
        <circle cx="56" cy="68" r="2.5" />
      </svg>

      {/* 几何装饰：右下小三角 */}
      <svg
        className="absolute bottom-24 right-16 w-16 h-16 text-fuchsia-200/35 animate-float"
        style={{ animationDelay: "2s" }}
        viewBox="0 0 48 48"
        fill="currentColor"
      >
        <polygon points="24,4 44,44 4,44" />
      </svg>

      {/* 底部光晕 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/15 to-transparent" />

      {/* 顶部光晕 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
    </div>
  )
}

export function SectionBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <div className="absolute -top-48 -right-48 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-violet-100/50 via-purple-50/30 to-transparent blur-3xl" />
      <div className="absolute -bottom-48 -left-48 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-fuchsia-100/40 via-pink-50/20 to-transparent blur-3xl" />
    </div>
  )
}
