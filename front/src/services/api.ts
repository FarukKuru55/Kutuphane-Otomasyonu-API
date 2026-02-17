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