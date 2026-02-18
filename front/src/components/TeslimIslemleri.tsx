import { useEffect, useState } from 'react';
import { Table, Button, Alert, Badge } from 'react-bootstrap';
import { getOduncListesi, kitapTeslimAl } from '../services/api';

interface OduncKayit {
    islem_id: number;
    kitap_id: number;
    okuyucu_id: number;
    baslik: string;
    ad_soyad: string;
    alis_tarihi: string;
}

export default function TeslimIslemleri() {
    const [liste, setListe] = useState<OduncKayit[]>([]);
    const [mesaj, setMesaj] = useState<{tur: string, text: string} | null>(null);

    // Listeyi Çek
    const verileriGetir = async () => {
        const veri = await getOduncListesi();
        setListe(veri);
    };

    useEffect(() => { verileriGetir(); }, []);

    // Teslim Alma Butonuna Basılınca
    const teslimAl = async (kayit: OduncKayit) => {
        if (!window.confirm(`${kayit.ad_soyad} isimli üyeden "${kayit.baslik}" kitabını teslim alıyor musun?`)) return;

        try {
            await kitapTeslimAl({
                kitap_id: kayit.kitap_id,
                okuyucu_id: kayit.okuyucu_id
            });
            
            setMesaj({ tur: 'success', text: "✅ Kitap başarıyla teslim alındı ve stoğa eklendi!" });
            verileriGetir(); // Listeyi yenile (Teslim edilen listeden düşmeli)
        } catch (error) {
            setMesaj({ tur: 'danger', text: "❌ Teslim alma işleminde hata!" });
        }
    };

    return (
        <div className="mt-4">
            <h3 className="mb-3">🔄 İade / Teslim Alma İşlemleri</h3>
            
            {mesaj && <Alert variant={mesaj.tur} onClose={() => setMesaj(null)} dismissible>{mesaj.text}</Alert>}

            {liste.length === 0 ? (
                <Alert variant="info">Şu an kimsede ödünç kitap yok. Her şey rafta! 👍</Alert>
            ) : (
                <Table striped bordered hover className='shadow-sm'>
                    <thead className="bg-warning">
                        <tr>
                            <th>Kitap Adı</th>
                            <th>Alan Üye</th>
                            <th>Veriliş Tarihi</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {liste.map((k) => (
                            <tr key={k.islem_id}>
                                <td className="fw-bold">{k.baslik}</td>
                                <td>{k.ad_soyad}</td>
                                <td>
                                    <Badge bg="light" text="dark">{k.alis_tarihi}</Badge>
                                </td>
                                <td>
                                    <Button 
                                        size="sm" 
                                        variant="success" 
                                        onClick={() => teslimAl(k)}
                                    >
                                        📥 Teslim Al
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}