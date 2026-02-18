import { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { addKitap } from '../services/api';

export default function KitapEkle({ veriGuncelle }: { veriGuncelle: () => void }) {
    const [baslik, setBaslik] = useState("");
    const [yazarId, setYazarId] = useState("");
    const [stok, setStok] = useState("1");
    const [mesaj, setMesaj] = useState("");

    const kaydet = async (e: React.FormEvent) => {
        e.preventDefault(); // Sayfanın yenilenmesini engelle
        
        try {
            await addKitap({
                baslik: baslik,
                yazar_id: Number(yazarId),
                stok: Number(stok)
            });
            setMesaj("✅ Kitap Başarıyla Eklendi!");
            setBaslik(""); // Kutuları temizle
            setYazarId("");
            veriGuncelle(); // Listeyi yenile (Baba bileşene haber ver)
        } catch (error) {
            setMesaj("❌ Hata oluştu! (Yazar ID geçerli mi?)");
        }
    };

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Body>
                <Card.Title>➕ Yeni Kitap Ekle</Card.Title>
                {mesaj && <Alert variant={mesaj.includes("Hata") ? "danger" : "success"}>{mesaj}</Alert>}
                
                <Form onSubmit={kaydet}>
                    <Form.Group className="mb-2">
                        <Form.Label>Kitap Adı</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Örn: Sefiller" 
                            value={baslik}
                            onChange={(e) => setBaslik(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Yazar ID</Form.Label>
                        <Form.Control 
                            type="number" 
                            placeholder="Örn: 1" 
                            value={yazarId}
                            onChange={(e) => setYazarId(e.target.value)}
                            required
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Stok Adedi</Form.Label>
                        <Form.Control 
                            type="number" 
                            value={stok}
                            onChange={(e) => setStok(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="success" type="submit" className="w-100">
                        Kaydet
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}