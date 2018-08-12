import axios from 'axios';

export const kvHttp = axios.create({
  baseURL: 'https://api.keyvalue.xyz/'
});

export const httpClient = axios.create({
  baseURL: process.env.SERVER_URL
});

export const all = requests => axios.all(requests);
export const spread = callback => axios.spread(callback);
