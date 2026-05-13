import psycopg2
import sys

# 读取SQL文件
with open('C:/Users/勿念/Desktop/60个项目完整数据库_fixed.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

print("正在连接Supabase数据库...")

conn = psycopg2.connect(
    host="db.qduisyqrzhhqwwrkzniw.supabase.co",
    port=5432,
    database="postgres",
    user="postgres",
    password="Gao979981..",
    sslmode="require"
)

print("连接成功！")

try:
    cursor = conn.cursor()

    print("正在执行SQL...")
    cursor.execute(sql_content)
    conn.commit()
    print("执行成功！")

    # 验证结果
    cursor.execute("SELECT COUNT(*) as total FROM projects")
    total = cursor.fetchone()[0]
    print(f"\n✅ 数据库现在有 {total} 个项目")

    cursor.execute("""
        SELECT category, COUNT(*) as count
        FROM projects
        GROUP BY category
        ORDER BY count DESC
    """)
    rows = cursor.fetchall()

    print("\n分类统计：")
    for row in rows:
        print(f"  {row[0]}: {row[1]}个")

except Exception as e:
    print(f"执行失败：{e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()
    print("\n连接已关闭")
