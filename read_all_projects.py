import psycopg2

conn = psycopg2.connect(
    host="db.qduisyqrzhhqwwrkzniw.supabase.co",
    port=5432,
    database="postgres",
    user="postgres",
    password="Gao979981..",
    sslmode="require"
)

cursor = conn.cursor()
cursor.execute("SELECT id, title, LEFT(content, 500) FROM projects ORDER BY id")
results = cursor.fetchall()

for row in results:
    print(f"=== 项目 {row[0]} ===")
    print(f"标题: {row[1]}")
    print(f"内容(前500字): {row[2]}")
    print("\n")

cursor.close()
conn.close()
