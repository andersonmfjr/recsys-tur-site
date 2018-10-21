import axios from "axios";

const api = axios.create({
  baseURL: "https://api.recsys.cpsoftware.com.br/"
});

export default api;
