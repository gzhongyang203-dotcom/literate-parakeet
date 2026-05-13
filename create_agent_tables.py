import requests
import json

SUPABASE_URL = "https://qduisyqrzhhqwwrkzniw.supabase.co"
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY"

headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Prefer": "return=minimal"
}

sql_statements = [
    # agents 表
    """CREATE TABLE IF NOT EXISTS agents (
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
    );""",
    "ALTER TABLE agents ENABLE ROW LEVEL SECURITY;",
    'CREATE POLICY "Users can read own agent record" ON agents FOR SELECT USING (auth.uid() = user_id);',
    'CREATE POLICY "Users can insert own agent record" ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);',
    'CREATE POLICY "Users can update own agent record" ON agents FOR UPDATE USING (auth.uid() = user_id);',
    'CREATE POLICY "Parents can read child agents" ON agents FOR SELECT USING (auth.uid() = parent_user_id);',

    # agent_commissions 表
    """CREATE TABLE IF NOT EXISTS agent_commissions (
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
    );""",
    "ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;",
    """CREATE POLICY "Agents can read own commissions" ON agent_commissions FOR SELECT USING (
      EXISTS (SELECT 1 FROM agents WHERE id = agent_id AND (user_id = auth.uid() OR parent_user_id = auth.uid()))
    );""",

    # settlements 表
    """CREATE TABLE IF NOT EXISTS settlements (
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
    );""",
    "ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;",
    'CREATE POLICY "Users can read own settlements" ON settlements FOR SELECT USING (auth.uid() = user_id);',
    'CREATE POLICY "Users can create own settlements" ON settlements FOR INSERT WITH CHECK (auth.uid() = user_id);',
    'CREATE POLICY "Users can update own settlements" ON settlements FOR UPDATE USING (auth.uid() = user_id);',
]

print("🔌 连接 Supabase...")
print(f"   URL: {SUPABASE_URL}")
print("")

# 尝试使用 pg_net 扩展（如果可用）
print("📝 尝试执行 SQL...")

for i, sql in enumerate(sql_statements, 1):
    print(f"   [{i}/{len(sql_statements)}] ", end="", flush=True)

    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/pg_execute_sql",
            headers=headers,
            json={"query": sql},
            timeout=30
        )

        if response.status_code in [200, 201]:
            print("✅")
        elif response.status_code == 404:
            print("⚠️  RPC 不可用")
        else:
            print(f"⚠️  {response.status_code}: {response.text[:100]}")
    except Exception as e:
        print(f"❌ {e}")

print("")
print("🔄 尝试备用方案...")

# 尝试使用数据库连接字符串直接连接
try:
    import psycopg2

    # Supabase 免费版不支持直接连接外部 PostgreSQL
    print("⚠️  需要 Supabase Pro 或手动在 SQL Editor 执行")
except ImportError:
    pass

print("")
print("=" * 50)
print("📋 如果上方有 'RPC 不可用'，请在 Supabase SQL Editor 手动执行：")
print("=" * 50)
print("")
for sql in sql_statements:
    print(sql)
print("")
print("✨ 完成")
