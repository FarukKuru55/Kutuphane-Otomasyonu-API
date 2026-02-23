import axios from 'axios';

// Python Backend Adresimiz
const BASE_URL = 'http://127.0.0.1:5000';

// 1. KİTAPLARI GETİRME (GET)
export const getKitaplar = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/kitaplar`);
        return response.data;
    } catch (error) {
        console.error("Kitaplar alınamadı:", error);
        return [];
    }
};

    export const getYazarlar = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/yazarlar`);
            return response.data;
        } catch (error) {
            console.error("Yazarlar alınamadı:", error);
            return [];
        }
    };

// 2. KİTAP EKLEME (POST)
export const addKitap = async (kitapVerisi: any) => {
    try {
        const response = await axios.post(`${BASE_URL}/kitap/ekle`, kitapVerisi);
        return response.data;
    } catch (error) {
        console.error("Kitap eklenirken hata:", error);
        throw error;
    }
};

export const kitapSil = async (id: number) => {
    try { 
        const response = await axios.delete(`${BASE_URL}/kitap/sil/${id}`);
        return response.data;   
    } catch (error) {
        console.error("Kitap silinirken hata:", error);
        throw error;
    }
};

export const kitapGuncelle = async (id: number, guncelVeri: { baslik: string; yazar_id: number; stok: number }) => {
    try {
        const response = await axios.put(`${BASE_URL}/kitap/guncelle/${id}`, guncelVeri);
        return response.data;
    }   catch (error) {
        console.error("Kitap güncellenirken hata:", error);
        throw error;
    }
};


// 3. YAZAR EKLEME (POST)
export const addYazar = async (adSoyad: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/yazar/ekle`, { ad_soyad: adSoyad });
        return response.data;
    } catch (error) {
        console.error("Yazar ekleme hatası:", error);
        throw error;
    }
};

// 4. YAZAR SİLME (DELETE)
export const deleteYazar = async (id: number) => {
    try {
        const response = await axios.delete(`${BASE_URL}/yazar/silme`, { data: { yazar_id: id } });
        return response.data;
    } catch (error) {
        console.error("Yazar silme hatası:", error);
        throw error;
    }
};

export const getOkuycular = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/okuyucular`);
        return response.data;
    } catch (error) {
        console.error("Okuyucular alınamadı:", error);
        return [];
    }
};

export const oduncVer = async (veri: { kitap_id: number; okuyucu_id: number }) => {
    try {
        const response = await axios.post(`${BASE_URL}/odunc/al`, veri);
        return response.data;
    } catch (error) {
        console.error("Ödünç verme hatası:", error);
        throw error;
    }  
};

export const addOkuyucu = async (adSoyad: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/okuyucu/ekle`, { ad_soyad: adSoyad });
        return response.data;
    } catch (error) {
        console.error("Okuyucu ekleme hatası:", error);
        throw error;
    }
};

// --- OKUYUCU SİLME (DELETE) ---
export const deleteOkuyucu = async (id: number) => {
    try {
        const response = await axios.delete(`${BASE_URL}/okuyucu/silme`, { data: { okuyucu_id: id } });
        return response.data;
    } catch (error) {
        console.error("Okuyucu silme hatası:", error);
        throw error;
    }
};

export const getOduncListesi = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/odunc/listesi`);
        return response.data;
    }   catch (error) { 
        console.error("Ödünç listesi alınırken hata:", error);  
        return [];
    }
};  

export const kitapTeslimAl = async (veri: { kitap_id: number; okuyucu_id: number }) => {
    try {
        // Backend 'odunc/teslim' adresinde bu verileri bekliyor
        const response = await axios.post(`${BASE_URL}/odunc/teslim`, veri);
        return response.data;
    } catch (error) {
        console.error("Teslim alma hatası:", error);
        throw error;
    }
};

export const getIstatistik = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/istatistik`);     
        return response.data;
    } catch (error) {   
        console.error("İstatistik alınırken hata:", error);
        return null;    
    }   
};