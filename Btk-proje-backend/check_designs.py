import sqlite3

conn = sqlite3.connect("decoai.db")
cursor = conn.cursor()
cursor.execute("SELECT id, user_id, original_image, generated_image, prompt_used, created_at FROM user_designs ORDER BY created_at DESC LIMIT 5")
designs = cursor.fetchall()

print("--- Recent Designs in DB ---")
for d in designs:
    print(d)

conn.close()
