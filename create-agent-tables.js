const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qduisyqrzhhqwwrkzniw.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseKey) {
  console.error('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

async function runSQL() {
  console.log('🔌 连接 Supabase...')
  console.log('   URL:', supabaseUrl)
  console.log('')

  // SQL statements
  const sqlStatements = [
    // agents 表
    `CREATE TABLE IF NOT EXISTS agents (
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
    );`,

    `ALTER TABLE agents ENABLE ROW LEVEL SECURITY;`,

    `CREATE POLICY "Users can read own agent record" ON agents FOR SELECT USING (auth.uid() = user_id);`,

    `CREATE POLICY "Users can insert own agent record" ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);`,

    `CREATE POLICY "Users can update own agent record" ON agents FOR UPDATE USING (auth.uid() = user_id);`,

    `CREATE POLICY "Parents can read child agents" ON agents FOR SELECT USING (auth.uid() = parent_user_id);`,

    // agent_commissions 表
    `CREATE TABLE IF NOT EXISTS agent_commissions (
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
    );`,

    `ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;`,

    `CREATE POLICY "Agents can read own commissions" ON agent_commissions FOR SELECT USING (
      EXISTS (SELECT 1 FROM agents WHERE id = agent_id AND (user_id = auth.uid() OR parent_user_id = auth.uid()))
    );`,

    // settlements 表
    `CREATE TABLE IF NOT EXISTS settlements (
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
    );`,

    `ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;`,

    `CREATE POLICY "Users can read own settlements" ON settlements FOR SELECT USING (auth.uid() = user_id);`,

    `CREATE POLICY "Users can create own settlements" ON settlements FOR INSERT WITH CHECK (auth.uid() = user_id);`,

    `CREATE POLICY "Users can update own settlements" ON settlements FOR UPDATE USING (auth.uid() = user_id);`,
  ]

  // 使用 Supabase REST API 执行 SQL
  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i]
    console.log(`📝 执行 SQL (${i + 1}/${sqlStatements.length})...`)

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query: sql })
    })

    if (response.ok) {
      console.log('   ✅ 成功')
    } else {
      const text = await response.text()
      // 如果是 "not found" 错误，可能是 RPC 不存在
      if (text.includes('not found') || text.includes('does not exist')) {
        console.log('   ⚠️  RPC 不可用，跳过')
      } else {
        console.log('   ⚠️  响应:', text.substring(0, 200))
      }
    }
  }

  // 尝试使用 SQL Editor API
  console.log('')
  console.log('🔄 尝试使用 SQL Editor API...')

  const sqlEditorResponse = await fetch(`${supabaseUrl}/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      type: 'bulk',
      queries: sqlStatements
    })
  })

  if (sqlEditorResponse.ok) {
    console.log('✅ SQL Editor API 成功！')
  } else {
    console.log('⚠️  SQL Editor API 不可用')
    console.log('')
    console.log('📋 请手动在 Supabase SQL Editor 执行以下 SQL：')
    console.log('')
    console.log(sqlStatements.join('\n'))
  }

  console.log('')
  console.log('✨ 完成！')
}

runSQL().catch(console.error)
