# WorkBuddy 创业导航 - 完整项目文档

> 生成时间：2026-05-11
> 最后更新：勿念
> AI 助手：啊菠萝 🍍

---

## 一、项目概览

### 1.1 基本信息

| 项目 | 内容 |
|------|------|
| **项目名称** | 创业导航 (Literate Parakeet) |
| **一句话定位** | AI 驱动的创业项目导航平台 |
| **核心功能** | 创业项目展示 + AI 助手咨询 + 微信 Bot 自动回复 + 订阅制会员 |
| **技术栈** | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| **部署平台** | Vercel |
| **数据库** | Supabase (PostgreSQL) |
| **AI 能力** | DeepSeek API |
| **微信 Bot** | iLink API (微信登录 + 消息收发) |
| **支付方案** | 手动扫码 + 管理员审核开通（暂未接入 Lemon Squeezy） |

### 1.2 关键地址

| 地址类型 | URL |
|---------|-----|
| **生产网站** | https://chuangyedaohang.com |
| **GitHub 仓库** | https://github.com/gzhongyang203-dotcom/literate-parakeet |
| **Supabase 后台** | https://supabase.com/dashboard/project/qduisyqrzhhqwwrkzniw |
| **Vercel 后台** | https://vercel.com/gzhongyang203-dotcoms-projects/literate-parakeet |
| **管理后台** | https://chuangyedaohang.com/admin |
| **微信 Bot 管理** | https://chuangyedaohang.com/admin/wechat-bot |
| **DeepSeek 控制台** | https://platform.deepseek.com/api_keys |
| **iLink API** | https://ilinkai.weixin.qq.com |

---

## 二、账号与密钥汇总

> ⚠️ **安全提醒**：以下信息仅供 AI 助手和项目维护使用，请勿泄露给他人。

### 2.1 已激活（正在使用）

| 服务 | 变量名 | 密钥值 | 用途 |
|------|--------|--------|------|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` | `https://qduisyqrzhhqwwrkzniw.supabase.co` | 数据库 + 认证 |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_Qbn5LSu50iht4gDJtMWomA_kWu9JQAR` | 前端 Supabase 客户端 |
| **DeepSeek** | `DEEPSEEK_API_KEY` | `sk-57f4858d2ac249d590b08991b8ee868c` | AI 对话 + 微信 Bot 自动回复 |

### 2.2 已部署但未配置

| 服务 | 变量名 | 当前值 | 状态 |
|------|--------|--------|------|
| **Lemon Squeezy** | `LEMON_SQUEEZY_STORE_ID` | `your-store-id` | ❌ 占位符，需要真实密钥 |
| **Lemon Squeezy** | `LEMON_SQUEEZY_API_KEY` | `your-api-key` | ❌ 占位符 |
| **Lemon Squeezy** | `LEMON_SQUEEZY_WEBHOOK_SECRET` | `your-webhook-secret` | ❌ 占位符 |
| **Lemon Squeezy** | `LEMON_SQUEEZY_VARIANT_29` | `your-variant-id-for-29-plan` | ❌ 占位符 |
| **Lemon Squeezy** | `LEMON_SQUEEZY_VARIANT_89` | `your-variant-id-for-89-plan` | ❌ 占位符 |

### 2.3 缺失密钥（需要创建）

| 服务 | 变量名 | 获取方式 |
|------|--------|---------|
| **Supabase Service Role** | `SUPABASE_SERVICE_ROLE_KEY` | Supabase 后台 → Settings → API → `service_role` 密钥（**注意：这是管理密钥，切勿暴露给前端**） |

### 2.4 配置位置

- **`.env.local`**（本地运行使用，不上传 Git）：包含以上所有真实密钥
- **`.gitignore`** 已正确忽略所有 `.env*` 文件
- **`_ENV_TEMPLATE.env`**（已提交 Git）：包含 Supabase URL + ANON_KEY，**不包含 DeepSeek 密钥**

---

