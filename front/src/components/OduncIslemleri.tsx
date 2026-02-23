import { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { getKitaplar } from '../services/kitapService';
import { getOkuycular } from '../services/okuyucuService';
import { oduncVer } from '../services/oduncService';

interface Kitap {
    id: number;
    baslik: string;
    yazar: string;
    stok: number;
}

interface Okuyucu {
    id: number;
    ad_soyad: string;
}

export default function OduncIslemleri() {
    const [kitaplar, setKitaplar] = useState<Kitap[]>([]);
    const [okuyucular, setOkuyucular] = useState<Okuyucu[]>([]);
    
    // Modal Durumları
    const [showModal, setShowModal] = useState(false);
    const [seciliKitap, setSeciliKitap] = useState<Kitap | null>(null);
    const [seciliOkuyucuId, setSeciliOkuyucuId] = useState<number | string>("");

    const [mesaj, setMesaj] = useState<{tur: string, text: string} | null>(null);

    // 1. Verileri Çek (Kitaplar ve Okuyucular)
    const verileriYukle = async () => {
        const kData = await getKitaplar();
        setKitaplar(kData);
        
        const oData = await getOkuycular();
        setOkuyucular(oData);
    };

    useEffect(() => { verileriYukle(); }, []);

    // 2. Butona basınca Modalı Aç
    const modalAc = (kitap: Kitap) => {
        setSeciliKitap(kitap);
        setSeciliOkuyucuId(""); // Seçimi sıfırla
        setMesaj(null); // Eski mesajları sil
        setShowModal(true);
    };

    // 3. İşlemi Tamamla (Backend'e Gönder)
    const islemiYap = async () => {
        if (!seciliKitap || !seciliOkuyucuId) {
            setMesaj({ tur: 'warning', text: "Lütfen bir okuyucu seçin!" });
            return;
        }

        try {
            await oduncVer({
                kitap_id: seciliKitap.id,
                okuyucu_id: Number(seciliOkuyucuId)
            });

            setMesaj({ tur: 'success', text: "✅ Kitap başarıyla ödünç verildi!" });
            
            // Listeyi yenile ki stok düşüşünü görelim!
            await verileriYukle();
            
            // Kısa süre sonra modalı kapat
            setTimeout(() => setShowModal(false), 1500);

        } catch (error: any) {
            setMesaj({ tur: 'danger', text: error.response?.data?.error || "Hata oluştu!" });
        }
    };

    return (
        <div className="mt-4">
            <h3 className="mb-3">📚 Ödünç Verme İşlemleri</h3>
            
            <Table striped bordered hover className='shadow-sm'>
                <thead className="bg-success text-white">
                    <tr>
                        <th>ID</th>
                        <th>Kitap Adı</th>
                        <th>Yazar</th>
                        <th>Stok Durumu</th>
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
                                <Badge bg={k.stok > 0 ? "primary" : "secondary"}>
                                    {k.stok} Adet
                                </Badge>
                            </td>
                            <td>
                                <Button 
                                    size="sm" 
                                    variant={k.stok > 0 ? "outline-success" : "secondary"}
                                    disabled={k.stok === 0} // Stok yoksa tıklanamasın
                                    onClick={() => modalAc(k)}
                                >
                                    {k.stok > 0 ? "Ödünç Ver" : "Stok Yok"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* ÖDÜNÇ VERME MODALI */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>📖 {seciliKitap?.baslik} - Ödünç Ver</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {mesaj && <Alert variant={mesaj.tur}>{mesaj.text}</Alert>}
                    
                    <Form>
                        <Form.Group>
                            <Form.Label>Kitabı Kime Veriyoruz?</Form.Label>
                            <Form.Select 
                                value={seciliOkuyucuId}
                                onChange={(e) => setSeciliOkuyucuId(e.target.value)}
                            >
                                <option value="">Okuyucu Seçiniz...</option>
                                {okuyucular.map(okuyucu => (
                                    <option key={okuyucu.id} value={okuyucu.id}>
                                        {okuyucu.ad_soyad}
                                    </option>
                                ))}
                            </Form.Select>
                            {okuyucular.length === 0 && (
                                <Form.Text className="text-danger">
                                    * Listede kimse yok. Önce Okuyucu eklemelisin!
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>İptal</Button>
                    <Button variant="success" onClick={islemiYap} disabled={!seciliOkuyucuId}>
                        Onayla ve Ver
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}