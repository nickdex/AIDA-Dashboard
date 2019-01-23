import axios from 'axios';

export const httpClient = axios.create({
  baseURL: process.env.VUE_APP_SERVER_URL
});

export const all = requests => axios.all(requests);
export const spread = callback => axios.spread(callback);
