import axios from 'axios';

export const kvHttp = axios.create({
  baseURL: 'https://api.keyvalue.xyz/'
});

export const all = requests => axios.all(requests);
export const spread = callback => axios.spread(callback);
