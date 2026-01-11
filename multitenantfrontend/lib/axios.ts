import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function fetchBusiness() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/business/me`,
    {
      withCredentials: true, // ✅ THIS is the key
    },
  );

  return res.data;
}
