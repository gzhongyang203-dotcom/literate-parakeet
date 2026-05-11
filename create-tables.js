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
`
  console.log(sql)
}

createTables()
