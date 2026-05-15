-- =============================================
-- 创业导航项目 - Supabase 数据库建表SQL
-- 执行位置: Supabase Dashboard -> SQL Editor
-- =============================================

-- 1. 用户资料表 (profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nickname TEXT DEFAULT ''::TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'user'::TEXT CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 项目表 (projects)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  hook TEXT DEFAULT ''::TEXT,
  category TEXT DEFAULT 'AI工具'::TEXT,
  difficulty TEXT DEFAULT '初级'::TEXT,
  income_estimate TEXT DEFAULT ''::TEXT,
  tools_required TEXT[] DEFAULT '{}'::TEXT[],
  cover_image TEXT,
  content TEXT DEFAULT ''::TEXT,
  status TEXT DEFAULT 'draft'::TEXT CHECK (status IN ('draft', 'published', 'archived')),
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,        -- 官方推荐（管理员推荐）
  is_practitioner_recommended BOOLEAN DEFAULT FALSE,  -- 实践者推荐
  recommend_reason TEXT DEFAULT '',         -- 推荐理由
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 评论表 (comments)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 协作申请表 (project_collaborators)
CREATE TABLE IF NOT EXISTS project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT ''::TEXT,
  message TEXT DEFAULT ''::TEXT,
  status TEXT DEFAULT 'pending'::TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 订阅表 (subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active'::TEXT CHECK (status IN ('active', 'canceled', 'expired')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ
);

-- 6. 点赞表 (likes)
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 7. 公告表 (announcements)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT DEFAULT ''::TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 公告评论表 (announcement_comments)
CREATE TABLE IF NOT EXISTS announcement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 自动触发器：新建用户时自动创建profile
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建新触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 行级安全策略 (RLS)
-- =============================================

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_comments ENABLE ROW LEVEL SECURITY;

-- profiles 策略
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- projects 策略
DROP POLICY IF EXISTS "Anyone can view published projects" ON projects;
CREATE POLICY "Anyone can view published projects" ON projects
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authors can manage own projects" ON projects;
CREATE POLICY "Authors can manage own projects" ON projects
  FOR ALL USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
CREATE POLICY "Admins can manage all projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- comments 策略
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can add comments" ON comments;
CREATE POLICY "Authenticated users can add comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- subscriptions 策略
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (true);

-- likes 策略
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like" ON likes;
CREATE POLICY "Users can like" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike" ON likes;
CREATE POLICY "Users can unlike" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- announcements 策略
DROP POLICY IF EXISTS "Anyone can view active announcements" ON announcements;
CREATE POLICY "Anyone can view active announcements" ON announcements
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- announcement_comments 策略
DROP POLICY IF EXISTS "Anyone can view announcement comments" ON announcement_comments;
CREATE POLICY "Anyone can view announcement comments" ON announcement_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can add comments" ON announcement_comments;
CREATE POLICY "Authenticated users can add comments" ON announcement_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON announcement_comments;
CREATE POLICY "Users can delete own comments" ON announcement_comments
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete all comments" ON announcement_comments;
CREATE POLICY "Admins can delete all comments" ON announcement_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =============================================
-- 索引优化
-- =============================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_author ON projects(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_status ON project_collaborators(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcement_comments ON announcement_comments(announcement_id);

-- =============================================
-- 9. Bot 配置表 (bot_config)
-- 存储 iLink 微信Bot登录凭证
-- =============================================
CREATE TABLE IF NOT EXISTS bot_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- 强制单行
  bot_token TEXT,
  base_url TEXT DEFAULT 'https://ilinkai.weixin.qq.com',
  qrcode_key TEXT,
  qrcode_url TEXT,
  bot_status TEXT DEFAULT 'offline' CHECK (bot_status IN ('offline', 'scanning', 'online')),
  last_poll_cursor TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 只有管理员能读写
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage bot_config" ON bot_config;
CREATE POLICY "Admins can manage bot_config" ON bot_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- =============================================
-- 微信Bot消息日志表 (bot_messages)
-- 记录用户与Bot的对话历史
-- =============================================
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
CREATE POLICY "Admins can view bot_messages" ON bot_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- =============================================
-- 10. 代理表 (agents)
-- 存储代理用户信息、邀请码、分佣比例
-- =============================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  parent_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL,
  commission_rate INTEGER DEFAULT 30 CHECK (commission_rate >= 10 AND commission_rate <= 50),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  total_earnings DECIMAL(12, 2) DEFAULT 0,
  pending_earnings DECIMAL(12, 2) DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. 代理佣金表 (agent_commissions)
-- 记录每笔分佣明细
-- =============================================
CREATE TABLE IF NOT EXISTS agent_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  order_type TEXT DEFAULT 'subscription',
  order_amount DECIMAL(12, 2) DEFAULT 0,
  commission_amount DECIMAL(12, 2) DEFAULT 0,
  commission_rate INTEGER DEFAULT 30,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

-- 12. 结算记录表 (settlements)
-- 代理提现/结算记录
-- =============================================
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'rejected')),
  payment_method TEXT DEFAULT '微信',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 代理表 RLS 策略
-- =============================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- agents: 用户可查看自己的代理记录
DROP POLICY IF EXISTS "Users can view own agent record" ON agents;
CREATE POLICY "Users can view own agent record" ON agents
  FOR SELECT USING (auth.uid() = user_id);

-- agents: 上级代理可查看下级代理
DROP POLICY IF EXISTS "Parent agents can view child agents" ON agents;
CREATE POLICY "Parent agents can view child agents" ON agents
  FOR SELECT USING (auth.uid() = parent_user_id);

-- agents: 管理员可查看全部
DROP POLICY IF EXISTS "Admins can manage all agents" ON agents;
CREATE POLICY "Admins can manage all agents" ON agents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- agent_commissions: 用户可查看自己的佣金记录
DROP POLICY IF EXISTS "Users can view own commissions" ON agent_commissions;
CREATE POLICY "Users can view own commissions" ON agent_commissions
  FOR SELECT USING (auth.uid() = parent_user_id);

-- agent_commissions: 管理员可查看全部
DROP POLICY IF EXISTS "Admins can manage all commissions" ON agent_commissions;
CREATE POLICY "Admins can manage all commissions" ON agent_commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- settlements: 用户可查看自己的结算记录
DROP POLICY IF EXISTS "Users can view own settlements" ON settlements;
CREATE POLICY "Users can view own settlements" ON settlements
  FOR SELECT USING (auth.uid() = user_id);

-- settlements: 管理员可管理全部结算
DROP POLICY IF EXISTS "Admins can manage all settlements" ON settlements;
CREATE POLICY "Admins can manage all settlements" ON settlements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- =============================================
-- 代理相关索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_agents_user ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_parent ON agents(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_agents_invite_code ON agents(invite_code);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_parent ON agent_commissions(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_agent ON agent_commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_status ON agent_commissions(status);
CREATE INDEX IF NOT EXISTS idx_settlements_user ON settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);

-- =============================================
-- 自动触发器：新用户注册后自动创建代理记录
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_agent()
RETURNS TRIGGER AS $$
DECLARE
  v_invite_code TEXT;
  v_parent_id UUID;
BEGIN
  -- 从 auth.users 读取邀请码
  SELECT raw_user_meta_data->>'invite_code' INTO v_invite_code
  FROM auth.users
  WHERE id = NEW.id;
  
  -- 如果携带邀请码，查找上级代理
  IF v_invite_code IS NOT NULL AND v_invite_code != '' THEN
    SELECT user_id INTO v_parent_id
    FROM public.agents
    WHERE invite_code = v_invite_code;
  END IF;
  
  INSERT INTO public.agents (user_id, parent_user_id, invite_code, commission_rate, status)
  VALUES (
    NEW.id,
    v_parent_id,
    'VIP' || REPLACE(NEW.id::TEXT, '-', '')::TEXT,
    30,
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_agent ON profiles;
CREATE TRIGGER on_profile_created_agent
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_agent();

-- =============================================
-- 完成提示
-- =============================================
SELECT '✅ 数据库设置完成!' AS status;
