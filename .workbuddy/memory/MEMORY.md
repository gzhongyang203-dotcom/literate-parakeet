# 创业导航项目 - 完整记录

## 项目概述
**创业导航** - 一个可订阅的创业项目库网站

## 线上地址
- 网站：https://chuangyedaohang.com
- GitHub：https://github.com/gzhongyang203-dotcom/literate-parakeet

## 技术栈
- **前端**：Next.js 15 + TypeScript + TailwindCSS + shadcn/ui
- **数据库**：Supabase (PostgreSQL)
- **部署**：Vercel
- **支付**：Lemon Squeezy（待配置）

## 数据库配置
```
URL: https://qduisyqrzhhqwwrkzniw.supabase.co
ANON_KEY: sb_publishable_Qbn5LSu50iht4gDJtMWomA_kWu9JQAR
```
注意：这个 sb_publishable_ 开头的 key 在 Supabase REST API 中可用（非标准 JWT 格式但实际可用）

## 数据库表结构
- `profiles` - 用户资料
- `projects` - 创业项目（10条数据）
- `comments` - 评论
- `project_collaborators` - 协作申请
- `subscriptions` - 订阅记录
- `likes` - 点赞

## 当前状态
- ✅ 网站已部署到 Vercel
- ✅ 数据库连接正常
- ✅ 10个项目已入库
- ✅ 用户注册登录功能正常
- ⚠️ 支付系统未配置（无 Lemon Squeezy）

## 待完成
1. 配置 Lemon Squeezy 支付
2. 绑定自定义域名（可选）

## 本地开发
```bash
cd C:\Users\勿念\WorkBuddy\2026-05-05-task-1
npm run dev
```

## 环境变量 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://qduisyqrzhhqwwrkzniw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Qbn5LSu50iht4gDJtMWomA_kWu9JQAR
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Vercel 环境变量
需在 Vercel Dashboard 设置：
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