## 三、数据库结构

### 3.1 Supabase 项目

- **项目 ID**：`qduisyqrzhhqwwrkzniw`
- **数据库**：PostgreSQL
- **存储**：Supabase Storage（用于支付截图上传）

### 3.2 表清单（共 10 个）

| 表名 | 用途 | 关键字段 | RLS |
|------|------|---------|-----|
| `profiles` | 用户资料 | id, email, nickname, role (user/admin) | ✅ |
| `projects` | 创业项目 | title, hook, category, difficulty, content, status, is_premium | ✅ |
| `comments` | 项目评论 | project_id, user_id, content, parent_id（支持嵌套） | ✅ |
| `project_collaborators` | 合作意向 | project_id, user_id, role, message, status | ✅ |
| `subscriptions` | 订阅记录 | user_id, plan (monthly/yearly), status, start/end_date | ✅ |
| `likes` | 项目点赞 | project_id, user_id（唯一约束防止重复点赞） | ✅ |
| `announcements` | 系统公告 | title, content, is_pinned | ✅ |
| `announcement_comments` | 公告评论 | announcement_id, user_id, content | ✅ |
| `bot_config` | 微信 Bot 配置 | bot_token, base_url, qrcode_key, bot_status, last_poll_cursor | ✅ |
| `bot_messages` | Bot 消息日志 | from_user_id, from_user_name, message_text, reply_text | ✅ |

### 3.3 ⚠️ 缺失的表（代码引用但未创建）

| 表名 | 引用位置 | 必须创建 |
|------|---------|---------|
| **`ai_chat_logs`** | `src/app/api/ai-chat/route.ts`（记录每日使用次数） | ✅ 必须 |
| **`payment_submissions`** | `src/app/api/payment-submit/route.ts`（手动支付审核） | ✅ 必须 |

**`ai_chat_logs` 建议 DDL：**
```sql
CREATE TABLE ai_chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  count INT DEFAULT 0,
  UNIQUE(user_id, date)
);

-- RLS
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own logs" ON ai_chat_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert" ON ai_chat_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update" ON ai_chat_logs FOR UPDATE USING (true);
```

**`payment_submissions` 建议 DDL：**
```sql
CREATE TABLE payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  plan TEXT NOT NULL,
  amount INT NOT NULL,
  order_no TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own submissions" ON payment_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON payment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can do everything" ON payment_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

### 3.4 认证触发器

- **触发器**：`on_auth_user_created` → 自动在 `profiles` 表创建用户记录
- **函数**：`handle_new_user()` (SECURITY DEFINER)

---

## 四、外部服务详解

### 4.1 DeepSeek API ✅

- **用途**：AI 聊天对话 + 微信 Bot 自动回复
- **端点**：`https://api.deepseek.com/v1/chat/completions`
- **模型**：`deepseek-chat`
- **费用**：按 token 计费，注意 Vercel Cron 每分钟调用一次微信轮询
- **限制**：免费用户每天 5 次，付费用户无限次

### 4.2 iLink API ✅

- **用途**：微信 Bot 登录 + 消息收发
- **Base URL**：`https://ilinkai.weixin.qq.com`（硬编码在 `src/lib/ilink.ts`）
- **登录方式**：扫码登录（QR Code），Token 动态存储到 `bot_config` 表
- **Bot Token**：非静态，由扫码登录获取后写入 `bot_config` 表

### 4.3 Lemon Squeezy（支付）❌

- **用途**：自动订阅支付（替代手动扫码）
- **现状**：代码已写好（`/api/checkout`），但密钥为占位符
- **套餐**：
  - ¥29/月（基础订阅，DeepSeek 每天 5 次）
  - ¥89/月（高级订阅，DeepSeek 无限次 + 深度模式）

### 4.4 Vercel

- **Cron 任务**：`/api/wechat-bot/poll` 每 1 分钟触发一次（`vercel.json` 配置）
- **部署触发**：通过 GitHub push 自动部署
- **环境变量**：在 Vercel 后台 Settings → Environment Variables 中配置

