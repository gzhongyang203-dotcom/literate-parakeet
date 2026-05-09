# 创业导航 - 项目完整说明

## 📌 线上地址
**网站**: https://literate-parakeet-mu.vercel.app  
**GitHub**: https://github.com/gzhongyang203-dotcom/literate-parakeet

---

## 🎯 项目状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 网站部署 | ✅ | Vercel 已部署 |
| 数据库 | ✅ | Supabase，10个项目已入库 |
| 用户注册 | ✅ | 登录注册功能正常 |
| 项目浏览 | ✅ | 全部10个项目可查看 |
| 支付系统 | ❌ | 待配置 |

---

## 🔧 技术栈

- **前端框架**: Next.js 15 + TypeScript
- **UI组件**: TailwindCSS + shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel
- **支付**: Lemon Squeezy（待接入）

---

## 📦 数据库配置

```
Supabase URL: https://qduisyqrzhhqwwrkzniw.supabase.co
ANON KEY: sb_publishable_Qbn5LSu50iht4gDJtMWomA_kWu9JQAR
```

---

## 📂 项目文件结构

```
src/
├── app/                    # 页面路由
│   ├── page.tsx           # 首页
│   ├── projects/          # 项目库页面
│   │   └── [id]/         # 项目详情页
│   └── login/             # 登录注册
├── components/            # UI组件
│   ├── ui/               # shadcn组件
│   ├── trust-stats.tsx   # 数据统计
│   └── daily-update.tsx  # 每日更新
└── lib/
    ├── supabase/         # Supabase客户端
    │   ├── client.ts     # 浏览器端
    │   ├── server.ts     # 服务端
    │   └── mock.ts       # 演示数据
    └── utils.ts          # 工具函数

supabase/
└── schema.sql            # 数据库建表SQL

insert_projects.js         # 数据导入脚本
```

---

## 🚀 本地开发

```bash
# 进入项目目录
cd C:\Users\勿念\WorkBuddy\2026-05-05-task-1

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## 🔐 环境变量

根目录 `.env.local` 内容：

```env
NEXT_PUBLIC_SUPABASE_URL=https://qduisyqrzhhqwwrkzniw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Qbn5LSu50iht4gDJtMWomA_kWu9JQAR
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📊 数据库表结构

| 表名 | 说明 |
|------|------|
| profiles | 用户资料 |
| projects | 创业项目（10条数据） |
| comments | 评论 |
| project_collaborators | 协作申请 |
| subscriptions | 订阅记录 |
| likes | 点赞 |

---

## ⏭️ 下一步

### 1. 配置支付系统（可选）
注册 Lemon Squeezy，接入订阅支付

### 2. 自定义域名（可选）
在 Vercel 绑定自己的域名

### 3. 内容运营
持续更新项目库内容

---

## 📝 常用命令

```bash
# 重新插入项目数据
node insert_projects.js

# 部署到 Vercel（需要先push到GitHub）
# 在 Vercel Dashboard 点击 Redeploy

# 查看数据库表
# Supabase Dashboard -> Table Editor -> projects
```

---

*最后更新: 2026-05-08*
