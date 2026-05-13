# WorkBuddy 创业导航 - 完整项目手册

> 生成时间：2026-05-11 16:48
> 版本：v1.0
> 维护者：勿念

---

## 一、项目概览

| 项目 | 内容 |
|------|------|
| **项目名称** | 创业导航 (Literate Parakeet) |
| **一句话定位** | AI 驱动的创业项目导航平台 |
| **网址** | https://literate-parakeet-mu.vercel.app |
| **GitHub** | https://github.com/gzhongyang203-dotcom/literate-parakeet |

### 核心技术栈
- **前端**：Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**：Next.js API Routes
- **数据库**：Supabase (PostgreSQL)
- **部署**：Vercel
- **AI**：DeepSeek API
- **微信**：iLink API

---

## 二、所有账号密码汇总

> ⚠️ 以下信息为项目核心机密，仅限项目维护使用

### 2.1 Supabase 数据库

| 配置项 | 值 |
|--------|-----|
| **项目 URL** | https://supabase.com/dashboard/project/qduisyqrzhhqwwrkzniw |
| **Database URL** | `https://qduisyqrzhhqwwrkzniw.supabase.co` |
| **ANON_KEY（前端用）** | `sb_publishable_Qbn5LSu50iht4gDJtMWomA_kWu9JQAR` |
| **SERVICE_ROLE_KEY（后端用）** | ⚠️ 需要去后台获取，见下方说明 |

**获取 Service Role Key 方法：**
1. 打开 https://supabase.com/dashboard/project/qduisyqrzhhqwwrkzniw/settings/api
2. 找到 "service_role" 密钥（格式：`sec_xxxxxxxxxx`）
3. 复制并妥善保管，**切勿泄露或提交到 Git**

### 2.2 DeepSeek AI

| 配置项 | 值 |
|--------|-----|
| **API 地址** | https://platform.deepseek.com/api_keys |
| **API KEY** | `sk-57f4858d2ac249d590b08991b8ee868c` |

### 2.3 iLink 微信 Bot

| 配置项 | 值 |
|--------|-----|
| **API 文档** | https://ilinkai.weixin.qq.com |
| **Bot 类型** | 3 |
| **登录方式** | 扫码登录（token 存储在 Supabase） |

### 2.4 Vercel 部署平台

| 配置项 | 值 |
|--------|-----|
| **后台地址** | https://vercel.com/gzhongyang203-dotcom/literate-parakeet |
| **部署历史** | https://vercel.com/gzhongyang203-dotcom/literate-parakeet/deployments |
| **环境变量** | https://vercel.com/gzhongyang203-dotcom/literate-parakeet/settings/environment-variables |

### 2.5 GitHub 仓库

| 配置项 | 值 |
|--------|-----|
| **仓库地址** | https://github.com/gzhongyang203-dotcom/literate-parakeet |
| **分支** | main |

### 2.6 支付配置（未启用）

| 配置项 | 当前状态 |
|--------|----------|
| Lemon Squeezy STORE_ID | 占位符（未配置） |
| Lemon Squeezy API_KEY | 占位符（未配置） |
| Lemon Squeezy Webhook Secret | 占位符（未配置） |

---

## 三、所有功能清单

### 3.1 用户端功能

| 功能 | 路径 | 状态 | 说明 |
|------|------|------|------|
| **首页** | `/` | ✅ 已上线 | 展示项目分类、精选项目、动态更新 |
| **项目库** | `/projects` | ✅ 已上线 | 浏览所有创业项目，支持分类筛选 |
| **项目详情** | `/projects/[id]` | ✅ 已上线 | 项目完整内容、评论区、协作入口 |
| **AI 助手** | `/ai-assistant` | ✅ 已上线 | DeepSeek AI 对话（免费每天5次） |
| **公告系统** | `/announcements` | ✅ 已上线 | 平台公告发布与展示 |
| **合作意向** | `/collaborate` | ✅ 已上线 | 用户提交合作申请 |
| **用户登录** | `/login` | ✅ 已上线 | 邮箱注册/登录（Supabase Auth） |
| **用户注册** | `/login?mode=signup` | ✅ 已上线 | 新用户注册 |
| **定价页面** | `/pricing` | ✅ 已上线 | 显示 ¥29/月 和 ¥89/月 两档 |
| **支付页面** | `/payment` | ✅ 已上线 | 手动扫码支付 + 客服微信 |

### 3.2 管理端功能

| 功能 | 路径 | 状态 | 说明 |
|------|------|------|------|
| **管理后台首页** | `/admin` | ✅ 已上线 | 功能导航总览 |
| **支付审核** | `/admin/payments` | ✅ 已上线 | 审核用户手动支付 |
| **订阅管理** | `/admin/subscriptions` | ✅ 已上线 | 查看/管理订阅记录 |
| **用户管理** | `/admin/users` | ✅ 已上线 | 查看所有注册用户 |
| **项目管理** | `/admin/projects` | ✅ 已上线 | 添加/编辑/删除创业项目 |
| **公告管理** | `/admin/announcements` | ✅ 已上线 | 发布/编辑平台公告 |
| **合作管理** | `/admin/collaborations` | ✅ 已上线 | 处理用户合作申请 |
| **系统设置** | `/admin/settings` | ✅ 已上线 | 基础配置 |
| **微信 Bot 管理** | `/admin/wechat-bot` | ✅ 已上线 | 扫码登录、自动轮询、对话日志 |

