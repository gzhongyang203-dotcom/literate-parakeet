import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 48 : 36
  const fontSize = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg"
  const iconFontSize = size === "sm" ? 12 : size === "lg" ? 20 : 16

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        {/* Logo SVG - 创 + 罗盘 */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 外圈装饰 */}
          <circle cx="18" cy="18" r="16.5" stroke="#CECBF6" strokeWidth="1.2" />
          <circle cx="18" cy="18" r="14" stroke="#EEEDFE" strokeWidth="0.8" strokeDasharray="2 2" />

          {/* 底色圆 */}
          <circle cx="18" cy="18" r="12" fill="#8B5CF6" />

          {/* 罗盘指针 - 右上方向（代表方向感、前进） */}
          <polygon points="18,8 15.5,18 18,16.5 20.5,18" fill="white" opacity="0.95" />
          <polygon points="18,28 15.5,18 18,19.5 20.5,18" fill="white" opacity="0.3" />

          {/* "创"字 */}
          <text
            x="18"
            y="21"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontSize={iconFontSize}
            fontWeight="600"
            fill="white"
          >
            创
          </text>
        </svg>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", fontSize)}>
          创业导航
        </span>
      )}
    </div>
  )
}

export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="18" cy="18" r="16.5" stroke="#CECBF6" strokeWidth="1.2" />
      <circle cx="18" cy="18" r="14" stroke="#EEEDFE" strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx="18" cy="18" r="12" fill="#8B5CF6" />
      <polygon points="18,8 15.5,18 18,16.5 20.5,18" fill="white" opacity="0.95" />
      <polygon points="18,28 15.5,18 18,19.5 20.5,18" fill="white" opacity="0.3" />
      <text
        x="18"
        y="21"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize="16"
        fontWeight="600"
        fill="white"
      >
        创
      </text>
    </svg>
  )
}
