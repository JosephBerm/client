import axios from 'axios';

const Axios = axios.create({
  baseURL: process.env.API_URL, // Set your base URL here
});

export default Axios;