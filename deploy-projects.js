const { Client } = require('pg');
const fs = require('fs');

// 读取SQL文件
const sqlContent = fs.readFileSync('C:/Users/勿念/Desktop/60个项目完整数据库_fixed.sql', 'utf8');

const client = new Client({
  host: 'db.qduisyqrzhhqwwrkzniw.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Gao979981..',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('正在连接数据库...');
    await client.connect();
    console.log('连接成功！');

    console.log('正在执行SQL...');
    const result = await client.query(sqlContent);
    console.log('执行成功！');

    // 查询验证
    const countResult = await client.query('SELECT COUNT(*) as total FROM projects');
    console.log(`\n✅ 数据库现在有 ${countResult.rows[0].total} 个项目`);

    const categoryResult = await client.query(`
      SELECT category, COUNT(*) as count
      FROM projects
      GROUP BY category
      ORDER BY count DESC
    `);
    console.log('\n分类统计：');
    categoryResult.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count}个`);
    });

  } catch (err) {
    console.error('执行失败：', err.message);
    console.error('错误位置：', err.query || 'N/A');
  } finally {
    await client.end();
    console.log('\n连接已关闭');
  }
}

run();
