/**
 * 启动环境变量验证
 * 在应用启动时自动检查必要的环境变量是否已配置
 * 如果缺少关键变量，会在控制台输出明确的错误信息
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 只在服务端运行时验证
    const { validateEnv } = await import("./lib/env-check")
    validateEnv()
  }
}
