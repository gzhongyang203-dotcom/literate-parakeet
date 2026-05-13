import psycopg2

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

    # 查看projects表的列结构
    print("\n查看projects表结构：")
    cursor.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'projects'
        ORDER BY ordinal_position
    """)
    columns = cursor.fetchall()

    for col in columns:
        print(f"  {col[0]}: {col[1]} (nullable: {col[2]})")

except Exception as e:
    print(f"错误：{e}")
finally:
    cursor.close()
    conn.close()
    print("\n连接已关闭")
