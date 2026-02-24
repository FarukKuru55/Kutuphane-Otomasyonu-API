import { useEffect, useState } from 'react';
import { Table, Button, Form, InputGroup, Card } from 'react-bootstrap';
import { getYazarlar, addYazar, deleteYazar } from '../services/yazarService';
import { toast } from 'react-toastify'; // Bildirimler için
import Swal from 'sweetalert2'; // Onay pencereleri için

interface Yazar {
    id: number;
    ad_soyad: string;
}

export default function YazarYonetimi() {
    const [yazarlar, setYazarlar] = useState<Yazar[]>([]);
    const [yeniYazarAdi, setYeniYazarAdi] = useState("");

    // 1. Verileri Çek
    const verileriGetir = async () => {
        try {
            const veri = await getYazarlar();
            setYazarlar(veri);
        } catch (error) {
            toast.error("Yazar listesi yüklenemedi!");
        }
    };

    useEffect(() => { verileriGetir(); }, []);

    // 2. Yazar Ekleme Fonksiyonu (Modernize Edildi)
    const yazarEkle = async (e?: React.FormEvent) => {
        if (e) e.preventDefault(); // Sayfa yenilenmesini engeller

        if (!yeniYazarAdi.trim()) {
            toast.warning("Lütfen bir yazar adı girin!");
            return;
        }

        try {
            const sonuc = await addYazar(yeniYazarAdi);
            
            if (sonuc.var_miydi) {
                // Backend "bu yazar zaten var" dediğinde:
                toast.info(`⚠️ ${yeniYazarAdi} zaten sistemde kayıtlı!`, {
                    theme: "colored"
                });
            } else {
                // Yeni kayıt başarılı olduğunda:
                toast.success(`✅ ${yeniYazarAdi} başarıyla listeye eklendi.`, {
                    theme: "colored"
                });
                setYeniYazarAdi(""); // Kutuyu temizle
                verileriGetir(); // Listeyi yenile
            }
        } catch (error) {
            toast.error("❌ Yazar eklenirken bir hata oluştu!");
        }
    };

    // 3. Yazar Silme Fonksiyonu (Swal Onay Mekanizması)
    const yazarSil = async (id: number, isim: string) => {
        Swal.fire({
            title: 'Yazarı Sil?',
            text: `${isim} adlı yazarı sildiğinizde, ona bağlı kitaplar etkilenebilir!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, Sil!',
            cancelButtonText: 'Vazgeç'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteYazar(id);
                    toast.success("🗑️ Yazar başarıyla silindi.", { theme: "colored" });
                    verileriGetir();
                } catch (error: any) {
                    // Backend'den gelen hatayı göster (Örn: "Yazarın kitabı var silemezsin")
                    const hataMetni = error.response?.data?.error || "Silinemedi!";
                    toast.error(`⛔ ${hataMetni}`, { theme: "colored" });
                }
            }
        });
    };

    return (
        <Card className="shadow-sm border-0">
            <Card.Body>
                <Card.Title className="mb-4 fw-bold text-dark border-bottom pb-2">
                    ✍️ Yazar Yönetimi
                </Card.Title>
                
                {/* Ekleme Formu */}
                <Form onSubmit={yazarEkle}>
                    <InputGroup className="mb-4 shadow-sm">
                        <Form.Control
                            placeholder="Yeni Yazar Adı..."
                            value={yeniYazarAdi}
                            onChange={(e) => setYeniYazarAdi(e.target.value)}
                        />
                        <Button variant="success" className="fw-bold" type="submit">
                            ➕ Ekle
                        </Button>
                    </InputGroup>
                </Form>

                {/* Liste Alanı */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table striped hover responsive size="sm" className="align-middle">
                        <thead className="bg-light sticky-top">
                            <tr>
                                <th>ID</th>
                                <th>Yazar Adı</th>
                                <th className="text-center">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {yazarlar.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-4 text-muted">
                                        <i>Henüz yazar kaydı bulunmuyor.</i>
                                    </td>
                                </tr>
                            ) : (
                                yazarlar.map((yazar) => (
                                    <tr key={yazar.id}>
                                        <td>{yazar.id}</td>
                                        <td className="fw-bold text-dark">{yazar.ad_soyad}</td>
                                        <td className="text-center">
                                            <Button 
                                                size="sm" 
                                                variant="outline-danger"
                                                onClick={() => yazarSil(yazar.id, yazar.ad_soyad)}
                                                className="fw-bold px-3"
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