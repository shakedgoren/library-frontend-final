import axios from 'axios';
import { MY_SERVER } from './env';
import User from '../models/User';

export function userLogin(user: User) {
  return new Promise<{ data: any }>((resolve, reject) =>
    axios.post(MY_SERVER + "login/", user)
      .then(res => resolve({ data: res.data }))
      .catch(err => reject(err))
  );
}

export function refreshPage(refresh: string) {
  return new Promise<{ data: any }>((resolve, reject) =>
    axios.post(MY_SERVER + "refresh/", { refresh })
      .then(res => resolve({ data: res.data }))
      .catch(err => reject(err))
  );
}
