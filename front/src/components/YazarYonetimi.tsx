import { useEffect, useState } from 'react';
import { Table, Button, Form, InputGroup, Alert, Card } from 'react-bootstrap';
import { getYazarlar, addYazar, deleteYazar } from '../services/api';

interface Yazar {
    id: number;
    ad_soyad: string;
}

export default function YazarYonetimi() {
    const [yazarlar, setYazarlar] = useState<Yazar[]>([]);
    const [yeniYazarAdi, setYeniYazarAdi] = useState("");
    const [mesaj, setMesaj] = useState<{tur: string, text: string} | null>(null);

    // Verileri Çek
    const verileriGetir = async () => {
        const veri = await getYazarlar();
        setYazarlar(veri);
    };

    useEffect(() => { verileriGetir(); }, []);

    // Yazar Ekleme Fonksiyonu
    const yazarEkle = async () => {
        if (!yeniYazarAdi.trim()) return;
        try {
            const sonuc = await addYazar(yeniYazarAdi);
            
            if (sonuc.var_miydi) {
                setMesaj({ tur: 'warning', text: `⚠️ ${yeniYazarAdi} zaten kayıtlı!` });
            } else {
                setMesaj({ tur: 'success', text: `✅ ${yeniYazarAdi} başarıyla eklendi.` });
                setYeniYazarAdi(""); // Kutuyu temizle
                verileriGetir(); // Listeyi yenile
            }
        } catch (error) {
            setMesaj({ tur: 'danger', text: "❌ Yazar eklenirken hata oluştu!" });
        }
    };

    // Yazar Silme Fonksiyonu
    const yazarSil = async (id: number) => {
        if (!window.confirm("Bu yazarı silmek istediğine emin misin?")) return;
        
        try {
            await deleteYazar(id);
            setMesaj({ tur: 'success', text: "🗑️ Yazar silindi." });
            verileriGetir();
        } catch (error: any) {
            // Backend'den gelen hatayı göster (Örn: "Kitabı var silemezsin")
            const hataMetni = error.response?.data?.error || "Silinemedi!";
            setMesaj({ tur: 'danger', text: `⛔ ${hataMetni}` });
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Body>
                <Card.Title className="mb-4">✍️ Yazar Yönetimi</Card.Title>
                
                {/* Mesaj Alanı */}
                {mesaj && (
                    <Alert variant={mesaj.tur} onClose={() => setMesaj(null)} dismissible>
                        {mesaj.text}
                    </Alert>
                )}

                {/* Ekleme Alanı */}
                <InputGroup className="mb-4">
                    <Form.Control
                        placeholder="Yeni Yazar Adı..."
                        value={yeniYazarAdi}
                        onChange={(e) => setYeniYazarAdi(e.target.value)}
                    />
                    <Button variant="success" onClick={yazarEkle}>➕ Ekle</Button>
                </InputGroup>

                {/* Liste Alanı */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table striped hover size="sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Yazar Adı</th>
                                <th style={{width: '100px'}}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {yazarlar.map((yazar) => (
                                <tr key={yazar.id}>
                                    <td>{yazar.id}</td>
                                    <td>{yazar.ad_soyad}</td>
                                    <td>
                                        <Button 
                                            size="sm" 
                                            variant="outline-danger"
                                            onClick={() => yazarSil(yazar.id)}
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