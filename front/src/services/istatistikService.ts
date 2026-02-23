import apiClients from "./axiosSetup";

// DASHBOARD İSTATİSTİKLERİNİ GETİR
export const getIstatistik = async () => {
    const response = await apiClients.get('/istatistik');
    return response.data;
};  