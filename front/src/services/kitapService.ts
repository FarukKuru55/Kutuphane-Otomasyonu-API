import apiClients from './axiosSetup';

export interface KitapVerisi {
    baslik: string;
    yazar_id: number;
    stok: number;
}

// 1. KİTAPLARI GETİRME
export const getKitaplar = async () => {
    // apiClients zaten baseURL'i biliyor, sadece '/kitaplar' diyoruz.
    const response = await apiClients.get('/kitaplar');
    return response.data;
};

// 2. KİTAP EKLEME
export const addKitap = async (kitapVerisi: KitapVerisi) => {
    const response = await apiClients.post('/kitap/ekle', kitapVerisi);
    return response.data;
};

// 3. KİTAP SİLME
export const kitapSil = async (id: number) => {
    const response = await apiClients.delete(`/kitap/sil/${id}`);
    return response.data;
};

// 4. KİTAP GÜNCELLEME
export const kitapGuncelle = async (id: number, guncelVeri: KitapVerisi) => {
    const response = await apiClients.put(`/kitap/guncelle/${id}`, guncelVeri);
    return response.data;
};