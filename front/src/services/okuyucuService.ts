import apiClients from './axiosSetup';

// OKUYUCULARI GETİR
export const getOkuycular = async () => {
    const response = await apiClients.get('/okuyucular');
    return response.data;
};

// OKUYUCU EKLE
export const addOkuyucu = async (adSoyad: string) => {
    const response = await apiClients.post('/okuyucu/ekle', { ad_soyad: adSoyad });
    return response.data;
};

// OKUYUCU SİL
export const deleteOkuyucu = async (id: number) => {
    const response = await apiClients.delete('/okuyucu/silme', { data: { okuyucu_id: id } });
    return response.data;
};