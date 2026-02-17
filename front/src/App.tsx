import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import KitapListesi from './components/KitapListesi';
import KitapEkle from './components/KitapEkle';

function App() {
  const [showEkle, setShowEkle] = useState(false);
  const [showListe, setShowListe] = useState(false);

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
              </Row>

              <div className="mt-5 text-secondary small opacity-75">
                v1.2 | Faruk Kuru | Samsun
              </div>
            </div>
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

      {/* --- MODAL: LİSTELEME --- */}
      <Modal show={showListe} onHide={() => setShowListe(false)} centered size="lg">
        {/* xl yerine lg kullanabilirsin, daha garanti olur */}
        <Modal.Header closeButton>
          <Modal.Title>Kitap Arşivi</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <KitapListesi />
        </Modal.Body>
      </Modal>
  </div>
  );
}

export default App;