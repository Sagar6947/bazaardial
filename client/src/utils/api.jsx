// utils/api.js
import axios from "axios";
import { useMemo } from "react";

/* 1. Shared instance ------------------------------------------------ */
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // keep refresh-token cookie attached
});

/* 2. Attach access-token from localStorage -------------------------- */
const TOKEN_KEY = "token"; // <- use ONE key everywhere

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((cfg) => {
  const tk = getToken();
  if (tk) cfg.headers.Authorization = `Bearer ${tk}`;
  return cfg;
});

/* 3. Automatic refresh --------------------------------------------- */
let refreshing = false;
let queue = [];

function flushQueue(err, newTk) {
  queue.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else resolve(newTk);
  });
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((tk) => {
          original.headers.Authorization = `Bearer ${tk}`;
          return api(original);
        });
      }

      refreshing = true;
      try {
        const { data } = await api.post("/auth/refresh");

        /* accept either field name */
        const newTk = data.accessToken || data.token;
        if (!newTk) throw new Error("refresh: token missing");

        setToken(newTk);
        flushQueue(null, newTk);

        original.headers.Authorization = `Bearer ${newTk}`;
        return api(original);
      } catch (e) {
        flushQueue(e, null);
        setToken(null); // force logout locally
        window.location.href = "/signin";
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

/* 4. Optional React hook ------------------------------------------- */
export function useApi() {
  return useMemo(() => api, []);
}
