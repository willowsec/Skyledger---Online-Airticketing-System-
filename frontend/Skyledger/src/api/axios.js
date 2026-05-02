//logic flow : user logs in and gets an access token, the token is stored in a variable and added to the header of every request using an interceptor, when the token expires and we get a 401 error, we try to refresh the token and retry the request with the new token
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

let accessToken = null;

export const setToken = (token) => [(accessToken = token)];

//using interceptor to add the token to the header of every  request
api.interceptors.request.use((cfg) => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

//This runs when the access token is expired and we get a 401 error, it will try to refresh the token and retry the request
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      const { data } = await api.get("/auth/refresh");
      setToken(data.accessToken);
      err.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(err.config);
    }
    return Promise.reject(err);
  },
);

export default api;
