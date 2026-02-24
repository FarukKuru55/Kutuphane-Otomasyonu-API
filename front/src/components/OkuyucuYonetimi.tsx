import { useEffect, useState } from 'react';
import { Table, Button, Form, InputGroup, Card } from 'react-bootstrap';
import { getOkuycular, addOkuyucu, deleteOkuyucu } from '../services/okuyucuService';
import { toast } from 'react-toastify'; 
import Swal from 'sweetalert2'; 

interface Okuyucu {
    id: number;
    ad_soyad: string;
}

export default function OkuyucuYonetimi() {
    const [okuyucular, setOkuyucular] = useState<Okuyucu[]>([]);
    const [yeniOkuyucuAdi, setYeniOkuyucuAdi] = useState("");

    // 1. Verileri Çek
    const verileriGetir = async () => {
        try {
            const veri = await getOkuycular();
            setOkuyucular(veri);
        } catch (error) {
            toast.error("Üye listesi yüklenemedi!");
        }
    };

    useEffect(() => { verileriGetir(); }, []);

    // 2. Ekleme İşlemi (Toast Eklendi)
    const ekle = async () => {
        if (!yeniOkuyucuAdi.trim()) {
            toast.warning("Lütfen geçerli bir isim girin!");
            return;
        }
        try {
            await addOkuyucu(yeniOkuyucuAdi);
            toast.success(`✅ ${yeniOkuyucuAdi} kütüphaneye üye yapıldı.`, {
                theme: "colored"
            });
            setYeniOkuyucuAdi("");
            verileriGetir();
        } catch (error) {
            toast.error("❌ Okuyucu eklenemedi!");
        }
    };

    // 3. Silme İşlemi (Swal Onay Mekanizması Eklendi)
    const sil = async (id: number, isim: string) => {
        Swal.fire({
            title: 'Üyeliği Sil?',
            text: `${isim} adlı üyeyi silmek istediğinize emin misiniz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, Sil!',
            cancelButtonText: 'Vazgeç'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteOkuyucu(id);
                    toast.success("🗑️ Üyelik başarıyla silindi.", { theme: "colored" });
                    verileriGetir();
                } catch (error: any) {
                    // Backend'den gelen özel hatayı (örneğin: elinde kitap varsa silme) gösterir
                    const hataMetni = error.response?.data?.error || "Silinemedi!";
                    toast.error(`⛔ ${hataMetni}`, { theme: "colored" });
                }
            }
        });
    };

    return (
        <Card className="shadow-sm border-0">
            <Card.Body>
                <Card.Title className="mb-4 fw-bold text-info">👥 Okuyucu (Üye) Yönetimi</Card.Title>
                
                {/* Ekleme Alanı */}
                <InputGroup className="mb-4 shadow-sm">
                    <Form.Control
                        placeholder="Ad Soyad Giriniz..."
                        value={yeniOkuyucuAdi}
                        onChange={(e) => setYeniOkuyucuAdi(e.target.value)}
                        className="rounded-start"
                    />
                    <Button variant="info" className="text-white fw-bold" onClick={ekle}>
                        ➕ Üye Ekle
                    </Button>
                </InputGroup>

                {/* Liste Alanı */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table striped hover responsive size="sm" className="align-middle">
                        <thead className="bg-light sticky-top">
                            <tr>
                                <th>ID</th>
                                <th>Ad Soyad</th>
                                <th style={{width: '100px'}}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {okuyucular.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-3 text-muted">Kayıtlı üye bulunamadı.</td>
                                </tr>
                            ) : (
                                okuyucular.map((okuyucu) => (
                                    <tr key={okuyucu.id}>
                                        <td>{okuyucu.id}</td>
                                        <td className="fw-bold">{okuyucu.ad_soyad}</td>
                                        <td>
                                            <Button 
                                                size="sm" 
                                                variant="outline-danger"
                                                onClick={() => sil(okuyucu.id, okuyucu.ad_soyad)}
                                                className="fw-bold"
                                            >
                                                Sil
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
}