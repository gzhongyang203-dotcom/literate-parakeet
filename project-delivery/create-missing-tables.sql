-- =============================================
-- WorkBuddy 缺失表建表 SQL
-- 执行方式：Supabase 后台 → SQL Editor → 粘贴执行
-- =============================================

-- =============================================
-- 表 1: ai_chat_logs（AI 对话次数统计）
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

-- 启用 RLS（行级安全）
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can read own logs"
  ON ai_chat_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON ai_chat_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON ai_chat_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Service Role 可写入（API 调用需要）
CREATE POLICY "Service role can do everything"
  ON ai_chat_logs FOR ALL
  USING (true);

-- 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_chat_logs_updated_at
  BEFORE UPDATE ON ai_chat_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 表 2: payment_submissions（手动支付审核）
-- =============================================

CREATE TABLE IF NOT EXISTS payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  amount INT NOT NULL,
  order_no TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 启用 RLS（行级安全）
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can read own submissions"
  ON payment_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
  ON payment_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON payment_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin 可以查看所有
CREATE POLICY "Admins can read all submissions"
  ON payment_submissions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin 可以审核
CREATE POLICY "Admins can update submissions"
  ON payment_submissions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Service Role 可写入
CREATE POLICY "Service role can do everything"
  ON payment_submissions FOR ALL
  USING (true);

-- 自动更新 updated_at 触发器
CREATE TRIGGER update_payment_submissions_updated_at
  BEFORE UPDATE ON payment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 验证：检查表是否创建成功
-- =============================================

SELECT
  'ai_chat_logs' AS table_name,
  COUNT(*) AS row_count
FROM ai_chat_logs
UNION ALL
SELECT
  'payment_submissions',
  COUNT(*)
FROM payment_submissions;
