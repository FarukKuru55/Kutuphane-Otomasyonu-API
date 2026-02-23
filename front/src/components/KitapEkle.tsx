import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { getYazarlar } from '../services/yazarService';
import { addKitap } from '../services/kitapService';

// Bu bileşenin alacağı parametrelerin tipini belirtiyoruz 
interface KitapEkleProps {
    veriGuncelle: () => void;
}

export default function KitapEkle({ veriGuncelle }: KitapEkleProps) {
    const [baslik, setBaslik] = useState("");
    const [yazarId, setYazarId] = useState("");
    const [stok, setStok] = useState("1");
    const [mesaj, setMesaj] = useState("");
    
    // Yazarları tutacak kutumuz (State)
    const [yazarlar, setYazarlar] = useState<any[]>([]);

    // Sayfa (Modal) ilk açıldığında çalışacak motor (useEffect)
    useEffect(() => {
        const yazarlariGetir = async () => {
            try {
                // Garsonu mutfağa yolla, yazarları getirsin
                const data = await getYazarlar();
                // Gelen listeyi kutuya koy (İsim hatası düzeltildi: setYazarlar)
                setYazarlar(data); 
            } catch (error) {
                console.error("Yazarlar çekilemedi:", error);
                setMesaj("❌ Yazarlar listesi yüklenemedi! İnternet bağlantınızı kontrol edin.");
            }
        };
        yazarlariGetir();
    }, []); // Boş [] sayesinde sadece açılışta 1 kere çalışır.

    const kaydet = async (e: React.FormEvent) => {
        e.preventDefault(); // Sayfanın yenilenmesini engelle
        
        try {
            await addKitap({
                baslik: baslik,
                yazar_id: Number(yazarId), 
                stok: Number(stok)
            });
            setMesaj("✅ Kitap Başarıyla Eklendi!");
            // Kutuları temizle
            setBaslik(""); 
            setYazarId("");
            setStok("1");
            veriGuncelle(); 
        } catch (error) {
            setMesaj("❌ Hata oluştu! Kitap eklenemedi.");
        }
    };

    return (
        <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
                {mesaj && <Alert variant={mesaj.includes("Hata") ? "danger" : "success"} className="mb-3 rounded-3">{mesaj}</Alert>}
                
                <Form onSubmit={kaydet}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-secondary">Kitap Adı</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Örn: Sefiller" 
                            value={baslik}
                            onChange={(e) => setBaslik(e.target.value)}
                            required
                            className="rounded-3"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-secondary">Yazar Seçin</Form.Label>
                        <Form.Select
                            value={yazarId}
                            onChange={(e) => setYazarId(e.target.value)}
                            required
                            className="rounded-3"
                        >
                            <option value="">Bir yazar seçiniz...</option>
                            {/* Yazarlar listesindeki her bir yazar için bir seçenek oluştur */}
                            {yazarlar.map((yazar) => (
                                // SİHİRLİ SATIR: Görünen "ad_soyad", arkada tutulan "id"
                                <option key={yazar.id} value={yazar.id}>
                                    {yazar.ad_soyad}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    
                    
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small text-secondary">Stok Adedi</Form.Label>
                        <Form.Control 
                            type="number" 
                            value={stok}
                            onChange={(e) => setStok(e.target.value)}
                            min="1"
                            className="rounded-3"
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100 rounded-3 py-2 fw-bold">
                        💾 Kitabı Kaydet
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}