/**
 * 环境变量启动验证
 *
 * 在应用启动时检查必要的环境变量，Vercel 重新部署后环境变量丢失
 * 是最常见的部署失败原因。这个脚本会在启动时提前发现并给出明确提示。
 */

interface EnvVar {
  key: string
  required: boolean // true=缺少会打印ERROR, false=缺少只打印WARN
  label: string // 人类可读的名称
}

const ENV_VARS: EnvVar[] = [
  // ---- 必须 ----
  { key: "NEXT_PUBLIC_SUPABASE_URL", required: true, label: "Supabase 项目 URL" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, label: "Supabase Anon Key" },

  // ---- 重要 ----
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    required: false,
    label: "Supabase Service Role Key（管理后台+RLS绕过）",
  },
  {
    key: "DEEPSEEK_API_KEY",
    required: false,
    label: "DeepSeek AI API Key（AI助手功能）",
  },
  {
    key: "NEXT_PUBLIC_SITE_URL",
    required: false,
    label: "站点 URL（影响回调跳转）",
  },
]

export function validateEnv(): boolean {
  const missing: string[] = []
  const warnings: string[] = []

  for (const { key, required, label } of ENV_VARS) {
    const value = process.env[key]
    const isEmpty = !value || value === "your-service-role-key" || value.startsWith("your-")

    if (isEmpty) {
      if (required) {
        missing.push(`  ❌ ${key} — ${label}`)
      } else {
        warnings.push(`  ⚠️  ${key} — ${label}`)
      }
    }
  }

  const hasErrors = missing.length > 0
  const hasWarnings = warnings.length > 0

  if (hasErrors || hasWarnings) {
    console.log("")
    console.log("=".repeat(60))
    console.log("  环境变量检查")
    console.log("=".repeat(60))

    if (hasErrors) {
      console.log("")
      console.log("❌ 缺少必要变量（应用可能无法正常工作）：")
      console.log(missing.join("\n"))
    }

    if (hasWarnings) {
      console.log("")
      console.log("⚠️  缺少可选变量（部分功能不可用）：")
      console.log(warnings.join("\n"))
    }

    console.log("")
    console.log("💡 配置方法：")
    console.log("   本地开发 → 编辑项目根目录的 .env.local")
    console.log("   Vercel  → Settings → Environment Variables → 添加后重新部署")
    console.log("")
    console.log("   当前检测到的变量数量:", Object.keys(process.env).filter((k) => k.startsWith("NEXT_") || k.startsWith("SUPABASE") || k.startsWith("DEEPSEEK")).length)
    console.log("=".repeat(60))
    console.log("")
  } else {
    console.log("✅ 所有环境变量已正确配置")
  }

  return !hasErrors
}
