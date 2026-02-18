import { useEffect, useState } from 'react';
import { Table, Badge, Button, Alert } from 'react-bootstrap';
// Dikkat: api.ts dosyasının yerini düzelttik
import { getKitaplar } from '../services/api'; 

// TypeScript'in istediği "Veri Tipi" (Bunu yazmazsak kızar)
interface Kitap {
    id: number;
    baslik: string;
    yazar: string; // Senin veritabanında "yazar" string olarak geliyor
    stok: number;
}

export default function KitapListesi() {
    // Burada <Kitap[]> diyerek "Bana kitap listesi gelecek" diyoruz
    const [kitaplar, setKitaplar] = useState<Kitap[]>([]);

     const kitapSil = async (id: number) => {
    if (window.confirm("Bu kitabı silmek istediğine emin misin?")) {
        try {
                 await kitapSil(id);
                 alert("Kitap silindi!"); // Başarılı mesajı
            
                  const yeniListe = await getKitaplar();
                  setKitaplar(yeniListe); // Dosyanın içindeki setKitaplar'ı doğrudan kullanıyoruz
             } catch (error: any) {
                   const hataMesaji = error.response?.data?.error || "Silme işlemi başarısız!";
                   alert("❌ DİKKAT: " + hataMesaji);
            }
        }
    };

    useEffect(() => {
        async function veriCek() {
            const veri = await getKitaplar();
            setKitaplar(veri);
        }
        veriCek();
    }, []);

    return (
        <div className="mt-4">
            <h3 className="mb-3">📖 Kitap Listesi</h3>
            
            {kitaplar.length === 0 ? (
                <Alert variant="warning">
                    Yükleniyor veya hiç kitap yok... (Backend çalışıyor mu?)
                </Alert>
            ) : (
                <Table striped bordered hover className='shadow'>
                    <thead className="bg-dark text-white">
                        <tr>
                            <th>ID</th>
                            <th>Kitap Adı</th>
                            <th>Yazar</th>
                            <th>Stok</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kitaplar.map((k) => (
                            <tr key={k.id}>
                                <td>{k.id}</td>
                                <td>{k.baslik}</td>
                                <td>{k.yazar}</td> {/* Burada yazarın ADINI gösteriyoruz */}
                                <td>
                                    <Badge bg={k.stok > 0 ? "success" : "danger"}>
                                        {k.stok} Adet
                                    </Badge>
                                </td>
                                <td>
                                    <Button size="sm" variant="outline-primary">Düzenle</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}

