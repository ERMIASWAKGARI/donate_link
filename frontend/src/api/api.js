import axios from "axios";
import URL from "../constants/api";

const axiosInstance = axios.create({
  baseURL: `${URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
