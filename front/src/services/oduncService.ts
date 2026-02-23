// services/oduncService.ts
import apiClients from './axiosSetup';

// ÖDÜNÇ VERME (Kitabı dışarı gönderme)
export const oduncVer = async (veri: { kitap_id: number; okuyucu_id: number }) => {
    const response = await apiClients.post('/odunc/al', veri);
    return response.data;
};

export const kitapTeslimAl = async (veri: { kitap_id: number; okuyucu_id: number }) => {
    const response = await apiClients.post('/odunc/teslim', veri);
    return response.data;
};


export const getOduncListesi = async () => {
    const response = await apiClients.get('/odunc/listesi');
    return response.data;
};