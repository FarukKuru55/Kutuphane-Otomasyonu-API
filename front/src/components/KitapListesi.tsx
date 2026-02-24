import { useEffect, useState } from 'react';
import { Table, Badge, Button, Alert, Modal, Form } from 'react-bootstrap'; 
import { getKitaplar, kitapSil, kitapGuncelle } from '../services/kitapService';
import { getYazarlar } from '../services/yazarService';
import Swal from 'sweetalert2'; // Şık pencereler için
import { toast } from 'react-toastify'; // Hızlı bildirimler için

interface Kitap {
    id: number;
    baslik: string;
    yazar: string;
    yazar_id: number;
    stok: number;
}

interface Yazar {
    id: number;
    ad_soyad: string;
}

export default function KitapListesi() {
    const [kitaplar, setKitaplar] = useState<Kitap[]>([]);
    const [yazarlar, setYazarlar] = useState<Yazar[]>([]);
    const [showEdit, setShowEdit] = useState(false);
    const [seciliKitap, setSeciliKitap] = useState<Kitap | null>(null);

    // --- 1. SİLME İŞLEMİ (SWEETALERT2 MODERNEZE EDİLDİ) ---
    const kitapsilme_islemi = (id: number) => {
        Swal.fire({
            title: 'Emin misiniz?',
            text: "Bu kitabı sildiğinizde geri alamazsınız!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await kitapSil(id);
                    // Başarılıysa küçük bir toast gösterelim
                    toast.success("🚀 Kitap başarıyla silindi!", { theme: "colored" });
                    verileriGetir(); // Listeyi yenile
                } catch (error: any) {
                    toast.error("❌ Silme başarısız: " + (error.response?.data?.error || "Hata"));
                }
            }
        });
    };

    // --- 2. GÜNCELLEME KAYDET (TOAST EKLENDİ) ---
    const guncelleKaydet = async () => {
        if (seciliKitap) {
            try {
                await kitapGuncelle(seciliKitap.id, { 
                    baslik: seciliKitap.baslik, 
                    yazar_id: Number(seciliKitap.yazar_id), 
                    stok: seciliKitap.stok 
                });
                
                setShowEdit(false);
                verileriGetir(); 
                toast.success("✅ Kitap başarıyla güncellendi!", { theme: "colored" });
            } catch (error) {
                toast.error("❌ Güncelleme hatası!");
            }
        }
    };

    const duzenleModaliAc = (kitap: Kitap) => {
        setSeciliKitap({...kitap});
        setShowEdit(true);
    };

    async function verileriGetir() {
        const kitapVeri = await getKitaplar();
        setKitaplar(kitapVeri);
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
            <h3 className="mb-3 fw-bold text-primary">📖 Kitap Arşivi</h3>
            
            {kitaplar.length === 0 ? (
                <Alert variant="info">Kitaplar yükleniyor veya kütüphane boş...</Alert>
            ) : (
                <>
                <Table striped bordered hover responsive className='shadow-sm'>
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
                            <tr key={k.id} className="align-middle">
                                <td>{k.id}</td>
                                <td className="fw-bold">{k.baslik}</td>
                                <td>{k.yazar}</td>
                                <td>
                                    <Badge bg={k.stok > 0 ? "success" : "danger"} className="px-3 py-2">
                                        {k.stok} Adet
                                    </Badge>
                                </td>
                                <td>
                                    <Button size="sm" variant="outline-primary" className="me-2 fw-bold" onClick={() => duzenleModaliAc(k)}>
                                        ✏️ Düzenle
                                    </Button>
                                    <Button size="sm" variant="outline-danger" className="fw-bold" onClick={() => kitapsilme_islemi(k.id)}>
                                        🗑️ Sil
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                    <Modal.Header closeButton className="bg-light">
                        <Modal.Title>📝 Kitabı Düzenle</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {seciliKitap && (
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Kitap Adı</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={seciliKitap.baslik}
                                        onChange={(e) => setSeciliKitap({...seciliKitap, baslik: e.target.value})}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Yazar Seç</Form.Label>
                                    <Form.Select 
                                        value={seciliKitap.yazar_id}
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

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Stok Adedi</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        value={seciliKitap.stok}
                                        onChange={(e) => setSeciliKitap({...seciliKitap, stok: Number(e.target.value)})}
                                    />
                                </Form.Group>
                            </Form>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="bg-light">
                        <Button variant="secondary" onClick={() => setShowEdit(false)}>Vazgeç</Button>
                        <Button variant="primary" className="fw-bold" onClick={guncelleKaydet}>💾 Değişiklikleri Kaydet</Button>
                    </Modal.Footer>
                </Modal>
                </>
            )}
        </div>
    );
}