const https = require('https');

const supabaseUrl = 'https://qduisyqrzhhqwwrkzniw.supabase.co';
const supabaseKey = 'sb_publishable_Qbn5LSu50iht4gDJtMWomA_kWu9JQAR';

const projects = [
  {
    title: '闲鱼AI代写服务',
    hook: '用AI帮人写工作总结、小红书文案，0成本启动月入2000+',
    category: '闲鱼',
    difficulty: 'easy',
    income_estimate: '月入500-3000',
    is_premium: false,
    is_featured: true,
    is_practitioner_recommended: true,
    status: 'published',
    content: '## 项目介绍\n用AI帮人代写各类文案，工作总结、小红书笔记、朋友圈文案等。\n\n## 操作步骤\n1. 注册闲鱼账号\n2. 注册ChatGPT\n3. 制作接单主页\n4. 开始接单变现'
  },
  {
    title: '小红书AI壁纸号',
    hook: 'AI生成精美壁纸，发小红书引流私域变现',
    category: '小红书',
    difficulty: 'easy',
    income_estimate: '月入1000-5000',
    is_premium: false,
    is_featured: true,
    is_practitioner_recommended: false,
    status: 'published',
    content: '## 项目介绍\n用Midjourney等AI工具生成精美壁纸，发布到小红书吸引粉丝。\n\n## 操作步骤\n1. 注册Midjourney\n2. 生成壁纸素材\n3. 发布小红书\n4. 引流变现'
  },
  {
    title: '情侣情绪价值小程序',
    hook: '微信小程序+知识付费，情侣关系赛道稳赚',
    category: 'AI工具',
    difficulty: 'medium',
    income_estimate: '月入2000-10000',
    is_premium: true,
    is_featured: true,
    is_practitioner_recommended: false,
    status: 'published',
    content: '## 项目介绍\n情侣关系赛道，刚需强、复购率高。\n\n## 操作步骤\n1. 用Coze搭建AI对话Bot\n2. 申请微信小程序\n3. 接入API\n4. 付费变现'
  },
  {
    title: '抖音流量池机制深度解析',
    hook: '掌握流量池分发逻辑，让你的视频从500播放突破到50万',
    category: '短视频运营',
    difficulty: 'medium',
    income_estimate: '月入5000-20000',
    is_premium: true,
    is_featured: true,
    is_practitioner_recommended: false,
    status: 'published',
    content: '## 什么是抖音流量池\n抖音采用阶梯式流量分发机制，新视频先进入200-500基础流量池。\n\n## 核心指标\n完播率 > 点赞率 > 评论率 > 转发率'
  },
  {
    title: '快手老铁经济变现路径',
    hook: '快手私域变现的完整路径，从0到月入过万的实操指南',
    category: '短视频运营',
    difficulty: 'medium',
    income_estimate: '月入8000-30000',
    is_premium: true,
    is_featured: false,
    is_practitioner_recommended: false,
    status: 'published',
    content: '## 快手生态特点\n快手以"老铁文化"著称，用户粘性极强。\n\n## 变现路径\n1. 找准细分领域\n2. 建立真实人设\n3. 引导加微信\n4. 私域变现'
  },
  {
    title: '抖音爆款视频底层规律',
    hook: '分析1000个爆款视频后，我总结出的5个黄金公式',
    category: '内容创作',
    difficulty: 'easy',
    income_estimate: '月入3000-15000',
    is_premium: true,
    is_featured: false,
    is_practitioner_recommended: false,
    status: 'published',
    content: '## 5个黄金公式\n1. 冲突+反转\n2. 痛点+解决方案\n3. 数字+效果\n4. 身份认同\n5. 情绪共鸣'
  },
  {
    title: '国内外合规工具对比',
    hook: 'TikTok、YouTube Shorts多平台运营工具一站式对比',
    category: '工具资源',
    difficulty: 'easy',
    income_estimate: '月入2000-10000',
    is_premium: true,
    is_featured: false,
    is_practitioner_recommended: false,
    status: 'published',
    content: '## 主流平台\nTikTok、YouTube Shorts、Instagram Reels\n\n## 工具推荐\n剪映CapCut、讯飞听见、HeyBox AI'
  },
  {
    title: '抖音快手合规变现全攻略',
    hook: '2024最新政策解读，避开封号风险的安全变现方式',
    category: '变现攻略',
    difficulty: 'medium',
    income_estimate: '月入10000-50000',
    is_premium: true,
    is_featured: true,
    is_practitioner_recommended: true,
    status: 'published',
    content: '## 平台政策红线\n2024年抖音快手政策收紧。\n\n## 合规变现方式\n1. 带货佣金\n2. 星图广告\n3. 直播打赏\n4. 知识付费\n5. 私域引流'
  }
];

async function insertProject(project) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(project);
    const options = {
      hostname: 'qduisyqrzhhqwwrkzniw.supabase.co',
      path: '/rest/v1/projects',
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve({ success: true, title: project.title });
        } else {
          resolve({ success: false, title: project.title, error: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('开始插入项目数据...\n');
  let successCount = 0;
  let failCount = 0;

  for (const project of projects) {
    const result = await insertProject(project);
    if (result.success) {
      console.log(`✅ ${result.title}`);
      successCount++;
    } else {
      console.log(`❌ ${result.title}: ${result.error}`);
      failCount++;
    }
  }

  console.log(`\n完成！成功: ${successCount}, 失败: ${failCount}`);
}

main().catch(console.error);
