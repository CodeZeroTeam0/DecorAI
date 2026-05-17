import sqlite3
import os

db_path = "decoai.db"
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables in DB:", [t[0] for t in tables])
    
    if ('user_designs',) in tables:
        cursor.execute("PRAGMA table_info(user_designs);")
        columns = cursor.fetchall()
        print("user_designs columns:", columns)
    else:
        print("user_designs table MISSING")
    conn.close()
