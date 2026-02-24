import { useEffect, useState } from 'react';
import { Table, Button, Badge, Alert } from 'react-bootstrap';
import { getOduncListesi, kitapTeslimAl } from '../services/oduncService';
import { toast } from 'react-toastify'; // Bildirimler için
import Swal from 'sweetalert2'; // Onay kutuları için

interface OduncKayit {
    islem_id: number;
    kitap_id: number;
    okuyucu_id: number;
    baslik: string;
    ad_soyad: string;
    alis_tarihi: string;
}

export default function TeslimIslemleri() {
    const [liste, setListe] = useState<OduncKayit[]>([]);

    // 1. Listeyi Çek
    const verileriGetir = async () => {
        try {
            const veri = await getOduncListesi();
            setListe(veri);
        } catch (error) {
            toast.error("Ödünç listesi yüklenemedi!");
        }
    };

    useEffect(() => { verileriGetir(); }, []);

    // Swal & Toast entegrasyonu ile teslim alma işlemi
    const teslimAl = async (kayit: OduncKayit) => {
        Swal.fire({
            title: 'Kitap İade Alınsın mı?',
            text: `${kayit.ad_soyad} isimli üyeden "${kayit.baslik}" kitabını teslim alıyorsunuz. Onaylıyor musunuz?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Evet, Teslim Al',
            cancelButtonText: 'Vazgeç'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await kitapTeslimAl({
                        kitap_id: kayit.kitap_id,
                        okuyucu_id: kayit.okuyucu_id
                    });
                    
                    toast.success("✅ Kitap başarıyla teslim alındı ve stoğa eklendi!", {
                        theme: "colored"
                    });
                    verileriGetir(); // Listeyi yenile
                } catch (error) {
                    toast.error("❌ Teslim alma işleminde bir hata oluştu!");
                }
            }
        });
    };

    return (
        <div className="mt-4">
            <h3 className="mb-4 fw-bold text-danger border-bottom pb-2">
                ↩️ İade / Teslim Alma İşlemleri
            </h3>
            
            {liste.length === 0 ? (
                <Alert variant="info" className="shadow-sm border-0 rounded-3">
                    ✨ Şu an kimsede ödünç kitap yok. Tüm kitaplar raflarda güvende!
                </Alert>
            ) : (
                <div className="shadow-sm rounded-3 overflow-hidden border">
                    <Table striped hover responsive className="mb-0 align-middle">
                        <thead className="bg-warning text-dark">
                            <tr>
                                <th>Kitap Adı</th>
                                <th>Alan Üye</th>
                                <th>Veriliş Tarihi</th>
                                <th className="text-center">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {liste.map((k) => (
                                <tr key={k.islem_id}>
                                    <td className="fw-bold">{k.baslik}</td>
                                    <td>{k.ad_soyad}</td>
                                    <td>
                                        <Badge bg="secondary" className="fw-normal">
                                            📅 {k.alis_tarihi}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button 
                                            size="sm" 
                                            variant="success" 
                                            onClick={() => teslimAl(k)}
                                            className="fw-bold px-3 shadow-sm"
                                        >
                                            📥 Teslim Al
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
}