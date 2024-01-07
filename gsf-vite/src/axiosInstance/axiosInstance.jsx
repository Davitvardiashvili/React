import axios from "axios";

const axiosInstance = axios.create({
  baseURL: 'http://192.168.1.3:8000/api/'
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;