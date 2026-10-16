import axios from "axios";

export const SESSION_STORAGE_KEY = "eventplus:session"
export const UNAUTHORIZED_EVENT = "eventplus:unauthorized"

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // Substitui pelo URL da tua API
});