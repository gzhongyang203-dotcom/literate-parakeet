-- =============================================
-- Bot Messages v2 升级迁移
-- 新增：context_token、状态追踪、重试机制、监控时间戳
-- =============================================

-- 1. bot_messages 表新增字段
ALTER TABLE bot_messages ADD COLUMN IF NOT EXISTS context_token TEXT DEFAULT '';
ALTER TABLE bot_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
ALTER TABLE bot_messages ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE bot_messages ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- 2. bot_messages 性能索引
CREATE INDEX IF NOT EXISTS idx_bot_messages_status ON bot_messages(status);
CREATE INDEX IF NOT EXISTS idx_bot_messages_created_at ON bot_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_bot_messages_from_user ON bot_messages(from_user_id, created_at);

-- 3. bot_config 新增监控字段
ALTER TABLE bot_config ADD COLUMN IF NOT EXISTS last_poll_at TIMESTAMPTZ;
ALTER TABLE bot_config ADD COLUMN IF NOT EXISTS poll_count INTEGER DEFAULT 0;
ALTER TABLE bot_config ADD COLUMN IF NOT EXISTS poll_error_count INTEGER DEFAULT 0;
ALTER TABLE bot_config ADD COLUMN IF NOT EXISTS last_process_at TIMESTAMPTZ;

-- 注意：
--   - INSERT/UPDATE 由 service_role client 执行（自动绕过 RLS）
--   - 消息统计由 status API 实时查询 bot_messages 表获得
--   - 旧消息清理由 process 路由自动执行（30天阈值）
