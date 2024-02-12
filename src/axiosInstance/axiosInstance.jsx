import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: 'https://resultsgsf.pythonanywhere.com/api/'
  // baseURL: 'http://localhost:8000/api/'
  baseURL: 'https://gsfresults-73ba263a2fd8.herokuapp.com/api/'
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