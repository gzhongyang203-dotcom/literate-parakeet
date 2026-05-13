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
cursor.execute("SELECT content FROM projects WHERE id=1")
result = cursor.fetchone()

if result:
    print(result[0])
else:
    print("项目1不存在")

cursor.close()
conn.close()
