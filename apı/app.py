from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS (app)
DB_NAME = 'kutuphane.db' 

def db_calistir(sorgu, parametreler=()):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row # Sütun isimleriyle erişmek için
    cursor = conn.cursor()
    
    try:
        cursor.execute(sorgu, parametreler)
        
        # Eğer sorgu bir SELECT ise, sonuçları döndür
        if sorgu.strip().upper().startswith('SELECT'):
            sonuc = cursor.fetchall()
            conn.close()
            #SQLlite satırlarını python sözlüğüne dönüştürelim
            return [dict(row) for row in sonuc]
        
        #INSERT , UPDATE veya DELETE sorguları için değişiklikleri kaydet
        else:
            conn.commit()
            last_id = cursor.lastrowid
            conn.close()
            return last_id
        
    except Exception as e:
        conn.close()
        print(f"Hata: {e}")
        return None
    

def init_db():
    tablolar = [
       "CREATE TABLE IF NOT EXISTS yazarlar (id INTEGER PRIMARY KEY AUTOINCREMENT, ad_soyad TEXT NOT NULL)",
        "CREATE TABLE IF NOT EXISTS okuyucular (id INTEGER PRIMARY KEY AUTOINCREMENT, ad_soyad TEXT NOT NULL)",
        "CREATE TABLE IF NOT EXISTS kitaplar (id INTEGER PRIMARY KEY AUTOINCREMENT, baslik TEXT NOT NULL, stok INTEGER DEFAULT 1, yazar_id INTEGER NOT NULL, FOREIGN KEY(yazar_id) REFERENCES yazarlar(id))",
        "CREATE TABLE IF NOT EXISTS odunc (id INTEGER PRIMARY KEY AUTOINCREMENT, kitap_id INTEGER NOT NULL, okuyucu_id INTEGER NOT NULL, alis_tarihi TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(kitap_id) REFERENCES kitaplar(id), FOREIGN KEY(okuyucu_id) REFERENCES okuyucular(id))"
    ]
    
    for tablo in tablolar:
        db_calistir(tablo)
        print(f"📚 Kütüphane API Yayında!</h1>")
        
init_db()
  
@app.route('/')
def home():
    return "<h1>📚 Kütüphane API Yayında!</h1>"

# Yazar ekleme
@app.route('/yazar/ekle', methods=['POST'])
def add_yazar():
        ad = request.json.get('ad_soyad')        
        if not ad: return jsonify({'error': 'Yazar adı ve soyadı gereklidir.'}), 400        
        id = db_calistir('INSERT INTO yazarlar (ad_soyad) VALUES (?)', (ad,))
        return jsonify({'message': 'Yazar başarıyla eklendi.', 'id ': id}), 201 
        
@app.route('/okuyucu/ekle', methods=['POST'])
def add_okuyucu():
    ad = request.get_json('ad_soyad')
    if not ad: return jsonify({'error': 'Okuyucu adı zorunlu.'}), 400
    id = db_calistir('INSERT INTO okuyucular (ad_soyad) VALUES (?)', (ad,))
    return jsonify({'message': 'Okuyucu eklendi.', 'id': id}), 201
        
@app.route('/kitap/ekle', methods=['POST'])
def add_kitap():
    d = request.json
    if not d.get('baslik') or not d.get('yazar_id'): return jsonify({'error': 'Kitap başlığı ve yazar ID gereklidir.'}), 400
    
    #yazar kontrolü 
    if not db_calistir('SELECT * FROM yazarlar WHERE id = ?', (d['yazar_id'],)):
        return jsonify({'error': 'Belirtilen yazar bulunamadı.'}), 404
    
    id = db_calistir('INSERT INTO kitaplar (baslik, stok, yazar_id) VALUES (?, ?, ?)',
                     (d['baslik'], d.get('stok', 1), d['yazar_id']))
    return jsonify({'message': 'Kitap başarıyla eklendi.', 'kitap_id': id}), 201
      
         
@app.route('/kitaplar', methods=['GET'])
def kitaplari_getir():
    sorgu = '''SELECT k.id, k.baslik, k.stok, y.ad_soyad as yazar 
               FROM kitaplar k JOIN yazarlar y ON k.yazar_id = y.id'''
    return  jsonify(db_calistir(sorgu)), 200
    
@app.route("/yazarlar", methods=['GET'])
def yazarlar_getir():
    return jsonify(db_calistir('SELECT * FROM yazarlar')), 200

@app.route('/odunc/al', methods=['POST'])
def odunc_al():
    d = request.get_json()
    kitap = db_calistir('SELECT * FROM kitaplar WHERE id = ?', (d.get('kitap_id'),))
    
    if not kitap: return jsonify({'error': 'Kitap bulunamadı'}), 404
    if kitap[0]['stok'] < 1: return jsonify({'error': 'Stok yok'}), 400
    
    if not db_calistir('SELECT * FROM okuyucular WHERE id = ?', (d.get('okuyucu_id'),)):
        return jsonify({'error': 'Belirtilen okuyucu bulunamadı.'}), 404
    
    db_calistir('INSERT INTO odunc (kitap_id, okuyucu_id) VALUES (?, ?)', (d['kitap_id'], d['okuyucu_id']))
    db_calistir('UPDATE kitaplar SET stok = stok - 1 WHERE id = ?', (d['kitap_id'],))
    return jsonify({'message': 'Kitap ödünç alındı.'}), 200

@app.route('/odunc/teslim', methods=['POST'])
def odunc_teslim(): 
    d = request.json
    kayit = db_calistir('SELECT id FROM odunc WHERE kitap_id=? AND okuyucu_id=?', (d['kitap_id'], d['okuyucu_id']))
    if not kayit: return jsonify({'error': 'Kayıt bulunamadı'}), 404
    
    db_calistir('DELETE FROM odunc WHERE id = ?', (kayit[0]['id'],))
    db_calistir('UPDATE kitaplar SET stok = stok + 1 WHERE id = ?', (d['kitap_id'],))
        
    return jsonify({'message': 'Kitap teslim alındı.'}), 200

@app.route('/kitap/sil', methods=['DELETE'])
def kitap_sil():
    id = request.json.get('kitap_id')
    if db_calistir('SELECT * FROM odunc WHERE kitap_id=?', (id,)):
        return jsonify({'error': 'Kitap ödünçte, silinemez!'}), 400
    db_calistir('DELETE FROM kitaplar WHERE id=?', (id,))
    return jsonify({'message': 'Silindi'}), 200

@app.route('/yazar/silme', methods=['DELETE'])
def yazar_sil():
    id = request.json.get('yazar_id')
    if db_calistir('SELECT * FROM kitaplar WHERE yazar_id=?', (id,)):
        return jsonify({'error': 'Yazarın kitapları var, silinemez!'}), 400
    db_calistir('DELETE FROM yazarlar WHERE id=?', (id,))
    return jsonify({'message': 'Silindi'}), 200

@app.route('/okuyucu/silme', methods=['DELETE'])
def okuyucu_sil():
    id = request.json.get('okuyucu_id')
    if db_calistir('SELECT * FROM odunc WHERE okuyucu_id=?', (id,)):
        return jsonify({'error': 'Okuyucunun borcu var, silinemez!'}), 400
    db_calistir('DELETE FROM okuyucular WHERE id=?', (id,))
    return jsonify({'message': 'Silindi'}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)