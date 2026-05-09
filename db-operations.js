// Supabase数据库操作脚本
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = 'https://qduisyqrzhhqwwrkzniw.supabase.co';
// 这个是publishable key，只能读不能写
const supabaseKey = 'sb_publishable_Qbn5LSu50iht4gDJtMWomA_kWu9JQAR';

console.log('Supabase客户端已创建');
console.log('URL:', supabaseUrl);
console.log('');
console.log('⚠️  注意：publishable key只有读取权限');
console.log('需要Service Role Key才能写入数据');
console.log('');
console.log('📋 解决方案：');
console.log('1. 打开 Supabase Dashboard');
console.log('2. 进入 Settings -> API');
console.log('3. 复制 "service_role" 密钥（sec_xxx开头）');
console.log('4. 替换脚本中的 supabaseKey');
console.log('');
console.log('或者直接在 SQL Editor 执行以下SQL插入数据：');
