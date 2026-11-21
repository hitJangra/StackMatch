// centralized axios instance for all api calls
// reads base url from vite env variable with localhost fallback for local dev
import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.MODE === "production" ? "" : (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"),
    withCredentials: true,          // send cookies on every request
    timeout: 100000,                // 100s — covers worst-case Apify scraper runs
});
