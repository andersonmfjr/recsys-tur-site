import axios from "axios";

const api = axios.create({
  baseURL: "http://recsysapi.herokuapp.com/"
});

export default api;
