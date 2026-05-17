import sqlite3

conn = sqlite3.connect("decoai.db")
cursor = conn.cursor()

mapping = {
    "/uploads/products/halı.jpg": "/uploads/products/hali.jpg",
    "/uploads/products/saksı.jpg": "/uploads/products/saksi.jpg",
    "/uploads/products/yastık.jpg": "/uploads/products/yastik.jpg"
}

for old, new in mapping.items():
    cursor.execute("UPDATE products SET image_url = ? WHERE image_url = ?", (new, old))

conn.commit()
print("Database updated.")
conn.close()
