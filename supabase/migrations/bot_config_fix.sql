-- =============================================
-- Bot Config RLS 修复迁移
-- 问题：bot_config 表写入时 RLS 策略阻塞
-- 修复：确保表存在 + 添加 service_role 绕过策略
-- =============================================

-- 1. 确保 bot_config 表存在
CREATE TABLE IF NOT EXISTS bot_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bot_token TEXT,
  base_url TEXT DEFAULT 'https://ilinkai.weixin.qq.com',
  qrcode_key TEXT,
  qrcode_url TEXT,
  bot_status TEXT DEFAULT 'offline' CHECK (bot_status IN ('offline', 'scanning', 'online')),
  last_poll_cursor TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 插入默认行（如果不存在）
INSERT INTO bot_config (id, bot_status)
VALUES (1, 'offline')
ON CONFLICT (id) DO NOTHING;

-- 2.5 添加 polling_locked_until 字段（用于 cron 防重叠）
ALTER TABLE bot_config ADD COLUMN IF NOT EXISTS polling_locked_until TIMESTAMPTZ;

-- 3. 启用 RLS
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;

-- 4. 移除旧策略
DROP POLICY IF EXISTS "Admins can manage bot_config" ON bot_config;
DROP POLICY IF EXISTS "Service role bypass for bot_config" ON bot_config;

-- 5. 管理员读写策略
CREATE POLICY "Admins can manage bot_config" ON bot_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 6. Service Role 全权限绕过（用于 API 路由）
-- supabase_admin / service_role 自动绕过 RLS，此策略为安全兜底
CREATE POLICY "Service role bypass for bot_config" ON bot_config
  FOR ALL USING (true)
  WITH CHECK (true);

-- 7. 同样修复 bot_messages 表
CREATE TABLE IF NOT EXISTS bot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id TEXT NOT NULL,
  from_user_name TEXT,
  message_text TEXT,
  reply_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bot_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view bot_messages" ON bot_messages;
DROP POLICY IF EXISTS "Service role bypass for bot_messages" ON bot_messages;

CREATE POLICY "Admins can view bot_messages" ON bot_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Service role bypass for bot_messages" ON bot_messages
  FOR ALL USING (true)
  WITH CHECK (true);
