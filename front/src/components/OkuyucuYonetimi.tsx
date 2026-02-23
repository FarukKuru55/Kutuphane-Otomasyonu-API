import { useEffect, useState } from 'react';
import { Table, Button, Form, InputGroup, Alert, Card } from 'react-bootstrap';
// Yeni eklediğimiz fonksiyonları import ediyoruz
import { getOkuycular, addOkuyucu, deleteOkuyucu } from '../services/okuyucuService';

interface Okuyucu {
    id: number;
    ad_soyad: string;
}

export default function OkuyucuYonetimi() {
    const [okuyucular, setOkuyucular] = useState<Okuyucu[]>([]);
    const [yeniOkuyucuAdi, setYeniOkuyucuAdi] = useState("");
    const [mesaj, setMesaj] = useState<{tur: string, text: string} | null>(null);

    // Verileri Çek
    const verileriGetir = async () => {
        const veri = await getOkuycular();
        setOkuyucular(veri);
    };

    useEffect(() => { verileriGetir(); }, []);

    // Ekleme İşlemi
    const ekle = async () => {
        if (!yeniOkuyucuAdi.trim()) return;
        try {
            await addOkuyucu(yeniOkuyucuAdi);
            setMesaj({ tur: 'success', text: `✅ ${yeniOkuyucuAdi} kütüphaneye üye yapıldı.` });
            setYeniOkuyucuAdi("");
            verileriGetir();
        } catch (error) {
            setMesaj({ tur: 'danger', text: "❌ Okuyucu eklenemedi!" });
        }
    };

    // Silme İşlemi
    const sil = async (id: number) => {
        if (!window.confirm("Bu üyeyi silmek istediğine emin misin?")) return;
        
        try {
            await deleteOkuyucu(id);
            setMesaj({ tur: 'success', text: "🗑️ Üyelik silindi." });
            verileriGetir();
        } catch (error: any) {
            // Eğer okuyucunun elinde kitap varsa backend hata döner
            const hataMetni = error.response?.data?.error || "Silinemedi!";
            setMesaj({ tur: 'danger', text: `⛔ ${hataMetni}` });
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Body>
                <Card.Title className="mb-4">👥 Okuyucu (Üye) Yönetimi</Card.Title>
                
                {mesaj && (
                    <Alert variant={mesaj.tur} onClose={() => setMesaj(null)} dismissible>
                        {mesaj.text}
                    </Alert>
                )}

                <InputGroup className="mb-4">
                    <Form.Control
                        placeholder="Ad Soyad Giriniz..."
                        value={yeniOkuyucuAdi}
                        onChange={(e) => setYeniOkuyucuAdi(e.target.value)}
                    />
                    <Button variant="success" onClick={ekle}>➕ Üye Ekle</Button>
                </InputGroup>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table striped hover size="sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ad Soyad</th>
                                <th style={{width: '100px'}}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {okuyucular.map((okuyucu) => (
                                <tr key={okuyucu.id}>
                                    <td>{okuyucu.id}</td>
                                    <td>{okuyucu.ad_soyad}</td>
                                    <td>
                                        <Button 
                                            size="sm" 
                                            variant="outline-danger"
                                            onClick={() => sil(okuyucu.id)}
                                        >
                                            Sil
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
}