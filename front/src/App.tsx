import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap'; 
import KitapListesi from './components/KitapListesi';
import KitapEkle from './components/KitapEkle';
import YazarYonetimi from './components/YazarYonetimi';
import OduncIslemleri from './components/OduncIslemleri';
import OkuyucuYonetimi from './components/OkuyucuYonetimi';
import TeslimIslemleri from './components/TeslimIslemleri';
import { getIstatistik } from './services/istatistikService';
import { ToastContainer, } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

interface Istatistik {
  toplam_kitap: number;
  toplam_yazar: number;
  toplam_okuyucu: number;
  odunc_kitap_sayisi: number;
} 

function App() {
  // Modal (Pencere) Durumları - Hepsi False (Kapalı) başlar
  const [showEkle, setShowEkle] = useState(false);
  const [showListe, setShowListe] = useState(false);
  const [showYazar, setShowYazar] = useState(false);
  const [showOdunc, setShowOdunc] = useState(false);
  const [showOkuyucu, setShowOkuyucu] = useState(false);
  const [showTeslim, setShowTeslim] = useState(false);
  const [istatistik, setIstatistik] = useState<Istatistik | null>(null);
  
  
  // Ekleme işleminden sonra sayfayı yenilemek için basit bir yöntem
  const sayfaYenile = () => {
    window.location.reload();
  };

  useEffect(() => {
    const verileriCek = async () => {
      try {
        const data = await getIstatistik();
        setIstatistik(data);
      } catch (error) {
        console.error("İstatistik Alınamadı:", error);
      }
    };

    verileriCek();
  } , []); // Boş bağımlılık dizisi, sadece ilk render'da çalışır

  return (
    
    <div className="bg-light vh-100 vw-100 d-flex align-items-center justify-content-center">
      <ToastContainer 
        position="top-right" 
        autoClose={3500} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={9}> {/* Kutuyu genişletme */}
            
            <div className="text-center p-5 shadow-lg rounded-4 bg-white border">
              <h1 className="display-5 fw-bold mb-3">📚 Kütüphane Paneli</h1>
              {/* İSTATİSTİK KUTULARI (Sayfa açılınca otomatik dolar) */}
              {istatistik && (
                <Row className="mb-4 g-3">
                  <Col xs={6} md={3}>
                    <div className="p-3 bg-primary text-white rounded-3 shadow-sm">
                      <h3 className="fw-bold mb-0">{istatistik.toplam_kitap}</h3>
                      <small className="opacity-75">Çeşit Kitap</small>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="p-3 bg-success text-white rounded-3 shadow-sm">
                      <h3 className="fw-bold mb-0">{istatistik.toplam_yazar}</h3>
                      <small className="opacity-75">Kayıtlı Yazar</small>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="p-3 bg-info text-white rounded-3 shadow-sm">
                      <h3 className="fw-bold mb-0">{istatistik.toplam_okuyucu}</h3>
                      <small className="opacity-75">Aktif Üye</small>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="p-3 bg-warning text-dark rounded-3 shadow-sm">
                      <h3 className="fw-bold mb-0">{istatistik.odunc_kitap_sayisi}</h3>
                      <small className="opacity-75">Dışarıda</small>
                    </div>
                  </Col>
                </Row>
              )}

              

              <Row className="g-4">
                
              
                <Col md={6}>
                    <div className="p-3 border rounded bg-light h-100">
                        <h6 className="text-secondary fw-bold mb-3">📖 Kitap & Yazar</h6>
                        <div className="d-grid gap-2">
                            <Button variant="outline-primary" onClick={() => setShowListe(true)}>
                                🔍 Kitap Listesi
                            </Button>
                            <Button variant="outline-success" onClick={() => setShowEkle(true)}>
                                ➕ Kitap Ekle
                            </Button>
                            <Button variant="outline-dark" onClick={() => setShowYazar(true)}>
                                ✍️ Yazar Yönetimi
                            </Button>
                        </div>
                    </div>
                </Col>  

                {/* SAĞ TARAFA: HAREKET İŞLEMLERİ */}
                <Col md={6}>
                    <div className="p-3 border rounded bg-light h-100">
                        <h6 className="text-secondary fw-bold mb-3">🔄 Hareket & Üye</h6>
                        <div className="d-grid gap-2">
                            <Button variant="warning" className="text-white" onClick={() => setShowOdunc(true)}>
                                🤝 Ödünç Ver
                            </Button>
                            <Button variant="danger" onClick={() => setShowTeslim(true)}>
                                ↩️ İade Al (Teslim)
                            </Button>
                            <Button variant="info" className="text-white" onClick={() => setShowOkuyucu(true)}>
                                👥 Üye Yönetimi
                            </Button>
                        </div>
                    </div>
                </Col>

              </Row>

              <div className="mt-4 text-secondary small opacity-50">
                Kütüphane yönetim paneli, kitap ekleme, listeleme, yazar yönetimi ve ödünç işlemleri için tasarlanmıştır. Herhangi bir sorun yaşarsanız, lütfen destek ekibiyle iletişime geçin.
              </div>  
            </div>

          </Col>
        </Row>
      </Container>

      
      <Modal show={showEkle} onHide={() => setShowEkle(false)} centered size="sm"> 
        <Modal.Header closeButton><Modal.Title>Yeni Kitap Ekle</Modal.Title></Modal.Header>
        <Modal.Body><KitapEkle veriGuncelle={sayfaYenile} /></Modal.Body>
      </Modal>

      <Modal show={showListe} onHide={() => setShowListe(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Kitap Arşivi</Modal.Title></Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}><KitapListesi /></Modal.Body>
      </Modal>

      <Modal show={showYazar} onHide={() => setShowYazar(false)} centered>
        <Modal.Header closeButton><Modal.Title>Yazar Paneli</Modal.Title></Modal.Header>
        <Modal.Body><YazarYonetimi /></Modal.Body>
      </Modal>
      
      <Modal show={showOdunc} onHide={() => setShowOdunc(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Ödünç İşlemleri</Modal.Title></Modal.Header>
        <Modal.Body><OduncIslemleri /></Modal.Body>
      </Modal>

      <Modal show={showOkuyucu} onHide={() => setShowOkuyucu(false)} centered>
        <Modal.Header closeButton><Modal.Title>Üye Paneli</Modal.Title></Modal.Header>
        <Modal.Body><OkuyucuYonetimi /></Modal.Body>
      </Modal>
      
      <Modal show={showTeslim} onHide={() => setShowTeslim(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Kitap İade</Modal.Title></Modal.Header>
        <Modal.Body><TeslimIslemleri /></Modal.Body>
      </Modal>

  </div>
  );
}

export default App; 