//logic flow : user logs in and gets an access token, the token is stored in a variable and added to the header of every request using an interceptor, when the token expires and we get a 401 error, we try to refresh the token and retry the request with the new token
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let accessToken = null;

export const setToken = (token) => {
  accessToken = token;
};

//using interceptor to add the token to the header of every  request
api.interceptors.request.use((cfg) => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

//This runs when the access token is expired and we get a 401 error, it will try to refresh the token and retry the request
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const originalRequest = err.config;
    // If 401 and it's not the refresh request itself, try to refresh
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await api.get("/auth/refresh");
        setToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // If refresh fails, clear token and reject
        setToken(null);
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  },
);

export default api;
