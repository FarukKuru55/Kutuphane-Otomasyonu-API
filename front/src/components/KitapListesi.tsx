import { useEffect, useState } from 'react';
import { Table, Badge, Button, Alert, Modal, Form } from 'react-bootstrap'; 
// getYazarlar fonksiyonunu da import etmeyi unutma (api.ts'ye eklediysen)
import { getKitaplar, getYazarlar, kitapSil, kitapGuncelle } from '../services/api';

interface Kitap {
    id: number;
    baslik: string;
    yazar: string;    // Tabloda göstermek için (Backend join ile gönderiyor)
    yazar_id: number; // Düzenlemek için (Dropdown'da seçili gelmesi için)
    stok: number;
}

interface Yazar {
    id: number;
    ad_soyad: string;
}

export default function KitapListesi() {
    const [kitaplar, setKitaplar] = useState<Kitap[]>([]);
    const [yazarlar, setYazarlar] = useState<Yazar[]>([]); // Yazar listesi için state

    const [showEdit, setShowEdit] = useState(false);
    const [seciliKitap, setSeciliKitap] = useState<Kitap | null>(null);

    // SİLME İŞLEMİ (Aynı kaldı)
    const kitapsilme_islemi = async (id: number) => {
        if (window.confirm("Bu kitabı silmek istediğine emin misin?")) {
            try {
                await kitapSil(id);
                alert("Kitap silindi!"); 
                verileriGetir(); // Listeyi yenile
            } catch (error: any) {
                alert("Hata: " + (error.response?.data?.error || "Silinemedi"));
            }
        }
    };

    // DÜZENLEME MODALINI AÇ
    const duzenleModaliAc = (kitap: Kitap) => {
        setSeciliKitap({...kitap});
        setShowEdit(true);
    };
    
    // GÜNCELLEME KAYDET (ID gönderiyoruz!)
    const guncelleKaydet = async () => {
        if (seciliKitap) {
            try {
                // Backend'e İSİM DEĞİL, ID GÖNDERİYORUZ
                await kitapGuncelle(seciliKitap.id, { 
                    baslik: seciliKitap.baslik, 
                    yazar_id: Number(seciliKitap.yazar_id), 
                    stok: seciliKitap.stok 
                });
                
                setShowEdit(false);
                verileriGetir(); // Listeyi yenile
                alert("✅ Kitap Güncellendi!");
            } catch (error) {
                alert("❌ Güncelleme hatası!");
            }
        }
    };

    // VERİLERİ ÇEKME FONKSİYONU
    async function verileriGetir() {
        const kitapVeri = await getKitaplar();
        setKitaplar(kitapVeri);
        
        // Yazarları da çekiyoruz ki Dropdown dolsun
        try {
            const yazarVeri = await getYazarlar();
            setYazarlar(yazarVeri);
        } catch (e) {
            console.log("Yazarlar çekilemedi");
        }
    }

    useEffect(() => {
        verileriGetir();
    }, []);

    return (
        <div className="mt-4">
            <h3 className="mb-3">📖 Kitap Listesi</h3>
            
            {kitaplar.length === 0 ? (
                <Alert variant="warning">Yükleniyor veya hiç kitap yok...</Alert>
            ) : (
                <>
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
                                <td>{k.yazar}</td>
                                <td>
                                    <Badge bg={k.stok > 0 ? "success" : "danger"}>
                                        {k.stok} Adet
                                    </Badge>
                                </td>
                                <td>
                                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => duzenleModaliAc(k)}>
                                        Düzenle
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => kitapsilme_islemi(k.id)}>
                                        Sil
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* DÜZENLEME MODALI */}
                <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>📝 Kitabı Düzenle</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {seciliKitap && (
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Kitap Adı</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={seciliKitap.baslik}
                                        onChange={(e) => setSeciliKitap({...seciliKitap, baslik: e.target.value})}
                                    />
                                </Form.Group>

                                {/* İŞTE DEĞİŞEN KISIM: DROPDOWN (SELECT) */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Yazar Seç</Form.Label>
                                    <Form.Select 
                                        value={seciliKitap.yazar_id} // Yazarın ID'sine göre seçili gelir
                                        onChange={(e) => setSeciliKitap({...seciliKitap, yazar_id: Number(e.target.value)})}
                                    >
                                        <option value="">Yazar Seçiniz...</option>
                                          {yazarlar.map((yazar) => (
                                            <option key={yazar.id} value={yazar.id}>
                                                {yazar.ad_soyad}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                {/* --------------------------------------- */}

                                <Form.Group className="mb-3">
                                    <Form.Label>Stok Adedi</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        value={seciliKitap.stok}
                                        onChange={(e) => setSeciliKitap({...seciliKitap, stok: Number(e.target.value)})}
                                    />
                                </Form.Group>
                            </Form>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEdit(false)}>Vazgeç</Button>
                        <Button variant="primary" onClick={guncelleKaydet}>Değişiklikleri Kaydet</Button>
                    </Modal.Footer>
                </Modal>
                </>
            )}
        </div>
    );
}