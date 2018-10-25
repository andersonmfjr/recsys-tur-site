import axios from "axios";

const api = axios.create({
  baseURL: "https://recsysapi.herokuapp.com/"
});

export default api;
