import axios from 'axios';
import Client from '../models/Client';
import { MY_SERVER } from './env';

export function getClients(access:string) {
  return new Promise <{data:Client[]}> ((resolve) =>
    axios.get(MY_SERVER+'clients/',{headers:{'Authorization':`Bearer ${access}`}})
    .then(res=>resolve({data:res.data})));
}

export function addClient(client:Client,access:string) {
  return new Promise<{data:Client}>((resolve) => 
  axios.post(MY_SERVER+"clients/",client,{headers:{'Authorization':`Bearer ${access}`}})
  .then(res=>resolve({data:res.data})));
}

export function deleteClient(client:Client,access:string) {
  return new Promise<{data:Client}>((resolve) => 
  axios.put(MY_SERVER+"clients/"+client.id,client,{headers:{'Authorization':`Bearer ${access}`}})
  .then(res=>resolve({data:res.data})));
}

export function updateClient(client:Client,access:string) {
  return new Promise<{data:Client}>((resolve) => 
  axios.put(MY_SERVER+"clients/"+client.id,client,{headers:{'Authorization':`Bearer ${access}`}})
  .then(res=>resolve({data:res.data})));
}