---

## 五、功能清单与状态

### ✅ 已完成

| 功能 | 状态 | 位置 |
|------|------|------|
| 项目展示（10个项目） | ✅ 上线 | `/projects` |
| 用户注册/登录（Supabase Auth） | ✅ 上线 | `/login` |
| 订阅制（手动支付 + 管理员审核） | ✅ 上线 | `/payment`, `/admin/payments` |
| AI 助手（DeepSeek） | ✅ 上线 | `/ai-assistant`, `/api/ai-chat` |
| 微信 Bot 管理页 | ✅ 上线 | `/admin/wechat-bot` |
| 微信 Bot 自动回复 | ✅ 上线 | `/api/wechat-bot/poll` |
| 自动轮询新消息 | ⚠️ 代码完成，待 Vercel 重新部署 | `page.tsx` useEffect |
| 公告系统 | ✅ 上线 | `/announcements` |
| 合作意向 | ✅ 上线 | `/collaborate` |
| Vercel Cron 自动轮询 | ✅ 已配置 | `vercel.json` |

### ❌ 未完成 / 待处理

| 功能 | 状态 | 说明 |
|------|------|------|
| Lemon Squeezy 自动支付 | ❌ 未配置 | 密钥为占位符 |
| `ai_chat_logs` 表 | ❌ 缺失 | AI 对话次数统计依赖此表 |
| `payment_submissions` 表 | ❌ 缺失 | 手动支付审核依赖此表 |
| Vercel 自动部署 | ⚠️ webhook 可能失效 | GitHub push 可能未触发 Vercel 部署 |
| `/api/payment-approve` 管理权限验证 | ⚠️ 安全问题 | 仅检查登录，未检查 admin 角色 |
| 浏览器缓存 | ⚠️ 已知问题 | Ctrl+Shift+R 硬刷新 |

---

## 六、安全问题清单

| # | 问题 | 严重度 | 位置 | 建议 |
|---|------|--------|------|------|
| 1 | **`/api/payment-approve` 未验证 admin 角色** | 🔴 高 | `api/payment-approve/route.ts` | 添加 Supabase 查询验证用户 role = 'admin' |
| 2 | **`/api/wechat-bot/poll` 无认证** | 🟡 中 | `api/wechat-bot/poll/route.ts` | 虽为 Cron 调用，但建议加简单验证 |
| 3 | **`/api/wechat-bot/test-qrcode` 无认证** | 🟡 中 | `api/wechat-bot/test-qrcode/route.ts` | 建议移到仅 admin 可访问或删除 |
| 4 | **微信客服手机号硬编码** | 🟡 中 | `src/app/payment/page.tsx` | 建议移到环境变量 |
| 5 | **Supabase Service Role Key 缺失** | 🔴 高 | `.env.local` | 需要获取并妥善保管，切勿提交 Git |
| 6 | **两个表缺失** | 🔴 高 | Supabase | `ai_chat_logs` 和 `payment_submissions` 必须创建 |

---

## 七、项目文件结构

