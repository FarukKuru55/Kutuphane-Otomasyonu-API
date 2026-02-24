import { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { getKitaplar } from '../services/kitapService';
import { getOkuycular } from '../services/okuyucuService';
import { oduncVer } from '../services/oduncService';
import { toast } from 'react-toastify'; 

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
    
    const [showModal, setShowModal] = useState(false);
    const [seciliKitap, setSeciliKitap] = useState<Kitap | null>(null);
    const [seciliOkuyucuId, setSeciliOkuyucuId] = useState<number | string>("");

    const verileriYukle = async () => {
        try {
            const kData = await getKitaplar();
            setKitaplar(kData);
            const oData = await getOkuycular();
            setOkuyucular(oData);
        } catch (error) {
            toast.error("Veriler yüklenirken bir hata oluştu!");
        }
    };

    useEffect(() => { verileriYukle(); }, []);

    const modalAc = (kitap: Kitap) => {
        setSeciliKitap(kitap);
        setSeciliOkuyucuId(""); 
        setShowModal(true);
    };

    // 2. İŞLEMİ YAP FONKSİYONU MODERNİZE EDİLDİ
    const islemiYap = async () => {
        if (!seciliKitap || !seciliOkuyucuId) {
            toast.warning("⚠️ Lütfen bir okuyucu seçin!");
            return;
        }

        try {
            await oduncVer({
                kitap_id: seciliKitap.id,
                okuyucu_id: Number(seciliOkuyucuId)
            });

            // Başarı bildirimi
            toast.success(`✅ ${seciliKitap.baslik} başarıyla ödünç verildi!`, {
                theme: "colored"
            });
            
            await verileriYukle();
            setShowModal(false);  

        } catch (error: any) {
            const hataMesaji = error.response?.data?.error || "Hata oluştu!";
            toast.error(`❌ ${hataMesaji}`, {
                theme: "colored"
            });
        }
    };

    return (
        <div className="mt-4">
            <h3 className="mb-3 fw-bold text-success">📚 Ödünç Verme İşlemleri</h3>
            
            <Table striped bordered hover responsive className='shadow-sm'>
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
                        <tr key={k.id} className="align-middle">
                            <td>{k.id}</td>
                            <td className="fw-bold">{k.baslik}</td>
                            <td>{k.yazar}</td>
                            <td>
                                <Badge bg={k.stok > 0 ? "primary" : "secondary"} className="px-3 py-2">
                                    {k.stok} Adet
                                </Badge>
                            </td>
                            <td>
                                <Button 
                                    size="sm" 
                                    variant={k.stok > 0 ? "success" : "secondary"}
                                    disabled={k.stok === 0}
                                    onClick={() => modalAc(k)}
                                    className="fw-bold"
                                >
                                    {k.stok > 0 ? "🤝 Ödünç Ver" : "Stok Yok"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>📖 {seciliKitap?.baslik}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label className="fw-bold small text-secondary">Kitabı Kime Veriyoruz?</Form.Label>
                            <Form.Select 
                                value={seciliOkuyucuId}
                                onChange={(e) => setSeciliOkuyucuId(e.target.value)}
                                className="rounded-3"
                            >
                                <option value="">Okuyucu Seçiniz...</option>
                                {okuyucular.map(okuyucu => (
                                    <option key={okuyucu.id} value={okuyucu.id}>
                                        {okuyucu.ad_soyad}
                                    </option>
                                ))}
                            </Form.Select>
                            {okuyucular.length === 0 && (
                                <Form.Text className="text-danger fw-bold">
                                    * Önce Okuyucu eklemelisin!
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>İptal</Button>
                    <Button variant="success" onClick={islemiYap} disabled={!seciliOkuyucuId} className="fw-bold px-4">
                        Onayla ve Ver
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}