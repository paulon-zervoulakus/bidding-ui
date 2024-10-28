// services/axiosInstance.ts
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// Create an Axios instance with a default base URL
const axiosInstance = axios.create({
    baseURL: API_URL , // Replace with your API base URL
    // You can set default headers here if needed
    // headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});

export default axiosInstance;