```
WorkBuddy/                          # 项目根目录
├── .env.local                       # 本地密钥（不上 Git）
├── _ENV_TEMPLATE.env                # 密钥模板（已提交 Git）
├── vercel.json                      # Vercel Cron 配置
├── next.config.js
├── package.json
├── tsconfig.json
├── supabase/
│   ├── schema.sql                   # 数据库完整 DDL
│   └── insert_projects.sql         # 项目种子数据
├── public/
│   ├── favicon.svg
│   └── images/
│       ├── wechat-friend-qr.jpg    # 客服微信二维码
│       └── wechat-pay-qr.jpg       # 支付二维码
└── src/
    ├── app/
    │   ├── page.tsx                # 首页
    │   ├── layout.tsx              # 根布局
    │   ├── login/page.tsx          # 登录注册
    │   ├── pricing/page.tsx         # 定价页
    │   ├── payment/page.tsx         # 手动支付页
    │   ├── ai-assistant/page.tsx   # AI 助手
    │   ├── projects/               # 项目列表/详情
    │   ├── announcements/           # 公告系统
    │   ├── collaborate/            # 合作意向
    │   ├── dashboard/              # 用户仪表盘
    │   └── admin/                   # 管理后台
    │       ├── page.tsx            # 管理首页
    │       ├── payments/page.tsx   # 支付审核
    │       ├── subscriptions/page.tsx
    │       ├── users/page.tsx
    │       ├── projects/page.tsx
    │       ├── announcements/page.tsx
    │       ├── collaborations/page.tsx
    │       ├── settings/page.tsx
    │       └── wechat-bot/
    │           ├── page.tsx        # Bot 管理（自动轮询）
    │           └── debug/page.tsx  # 调试页
    ├── components/
    │   ├── header.tsx
    │   ├── footer.tsx
    │   ├── ai-chat-widget.tsx       # 浮动 AI 对话组件
    │   └── ui/                      # shadcn/ui 组件
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts           # 前端 Supabase 客户端
    │   │   ├── server.ts           # 服务端 Supabase 客户端
    │   │   └── mock.ts             # Demo 模式 mock
    │   ├── ilink.ts                # iLink API 封装
    │   └── database.types.ts       # TypeScript 类型
    └── middleware.ts               # 路由鉴权中间件
```

---

## 八、给 AI 助手的快速启动指令

### 启动本地开发
```bash
cd C:\Users\勿念\WorkBuddy\2026-05-05-task-1
npm run dev
# 访问 http://localhost:3000
```

### 部署到 Vercel
```bash
git add .
git commit -m "你的改动描述"
git push origin main
# Vercel 会自动触发部署（如果 webhook 正常）
# 如果不自动部署，手动去 Vercel 后台 Redeploy
```

### 创建缺失的数据库表
在 Supabase SQL Editor 中执行以下 SQL：

**① ai_chat_logs 表**
```sql
CREATE TABLE ai_chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  count INT DEFAULT 0,
  UNIQUE(user_id, date)
);
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own logs" ON ai_chat_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert logs" ON ai_chat_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON ai_chat_logs FOR UPDATE USING (auth.uid() = user_id);
```

**② payment_submissions 表**
```sql
CREATE TABLE payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  plan TEXT NOT NULL,
  amount INT NOT NULL,
  order_no TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own submissions" ON payment_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON payment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can do everything" ON payment_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## 九、当前最紧急的待办

1. **🔴 立即创建 `ai_chat_logs` 表** → AI 助手每日次数统计依赖它
2. **🔴 立即创建 `payment_submissions` 表** → 手动支付审核功能依赖它
3. **🔴 在 Vercel 后台 Redeploy** → 自动轮询代码已写好但未部署
4. **🟡 获取 Supabase Service Role Key** → 管理员写入操作需要
5. **🟡 修复 `/api/payment-approve` admin 验证** → 安全漏洞
6. **🟡 解决 Vercel webhook 问题** → 确保 GitHub push 触发自动部署

---

## 十、给下一个 AI 的备注

- **项目根目录**：`C:\Users\勿念\WorkBuddy\2026-05-05-task-1\`（不是 session 目录）
- **实时地址**：`https://chuangyedaohang.com`
- **微信 Bot 管理**：`https://chuangyedaohang.com/admin/wechat-bot`
- **Vercel 部署**通过 GitHub push 触发，GitHub：`gzhongyang203-dotcom/literate-parakeet`
- **微信 Bot 登录流程**：管理页扫码 → iLink API 获取 token → 存入 `bot_config` 表
- **AI 对话限制**：免费用户每天 5 次，付费用户无限次，记录在 `ai_chat_logs` 表
- **如果遇到 Supabase 写入失败**，首先检查 `bot_config` 表是否存在、RLS 策略是否允许写入
