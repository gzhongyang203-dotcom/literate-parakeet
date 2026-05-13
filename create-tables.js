/**
 * WorkBuddy 数据库建表脚本
 *
 * 用法：
 * 1. 获取 Supabase Service Role Key：
 *    Supabase 后台 → Settings → API → 复制 "service_role" 密钥（sec_xxx 开头）
 *
 * 2. 运行脚本：
 *    Windows PowerShell:
 *    $env:SUPABASE_SERVICE_ROLE_KEY="sec_xxx"; node create-tables.js
 *
 *    或直接编辑下面的 supabaseKey 变量（用完记得删除！）
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qduisyqrzhhqwwrkzniw.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseKey) {
  console.error('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY 环境变量')
  console.log('获取方式：Supabase 后台 → Settings → API → 复制 "service_role" 密钥（sec_xxx 开头）')
  console.log('')
  console.log('运行命令：')
  console.log('  $env:SUPABASE_SERVICE_ROLE_KEY="你的sec_xxx密钥"; node create-tables.js')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

async function createTables() {
  console.log('🔌 连接 Supabase...')
  console.log('   URL:', supabaseUrl)
  console.log('')

  // ── 表 1: ai_chat_logs（AI对话次数统计）────────────────────────────
  console.log('📦 创建 ai_chat_logs 表...')
  try {
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ai_chat_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          count INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_id, date)
        );
      `
    })
  } catch (e) {
    // RPC exec_sql 可能不存在，尝试直接用 SQL
    console.log('   (RPC 不可用，尝试 REST API SQL...)')
  }

  // 用 REST API 直接执行 SQL
  const { error: sqlError } = await supabase.post('', {
    query: `
      CREATE TABLE IF NOT EXISTS ai_chat_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, date)
      );
    `
  }).catch(() => ({ error: 'not_supported' }))

  // 实际方案：用 fetch 直接调用 Supabase REST API 执行 SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      sql: `
        CREATE TABLE IF NOT EXISTS ai_chat_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          count INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_id, date)
        );
        ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Users can read own logs"
          ON ai_chat_logs FOR SELECT
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert own logs"
          ON ai_chat_logs FOR INSERT
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update own logs"
          ON ai_chat_logs FOR UPDATE
          USING (auth.uid() = user_id);

        CREATE TABLE IF NOT EXISTS payment_submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          plan TEXT NOT NULL,
          amount INT NOT NULL,
          order_no TEXT,
          screenshot_url TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          approved_at TIMESTAMPTZ,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
        ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Users can read own submissions"
          ON payment_submissions FOR SELECT
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert own submissions"
          ON payment_submissions FOR INSERT
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Admins can do everything with payments"
          ON payment_submissions FOR ALL
          USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
          );
      `
    })
  })

  if (response.ok) {
    console.log('✅ ai_chat_logs 和 payment_submissions 表创建成功！')
    console.log('⚠️  请继续在 Supabase SQL Editor 执行 agents 相关表的 SQL（见下方）')
    console.log('')
    printManualSQL()
  } else {
    const text = await response.text()
    console.log('⚠️  REST API 执行 SQL 失败（Supabase 免费版可能不支持 RPC）')
    console.log('   错误：', text.substring(0, 300))
    console.log('')
    console.log('📋 请手动在 Supabase SQL Editor 执行以下 SQL：')
    console.log('')
    printManualSQL()
  }
}

function printManualSQL() {
  const sql = `
-- =============================================
-- 1. ai_chat_logs（AI对话次数统计）
-- =============================================
CREATE TABLE IF NOT EXISTS ai_chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own logs"
  ON ai_chat_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON ai_chat_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON ai_chat_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 2. payment_submissions（手动支付审核）
-- =============================================
CREATE TABLE IF NOT EXISTS payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  amount INT NOT NULL,
  order_no TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own submissions"
  ON payment_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
  ON payment_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can do everything with payments"
  ON payment_submissions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 3. agents（代理表）
-- =============================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_user_id UUID REFERENCES auth.users(id),
  invite_code TEXT UNIQUE NOT NULL,
  commission_rate INT DEFAULT 30 CHECK (commission_rate >= 10 AND commission_rate <= 50),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  total_earnings NUMERIC(10,2) DEFAULT 0,
  pending_earnings NUMERIC(10,2) DEFAULT 0,
  total_customers INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own agent record"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent record"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent record"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can read child agents"
  ON agents FOR SELECT
  USING (auth.uid() = parent_user_id);

-- =============================================
-- 4. agent_commissions（分佣记录）
-- =============================================
CREATE TABLE IF NOT EXISTS agent_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  parent_user_id UUID REFERENCES auth.users(id),
  customer_user_id UUID REFERENCES auth.users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  plan TEXT NOT NULL,
  amount INT NOT NULL,
  commission_rate INT NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  settled_at TIMESTAMPTZ
);
ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can read own commissions"
  ON agent_commissions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM agents WHERE id = agent_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM agents WHERE id = agent_id AND parent_user_id = auth.uid())
  );

CREATE POLICY "Parents can read child commissions"
  ON agent_commissions FOR SELECT
  USING (auth.uid() = parent_user_id);

-- =============================================
-- 5. settlements（结算记录）
-- =============================================
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'failed')),
  payment_method TEXT,
  payment_account TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  settled_at TIMESTAMPTZ
);
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settlements"
  ON settlements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settlements"
  ON settlements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settlements"
  ON settlements FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 初始化：给已有用户创建代理记录
-- =============================================
INSERT INTO agents (user_id, invite_code, status)
SELECT id, 'VIP' || substr(id::text, 1, 8), 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM agents)
ON CONFLICT DO NOTHING;
`
  console.log(sql)
}

createTables()
