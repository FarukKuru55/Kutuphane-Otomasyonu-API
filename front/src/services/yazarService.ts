import apiClients from './axiosSetup';

// YAZARLARI GETİR
export const getYazarlar = async () => {
    const response = await apiClients.get('/yazarlar');
    return response.data;
};

// YAZAR EKLE
export const addYazar = async (adSoyad: string) => {
    const response = await apiClients.post('/yazar/ekle', { ad_soyad: adSoyad });
    return response.data;
};

// YAZAR SİL
export const deleteYazar = async (id: number) => {
    // Backend 'data' içinde bekliyorsa, axios'ta delete işlemi böyle yapılır:
    const response = await apiClients.delete('/yazar/silme', { data: { yazar_id: id } });
    return response.data;
};