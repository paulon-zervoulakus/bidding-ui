// services/axiosInstance.ts
import axios from 'axios';
const API_URL = 'http://localhost:5260'; // Your API URL
// Create an Axios instance with a default base URL
const axiosInstance = axios.create({
    baseURL: API_URL , // Replace with your API base URL
    // You can set default headers here if needed
    // headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});

export default axiosInstance;
