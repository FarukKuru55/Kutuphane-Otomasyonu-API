

import axios from "axios";

const baseURL = 'http://127.0.0.1:5000';
const apiClients = axios.create({
    baseURL: baseURL,
    timeout: 10000, 
});


apiClients.interceptors.response.use(
    
    response => response,
    
    error => {
        console.error("🔥 API Hatası (Merkez):", error.response ? error.response.data : error.message);
        
        return Promise.reject(error);
    }
);


export default apiClients;