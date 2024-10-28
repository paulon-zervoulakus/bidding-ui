// services/axiosInstance.ts
import axios from 'axios';

// Create an Axios instance with a default base URL
const axiosInstance = axios.create({
    baseURL: __API_URL__ , // Replace with your API base URL
    // You can set default headers here if needed
    // headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});

export default axiosInstance;
