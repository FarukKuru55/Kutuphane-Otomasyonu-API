from flask import Flask, request, jsonify
import sqlite3
import os



app = Flask(__name__)
DB_NAME = 'kutuphane.db' 

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(): 
    conn = get_db_connection()
    cursor = conn.cursor()
    
    #şimdi yazarlar tablosunu oluşturalım
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS yazarlar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad_soyad TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS okuyucular (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad_soyad TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
                     CREATE TABLE IF NOT EXISTS kitaplar (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          baslik TEXT NOT NULL,
                          stok INTEGER DEFAULT  1,
                          yazar_id INTEGER NOT NULL,
                          FOREIGN KEY (yazar_id) REFERENCES yazarlar (id)
                          )
                          
                    ''') 
    
    cursor.execute('''
               CREATE TABLE IF NOT EXISTS odunc (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               kitap_id INTEGER NOT NULL,
               okuyucu_id INTEGER NOT NULL,
               alis_tarihi TEXT DEFAULT CURRENT_TIMESTAMP,
               FOREIGN KEY (kitap_id) REFERENCES kitaplar (id),
               FOREIGN KEY (okuyucu_id) REFERENCES okuyucular (id)
            )
        ''')
    conn.commit()
    conn.close()
    print(f"'{DB_NAME}' veritabanı oluşturuldu ve tablolar hazırlandı.")
    
    
init_db()
  
@app.route('/')
def home():
    return "<h1>📚 Kütüphane API Yayında!</h1>"

# Yazar ekleme
@app.route('/yazar/ekle', methods=['POST'])
def add_yazar():
        data = request.get_json() 
        ad_soyad = request.json.get('ad_soyad')
        
        if not ad_soyad:
            return jsonify({'error': 'Yazar adı ve soyadı gereklidir.'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO yazarlar (ad_soyad) VALUES (?)', (ad_soyad,))
        conn.commit()   
        yazar_id = cursor.lastrowid #yazarın id'sini alıyoruz
        conn.close()
        
        return jsonify({'message': 'Yazar başarıyla eklendi.', 'yazar_id': yazar_id}), 201 
        
@app.route('/okuyucu/ekle', methods=['POST'])
def add_okuyucu():
    data = request.get_json()
    ad_soyad = data.get('ad_soyad')
    if not ad_soyad:
        return jsonify({'error': 'Okuyucu adı zorunlu.'}), 400
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO okuyucular (ad_soyad) VALUES (?)', (ad_soyad,))
    conn.commit()
    okuyucu_id = cursor.lastrowid
    conn.close()
    return jsonify({'message': 'Okuyucu eklendi.', 'okuyucu_id': okuyucu_id}), 201
        
        
@app.route('/kitap/ekle', methods=['POST'])
def add_kitap():
    data = request.get_json()
    baslik = data.get('baslik')
    stok = data.get('stok', 1)  # Varsayılan stok değeri 1
    yazar_id = data.get('yazar_id')
    
    if not baslik or not yazar_id:
        return jsonify({'error': 'Kitap başlığı ve yazar ID gereklidir.'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Yazarın var olup olmadığını kontrol edelim
    cursor.execute('SELECT * FROM yazarlar WHERE id = ?', (yazar_id,))
    yazar = cursor.fetchone()
    
    if not yazar:
        conn.close()
        return jsonify({'error': 'Belirtilen yazar bulunamadı.'}), 404
    
    cursor.execute('INSERT INTO kitaplar (baslik, stok, yazar_id) VALUES (?, ?, ?)', (baslik, stok, yazar_id))
    conn.commit()
    kitap_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'message': 'Kitap başarıyla eklendi.', 'kitap_id': kitap_id}), 201

      
         
@app.route('/kitaplar', methods=['GET'])
def kitaplari_getir():
    conn = get_db_connection()
    # Kitaplar tabldsundaki 'yazar_id' ile Yazarlar tablosundaki 'id'yi eşleştiriyorum
    sorgu = '''
        SELECT kitaplar.id, kitaplar.baslik, kitaplar.stok, yazarlar.ad_soyad AS yazar
        FROM kitaplar
        JOIN yazarlar ON kitaplar.yazar_id = yazarlar.id
    '''
    
    kitaplar = conn.execute(sorgu).fetchall()
    conn.close()
    
    liste = []
    for k in kitaplar:
        liste.append({
            'id': k['id'],
            'baslik': k['baslik'],
            'stok': k['stok'],
            'yazar': k['yazar']
        })
    
    return  jsonify(liste) ,200
    
@app.route("/yazarlar", methods=['GET'])
def yazarlar_getir():
    conn = get_db_connection()
    yazarlar = conn.execute('SELECT * FROM yazarlar').fetchall()
    conn.close()
    
    liste = []
    for y in yazarlar:
        liste.append({
            'id': y['id'],
            'ad_soyad': y['ad_soyad']   
        })
        
    return jsonify(liste), 200

@app.route('/odunc/al', methods=['POST'])
def odunc_al():
    data = request.get_json()
    kitap_id = data.get ('kitap_id')
    okuyucu_id = data.get('okuyucu_id')
    if not kitap_id or not okuyucu_id:
        return jsonify({'error': 'Kitap ID ve Okuyucu ID gereklidir.'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Stok Kontrol
    cursor.execute('SELECT stok FROM kitaplar WHERE id = ?', (kitap_id,))
    kitap = cursor.fetchone()
    if not kitap:
        conn.close()
        return jsonify({'error': 'Belirtilen kitap bulunamadı.'}), 404
    if kitap['stok'] <= 0:
        conn.close()
        return jsonify({'error': 'Bu kitap şu anda stokta yok.'}), 400
        
    # 2. Okuyucu Kontrol
    cursor.execute('SELECT * FROM okuyucular WHERE id = ?', (okuyucu_id,))  
    okuyucu = cursor.fetchone()
    if not okuyucu:
        conn.close()
        return jsonify({'error': 'Belirtilen okuyucu bulunamadı.'}), 404
    # 3. işlem
    cursor.execute('INSERT INTO odunc (kitap_id, okuyucu_id) VALUES (?, ?)', (kitap_id, okuyucu_id))
    cursor.execute('UPDATE kitaplar SET stok = stok - 1 WHERE id = ?', (
        kitap_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Kitap ödünç alındı.'}), 200

@app.route('/odunc/teslim', methods=['POST'])
def odunc_teslim(): 
    data = request.get_json()
    kitap_id = data.get('kitap_id')
    okuyucu_id = data.get('okuyucu_id')
    
    if not kitap_id or not okuyucu_id:
        return jsonify({'error': 'Kitap ID ve Okuyucu ID gereklidir.'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. ödünç kaydı kontrolü
    cursor.execute('SELECT * FROM odunc WHERE kitap_id = ? AND okuyucu_id = ?', (kitap_id, okuyucu_id))
    odunc_kaydi = cursor.fetchone()
    if not odunc_kaydi:
        conn.close()
        return jsonify({'error': 'Bu kitap bu okuyucuya ödünç verilmemiş.'}), 404
    
    # 2. işlem
    cursor.execute('DELETE FROM odunc WHERE id = ?', (odunc_kaydi['id'],))
    cursor.execute('UPDATE kitaplar SET stok = stok + 1 WHERE id = ?', (kitap_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Kitap teslim alındı.'}), 200

@app.route('/kitap/sil',methods=['DELETE'])
def kitap_sil():
    data = request.get_json()
    kitap_id = data.get('kitap_id')
    
    if not kitap_id:
        return jsonify({'error': 'Kitap ID gereklidir.'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # KONTROL: Bu kitap şu an ödünçte mi? (Ödünçteyse silme!)
    odunc_kontrol = cursor.execute('SELECT * FROM odunc WHERE kitap_id = ?', (kitap_id,)).fetchone()
    if odunc_kontrol:
        conn.close()
        return jsonify({'error': 'Bu kitap şu an bir okuyucuda! Önce iade edilmeli.'}), 400
    
    # Kitabın var olup olmadığını kontrol edelim
    cursor.execute('SELECT * FROM kitaplar WHERE id = ?', (kitap_id,))
    kitap = cursor.fetchone()
    
    if not kitap:
        conn.close()
        return jsonify({'error': 'Belirtilen kitap bulunamadı.'}), 404
    
    cursor.execute('DELETE FROM kitaplar WHERE id = ?', (kitap_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Kitap başarıyla silindi.'}), 200

@app.route('/yazar/silme', methods=['DELETE'])
def yazar_sil():
    data = request.get_json()
    yazar_id = data.get('yazar_id')
    
    if not yazar_id:
        return jsonify({'error': 'Yazar ID gereklidir.'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Bu yazarın kitapları var mı? (Varsa silme!)
    cursor.execute('SELECT * FROM kitaplar WHERE yazar_id = ?', (yazar_id,))
    kitap_kontrol = cursor.fetchone()
    if kitap_kontrol:
        conn.close()
        return jsonify({'error': 'Bu yazara ait kitaplar var! Önce onları silmelisiniz.'}), 400
    
    # Yazarın var olup olmadığını kontrol edelim
    cursor.execute('SELECT * FROM yazarlar WHERE id = ?', (yazar_id,))
    yazar = cursor.fetchone()
    
    if not yazar:
        conn.close()
        return jsonify({'error': 'Belirtilen yazar bulunamadı.'}), 404
    
    cursor.execute('DELETE FROM yazarlar WHERE id = ?', (yazar_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Yazar başarıyla silindi.'}), 200

@app.route('/okuyucu/silme', methods=['DELETE'])
def okuyucu_sil():
    data = request.get_json()
    okuyucu_id = data.get('okuyucu_id')
    
    if not okuyucu_id:
        return jsonify({'error': 'Okuyucu ID gereklidir.'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Bu okuyucunun ödünç aldığı kitaplar var mı? (Varsa silme!)
    cursor.execute('SELECT * FROM odunc WHERE okuyucu_id = ?', (okuyucu_id,))
    odunc_kontrol = cursor.fetchone()
    if odunc_kontrol:
        conn.close()
        return jsonify({'error': 'Bu okuyucu şu an bir kitap ödünç almış! Önce iade etmeli.'}), 400
    
    # Okuyucunun var olup olmadığını kontrol edelim
    cursor.execute('SELECT * FROM okuyucular WHERE id = ?', (okuyucu_id,))
    okuyucu = cursor.fetchone()
    
    if not okuyucu:
        conn.close()
        return jsonify({'error': 'Belirtilen okuyucu bulunamadı.'}), 404
    
    cursor.execute('DELETE FROM okuyucular WHERE id = ?', (okuyucu_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Okuyucu başarıyla silindi.'}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)