### 3.3 自动功能

| 功能 | 触发方式 | 状态 | 说明 |
|------|----------|------|------|
| **消息自动拉取** | 每3秒（前端） | ✅ 已上线 | Bot 在线时自动接收消息 |
| **消息自动回复** | 收到消息时 | ✅ 已上线 | AI 自动生成回复 |
| **Cron 定时轮询** | 每分钟（Vercel） | ⚠️ 需部署 | vercel.json 配置的自动任务 |

---

## 四、数据库表结构

### 4.1 已创建的表

| 表名 | 用途 | 主要字段 |
|------|------|----------|
| `profiles` | 用户资料 | id, email, nickname, role |
| `projects` | 创业项目 | title, category, content, is_premium |
| `comments` | 项目评论 | project_id, content, parent_id |
| `subscriptions` | 订阅记录 | user_id, plan, status |
| `likes` | 项目点赞 | project_id, user_id |
| `announcements` | 系统公告 | title, content |
| `bot_config` | Bot 配置 | bot_token, bot_status |
| `bot_messages` | Bot 消息 | from_user_id, message_text |

### 4.2 缺失的表（需要创建）

| 表名 | 用途 | SQL 状态 |
|------|------|----------|
| `ai_chat_logs` | AI 对话次数统计 | ❌ 需创建 |
| `payment_submissions` | 手动支付审核 | ❌ 需创建 |

---

## 五、快速操作指南

### 5.1 登录管理后台

1. 打开 https://literate-parakeet-mu.vercel.app/login
2. 使用管理员账号登录
3. 点击右上角"后台管理"

### 5.2 登录微信 Bot

1. 打开 https://literate-parakeet-mu.vercel.app/admin/wechat-bot
2. 点击「获取登录二维码」
3. 用微信扫描二维码
4. 等待状态变为"在线"

### 5.3 审核用户支付

1. 登录管理后台
2. 进入「支付审核」
3. 查看待审核申请
4. 点击"通过"或"拒绝"

### 5.4 发布公告

1. 登录管理后台
2. 进入「公告管理」
3. 点击「新建公告」
4. 填写标题和内容
5. 点击发布

### 5.5 添加创业项目

1. 登录管理后台
2. 进入「项目管理」
3. 点击「添加项目」
4. 填写项目信息
5. 设置分类和难度
6. 点击保存

---

## 六、套餐与定价

| 套餐 | 价格 | 功能 |
|------|------|------|
| **免费版** | ¥0 | 每天 5 次 AI 对话 |
| **基础版** | ¥29/月 | 每天 5 次 AI 对话 + 微信 Bot |
| **高级版** | ¥89/月 | 无限次 AI 对话 + 深度模式 + 微信 Bot |

### 支付方式
- 微信转账给客服
- 支付宝转账
- 客服微信：13785108266

---

## 七、环境变量配置

### Vercel 环境变量

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qduisyqrzhhqwwrkzniw.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_Qbn5LSu50iht4gDJtMWomA_kWu9JQAR` | Production |
| `DEEPSEEK_API_KEY` | `sk-57f4858d2ac249d590b08991b8ee868c` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://literate-parakeet-mu.vercel.app` | Production |

### 本地 .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://qduisyqrzhhqwwrkzniw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Qbn5LSu50iht4gDJtMWomA_kWu9JQAR
DEEPSEEK_API_KEY=sk-57f4858d2ac249d590b08991b8ee868c
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 八、待办事项

### 🔴 高优先级

- [ ] 获取 Supabase Service Role Key
- [ ] 创建 `ai_chat_logs` 表
- [ ] 创建 `payment_submissions` 表
- [ ] 设置 profiles 表的 role 列（如果没有）

### 🟡 中优先级

- [ ] 配置 Lemon Squeezy 自动支付
- [ ] 修复 payment-approve admin 权限验证
- [ ] 优化 AI 回复速度

### 🟢 低优先级

- [ ] 添加更多创业项目
- [ ] 优化移动端体验
- [ ] 添加数据分析功能

---

## 九、联系与支持

| 渠道 | 信息 |
|------|------|
| **微信客服** | 13785108266 |
| **技术问题** | 联系 AI 助手（啊菠萝 🍍） |
| **商务合作** | 微信咨询客服 |

---

## 十、项目文件位置

```
C:\Users\勿念\WorkBuddy\2026-05-05-task-1\
├── src/                    # 源代码
├── public/                # 静态资源
├── .env.local             # 本地密钥
├── package.json           # 依赖配置
├── vercel.json            # Vercel 配置
└── supabase/              # 数据库脚本
```

---

> 📌 本文档由 AI 助手（啊菠萝 🍍）自动生成
> 如有更新，请同步修改此文件
