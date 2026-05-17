-- =============================================
-- RLS 安全修复迁移
-- 问题：3张表存在 USING (true) 的虚假 "Service role" 策略
--       实际效果：任何已认证用户可执行全部操作
-- 修复：删除这些策略（service_role key 天然绕过 RLS，无需额外策略）
-- 日期：2026-05-16
-- =============================================

-- 1. ai_chat_logs：删除 "Service role can do everything" 
--    已有策略 "Users can read/insert/update own logs" 足够覆盖正常用户操作
DROP POLICY IF EXISTS "Service role can do everything" ON ai_chat_logs;

-- 2. subscriptions：删除 "Service role can manage subscriptions"
--    已有策略 "Users can view own subscription" 覆盖正常用户操作
--    管理员通过 payment-approve API（service_role client）写入，自动绕过 RLS
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;

-- 3. payment_submissions：删除 "Service role can do everything"
--    已有策略覆盖用户读写 + 管理员审核
--    service_role client 自动绕过 RLS
DROP POLICY IF EXISTS "Service role can do everything" ON payment_submissions;

-- 验证：确保各表至少有一条 SELECT 策略
-- （正常用户通过 RLS 访问数据，service_role 绕过 RLS）
SELECT 'ai_chat_logs RLS policies:' AS check_point;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'ai_chat_logs';

SELECT 'subscriptions RLS policies:' AS check_point;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'subscriptions';

SELECT 'payment_submissions RLS policies:' AS check_point;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'payment_submissions';

SELECT '✅ RLS 安全修复完成' AS status;
