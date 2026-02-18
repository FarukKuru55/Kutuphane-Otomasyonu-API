import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import KitapListesi from './components/KitapListesi';
import KitapEkle from './components/KitapEkle';
import YazarYonetimi from './components/YazarYonetimi';
import OduncIslemleri from './components/OduncIslemleri';
import OkuyucuYonetimi from './components/OkuyucuYonetimi';
import TeslimIslemleri from './components/TeslimIslemleri';

function App() {
  const [showEkle, setShowEkle] = useState(false);
  const [showListe, setShowListe] = useState(false);
  const [showYazar, setShowYazar] = useState(false);
  const [showOdunc, setShowOdunc] = useState(false);
  const [showOkuyucu, setShowOkuyucu] = useState(false);
  const [showTeslim, setShowTeslim] = useState(false);

  const sayfaYenile = () => {
    window.location.reload();
  };

  return (
    /* vh-100 ve vw-100 ile tüm ekranı kaplıyoruz, d-flex ile tam ortaya mıknatıs gibi çekiyoruz */
    <div className="bg-light vh-100 vw-100 d-flex align-items-center justify-content-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="text-center p-5 shadow-lg rounded-4 bg-white border">
              <h1 className="display-5 fw-bold mb-4">📚 Kütüphane Paneli</h1>
              <p className="text-muted mb-5">Yapmak istediğiniz görevi seçin.</p>

              <Row className="g-3">
                <Col xs={12}>
                  <Button 
                    variant="outline-primary" 
                    size="lg" 
                    className="w-100 py-3 fw-semibold shadow-sm"
                    onClick={() => setShowListe(true)}
                  >
                    🔍 Kitap Arşivini Görüntüle
                  </Button>
                </Col>
                <Col xs={12}>
                  <Button 
                    variant="outline-success" 
                    size="lg" 
                    className="w-100 py-3 fw-semibold shadow-sm"
                    onClick={() => setShowEkle(true)}
                  >
                    ➕ Yeni Kitap Tanımla
                  </Button>
                </Col>
                <Col xs={12}>
           <Button 
             variant="outline-dark" 
             size="lg" 
             className="w-100 py-3 fw-semibold shadow-sm"
             onClick={() => setShowYazar(true)}
           >
             ✍️ Yazarları Yönet
           </Button>
           </Col>
              </Row>

              <div className="mt-5 text-secondary small opacity-75">
                v2 | Kütüphane | Samsun
              </div>
            </div>
          </Col>
          <Col xs={12}>
            <Button 
             variant="outline-warning" 
             size="lg" 
             className="w-100 py-3 fw-semibold shadow-sm"
             onClick={() => setShowOdunc(true)}
             >
                🤝 Ödünç Ver
            </Button>
        </Col>

        <Col xs={12}>
       <Button 
          variant="outline-danger" // Kırmızımsı buton olsun
          size="lg" 
          className="w-100 py-3 fw-semibold shadow-sm"
          onClick={() => setShowTeslim(true)}
    >
          🔄 Kitap Teslim Al (İade)
       </Button>
       </Col>
              <Col xs={12}>
        <Button 
          variant="outline-info" 
          size="lg" 
          className="w-100 py-3 fw-semibold shadow-sm"
          onClick={() => setShowOkuyucu(true)}
        >
          👥 Okuyucuları Yönet
        </Button>
        </Col>
        </Row>
      </Container>

      {/* --- MODAL: KİTAP EKLEME --- */}
      <Modal show={showEkle} onHide={() => setShowEkle(false)} centered size="sm"> 
        {/* Buradaki size="sm" kısmını elinle tekrar yazmayı dene */}
        <Modal.Header closeButton>
          <Modal.Title>Yeni Kitap Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <KitapEkle veriGuncelle={sayfaYenile} />
        </Modal.Body>
      </Modal>


      <Modal show={showListe} onHide={() => setShowListe(false)} centered size="lg">
        {/* xl yerine lg kullanabilirsin, daha garanti olur */}
        <Modal.Header closeButton>
          <Modal.Title>Kitap Arşivi</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <KitapListesi />
        </Modal.Body>
      </Modal>

      <Modal show={showYazar} onHide={() => setShowYazar(false)} centered>
     <Modal.Header closeButton><Modal.Title>Yazar Paneli</Modal.Title></Modal.Header>
     <Modal.Body>
        <YazarYonetimi /> 
      </Modal.Body>
      </Modal>
      
      <Modal show={showOdunc} onHide={() => setShowOdunc(false)} centered size="lg">
    <Modal.Header closeButton><Modal.Title>Ödünç İşlemleri</Modal.Title></Modal.Header>
    <Modal.Body>
        <OduncIslemleri />
     </Modal.Body>
     </Modal>

     <Modal show={showOkuyucu} onHide={() => setShowOkuyucu(false)} centered>
    <Modal.Header closeButton><Modal.Title>Üye Paneli</Modal.Title></Modal.Header>
    <Modal.Body>
        <OkuyucuYonetimi />
      </Modal.Body>
      </Modal>
      
      <Modal show={showTeslim} onHide={() => setShowTeslim(false)} centered size="lg">
    <Modal.Header closeButton><Modal.Title>Kitap İade</Modal.Title></Modal.Header>
    <Modal.Body>
        <TeslimIslemleri />
    </Modal.Body>
    </Modal>

  </div>
  );
}

export default App;